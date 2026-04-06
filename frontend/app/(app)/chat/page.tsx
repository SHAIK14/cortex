"use client";

import { useSessionUser } from "@/components/session-user";
import { FormEvent, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:8000";
const MAX_HISTORY = 10;

type Role = "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
};

async function postChat(
  accessToken: string,
  question: string,
  pastMessages: ChatMessage[],
) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      question,
      past_messages: pastMessages,
    }),
  });
  if (!response.ok) {
    throw new Error(`Chat request failed (${response.status})`);
  }

  return (await response.json()) as { answer: string };
}

async function ingestMemory(accessToken: string, message: ChatMessage) {
  await fetch(`${API_BASE_URL}/memories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messages: [message],
    }),
  });
}

export default function ChatPage() {
  const { accessToken } = useSessionUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Cortex is live. Ask anything and I will use your saved memories for context.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState("");

  const lastTenMessages = useMemo(
    () => messages.slice(-MAX_HISTORY),
    [messages],
  );

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = inputValue.trim();
    if (!question || isSending) return;

    setErrorText("");
    setIsSending(true);
    setInputValue("");

    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages((previous) => [...previous, userMessage]);

    try {
      const { answer } = await postChat(accessToken, question, lastTenMessages);
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: answer },
      ]);
      void ingestMemory(accessToken, userMessage);
    } catch {
      setErrorText(
        "Request failed (likely auth/session). Please sign out and sign in again.",
      );
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I could not fetch a response from the server. Please retry in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  }

  return (
    <section className="surface flex h-full min-h-[70vh] flex-col rounded-2xl p-4 md:p-6">
      <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <article
              key={`${message.role}-${index}`}
              className={`max-w-[88%] rounded-2xl px-4 py-3 md:max-w-[74%] ${
                isUser
                  ? "ml-auto border border-blue-200 bg-blue-50 text-slate-900"
                  : "mr-auto border border-slate-200 bg-slate-50 text-slate-900"
              }`}
            >
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                {isUser ? "You" : "Assistant"}
              </p>
              <p className="text-sm leading-relaxed md:text-[15px]">
                {message.content}
              </p>
            </article>
          );
        })}
      </div>

      <form onSubmit={handleSend}>
        <label htmlFor="chat-input" className="sr-only">
          Ask a question
        </label>
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition focus-within:border-slate-300 focus-within:shadow-[0_14px_34px_rgba(15,23,42,0.1)]">
          <div className="flex items-end gap-2">
            <textarea
              id="chat-input"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ask Cortex anything..."
              rows={1}
              className="max-h-36 min-h-11 flex-1 resize-y rounded-xl border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 md:text-[15px]"
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-(--accent) px-4 text-sm font-semibold text-white transition hover:bg-(--accent-strong) disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              {isSending ? "..." : "Send"}
            </button>
          </div>
        </div>
        <p className="mt-2 px-1 text-xs text-slate-500">
          Press Enter to send, Shift+Enter for a new line.
        </p>
        {errorText ? (
          <p className="mt-2 text-xs font-medium text-(--danger)">{errorText}</p>
        ) : null}
      </form>
    </section>
  );
}
