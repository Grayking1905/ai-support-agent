"""
Reply generator: uses Groq LLM with RAG context to draft a grounded Apple Support reply.
"""
from groq import Groq
from database import settings

SYSTEM_PROMPT = """You are an expert Apple Support agent responding on Twitter.
You have access to historical Apple Support conversations to ground your reply.

Rules:
- Be concise (Twitter-style: 2-3 sentences max)
- Be empathetic and professional (use Apple Support tone)
- Reference the specific issue clearly
- Provide actionable next steps
- Never promise things Apple cannot deliver
- If you need more info, ask one specific question
- Start with acknowledgment (e.g. "We understand this is frustrating...")
"""

def generate_reply(
    message: str,
    intent: str,
    rag_context: list[dict],
    customer_handle: str = "",
) -> str:
    """
    Generate a grounded reply using Groq LLM + RAG context.
    Returns the drafted reply text.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    # Build context block from RAG results
    context_block = ""
    if rag_context:
        examples = []
        for i, r in enumerate(rag_context[:3], 1):
            if r.get("text") and r.get("score", 0) > 0.4:
                examples.append(f"Example {i} (similarity {r['score']:.2f}):\nCustomer: {r['text']}\nApple Reply: {r.get('reply', '[resolved successfully]')}")
        if examples:
            context_block = "\n\nHistorical context:\n" + "\n\n".join(examples)

    user_content = f"""Customer handle: {customer_handle}
Intent: {intent}
Customer message: {message}
{context_block}

Draft a concise, empathetic Apple Support reply:"""

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.4,
            max_tokens=200,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"We're sorry to hear about this issue. Please DM us your device serial number and we'll get this resolved right away. ^AS"
