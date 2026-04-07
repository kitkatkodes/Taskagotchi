import { useState } from "react";

export default function PetChatBox({ messages, onSend }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true);
    await onSend(msg);
    setText("");
    setSending(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft p-5">
      <h2 className="text-lg font-bold text-pink-500">Pet Chat</h2>
      <p className="text-xs text-gray-500 mt-1">Character-style companion chat with fallback AI mode.</p>
      <div className="mt-3 h-56 overflow-auto rounded-xl bg-pink-50 p-3 space-y-2">
        {(messages || []).map((m) => (
          <div
            key={m.id || `${m.role}-${m.content}`}
            className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-sky text-sky-800" : "bg-white text-pink-700"}`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border border-pink-100 rounded-xl p-2"
          value={text}
          placeholder="Talk to your pet..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button className="rounded-xl bg-pink-400 text-white px-4 disabled:opacity-50" disabled={sending} onClick={submit}>
          Send
        </button>
      </div>
    </div>
  );
}
