"""
ETL script to extract and pair Apple Support tweets from Kaggle thoughtvector/customer-support-on-twitter.
Streams chunks directly from the Hugging Face dataset mirror and filters for high-quality, informative conversations.
"""

import json
import os
import re
import html
import pandas as pd
from huggingface_hub import HfFileSystem

DATASET_PATH = "datasets/SunidhiSriram/twcs/twcs.csv"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "apple_support_dataset.json")

def clean_tweet_text(text: str) -> str:
    """Clean tweet text, decode HTML entities, and normalize whitespace."""
    if not isinstance(text, str):
        return ""
    # Decode &gt;, &lt;, &amp;
    text = html.unescape(text)
    # Normalize spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def is_meaningful_inquiry(text: str) -> bool:
    """Check if customer tweet is meaningful (not just a link, emoji, or 2 words)."""
    # Remove URLs
    no_urls = re.sub(r'https?://\S+', '', text).strip()
    # Remove mentions
    no_mentions = re.sub(r'@\w+', '', no_urls).strip()
    # Check meaningful length
    if len(no_mentions) < 25:
        return False
    # Check if has at least 4 words
    words = [w for w in no_mentions.split() if len(w) > 1]
    return len(words) >= 4

def extract_apple_conversations(max_conversations: int = 300):
    print(f"Connecting to Hugging Face dataset: {DATASET_PATH}...")
    fs = HfFileSystem()

    inbound_map = {}   # tweet_id -> {text, author_id, created_at}
    apple_replies = [] # list of {reply_id, in_response_to, text, created_at, signoff}

    print("Streaming CSV chunks to extract high-quality @AppleSupport conversations...")
    chunk_size = 50000
    total_processed = 0

    with fs.open(DATASET_PATH, 'rb') as f:
        for chunk_idx, chunk in enumerate(pd.read_csv(f, chunksize=chunk_size, low_memory=False)):
            total_processed += len(chunk)

            # 1. Collect inbound tweets mentioning @AppleSupport
            inbound_mask = (chunk['inbound'] == True) & (chunk['text'].str.contains(r'@AppleSupport', case=False, na=False))
            inbound_tweets = chunk[inbound_mask]
            for _, row in inbound_tweets.iterrows():
                tid = str(row['tweet_id'])
                cleaned = clean_tweet_text(row['text'])
                if is_meaningful_inquiry(cleaned):
                    inbound_map[tid] = {
                        'tweet_id': tid,
                        'customer_handle': f"@{row['author_id']}" if not str(row['author_id']).startswith('@') else str(row['author_id']),
                        'message': cleaned,
                        'created_at': str(row['created_at']),
                    }

            # 2. Collect Apple Support outbound replies
            apple_mask = (chunk['inbound'] == False) & (chunk['author_id'] == 'AppleSupport')
            apple_tweets = chunk[apple_mask]
            for _, row in apple_tweets.iterrows():
                in_response = str(row['in_response_to_tweet_id'])
                if pd.notna(row['in_response_to_tweet_id']) and in_response != 'nan':
                    text = clean_tweet_text(row['text'])
                    # Extract sign-off code if present (e.g. ^AS, ^KM, ^JH)
                    signoff_match = re.search(r'\^([A-Z]{2,3})$', text)
                    signoff = f"^{signoff_match.group(1)}" if signoff_match else "^AS"

                    apple_replies.append({
                        'reply_id': str(row['tweet_id']),
                        'in_response_to_tweet_id': in_response.split('.')[0],
                        'reply_text': text,
                        'created_at': str(row['created_at']),
                        'signoff': signoff,
                    })

            print(f"Chunk {chunk_idx + 1}: Processed {total_processed:,} tweets | Valid Customer Inquiries: {len(inbound_map):,} | Apple Replies: {len(apple_replies):,}")

            # Check matches
            matched_count = sum(1 for r in apple_replies if r['in_response_to_tweet_id'] in inbound_map)
            if matched_count >= max_conversations * 1.5:
                print(f"Target matched threshold achieved ({matched_count} pairs)!")
                break

    # Form clean conversation pairs
    conversations = []
    seen_inbound = set()

    for r in apple_replies:
        in_id = r['in_response_to_tweet_id']
        if in_id in inbound_map and in_id not in seen_inbound:
            cust = inbound_map[in_id]
            # Strip initial @AppleSupport mention for cleaner reading
            clean_customer_msg = re.sub(r'^@AppleSupport\s*', '', cust['message'], flags=re.IGNORECASE).strip()

            # Clean Apple reply mentions
            clean_apple_reply = r['reply_text']

            conversations.append({
                'id': f"tw_{in_id}",
                'tweet_id': in_id,
                'reply_tweet_id': r['reply_id'],
                'customer_handle': cust['customer_handle'],
                'original_message': clean_customer_msg,
                'created_at': cust['created_at'],
                'historical_apple_reply': clean_apple_reply,
                'apple_signoff': r['signoff'],
            })
            seen_inbound.add(in_id)

            if len(conversations) >= max_conversations:
                break

    print(f"\nSuccessfully paired {len(conversations)} high-quality Apple Support conversations!")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(conversations, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(conversations)} conversations to {OUTPUT_FILE}")
    return conversations

if __name__ == "__main__":
    extract_apple_conversations(max_conversations=300)
