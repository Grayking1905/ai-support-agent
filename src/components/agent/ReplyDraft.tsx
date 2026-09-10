import { useState } from 'react'
import { Copy, CheckCheck, Edit2, Sparkles } from 'lucide-react'

interface ReplyDraftProps {
  reply: string
  ragSourcesUsed?: number
  processingTimeMs?: number
}

export default function ReplyDraft({ reply, ragSourcesUsed = 0, processingTimeMs }: ReplyDraftProps) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedReply, setEditedReply] = useState(reply)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedReply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/[0.02] border-b border-black/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#0071e3] text-white flex items-center justify-center">
            <Sparkles size={11} />
          </div>
          <span className="text-xs font-semibold text-[#1d1d1f]">
            Drafted Response
          </span>
          {ragSourcesUsed > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#0071e3]/10 text-[#0071e3]">
              {ragSourcesUsed} Grounded Citations
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#424245] bg-white border border-black/[0.1] hover:border-black/[0.2] transition-all cursor-pointer"
          >
            <Edit2 size={11} />
            <span>{editing ? 'Done' : 'Edit'}</span>
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
              copied
                ? 'bg-[#34c759]/10 border-[#34c759]/30 text-[#248a3d]'
                : 'bg-white border-black/[0.1] text-[#424245] hover:border-black/[0.2]'
            }`}
          >
            {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {editing ? (
          <textarea
            value={editedReply}
            onChange={(e) => setEditedReply(e.target.value)}
            className="w-full min-h-[100px] p-3 text-xs sm:text-sm text-[#1d1d1f] bg-[#f5f5f7] border border-[#0071e3] rounded-xl outline-none leading-relaxed resize-y"
          />
        ) : (
          <p className="text-xs sm:text-sm text-[#1d1d1f] font-normal leading-relaxed">
            {editedReply}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/[0.02] border-t border-black/[0.04] text-[11px] text-[#86868b]">
        <span>Apple Support Signature (^AS)</span>
        {processingTimeMs && <span>Generated in {processingTimeMs}ms</span>}
      </div>
    </div>
  )
}
