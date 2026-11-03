"use client";

import { useSessionUser } from "@/components/session-user";
import LoadingState from "@/components/primitives/LoadingState";
import PromptBar from "@/components/primitives/PromptBar";
import StreamingText, {
  type StreamingToken,
} from "@/components/primitives/StreamingText";
import { useMemo, useRef, useState } from "react";

const API_BASE_URL = "http://localhost:8000";
const MAX_HISTORY = 10;

type Role = "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
  streaming?: boolean;
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
      past_messages: pastMessages.map(({ role, content }) => ({ role, content })),
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
      messages: [{ role: message.role, content: message.content }],
    }),
  });
}

function toTokens(text: string): StreamingToken[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ text: word }));
}

export default function ChatPage() {
  const { accessToken } = useSessionUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Cortex is live. Tell me facts about yourself — I’ll store them and use them next time.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastTenMessages = useMemo(
    () =>
      messages
        .filter((m) => !m.streaming)
        .slice(-MAX_HISTORY)
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function handleSend(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isSending) return;

    setErrorText("");
    setIsSending(true);

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((previous) => [...previous, userMessage]);

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    try {
      const { answer } = await postChat(accessToken, trimmed, lastTenMessages);
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: answer, streaming: true },
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
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  return (
    <section className="cortex-panel flex h-full min-h-[70vh] flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <article
              key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
              className={`max-w-[92%] md:max-w-[78%] ${isUser ? "ml-auto" : "mr-auto"}`}
              style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both" }}
            >
              <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
                {isUser ? "You" : "Cortex"}
              </p>
              {isUser ? (
                <div className="rounded-[14px] bg-accent-tint px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink shadow-hairline">
                  {message.content}
                </div>
              ) : message.streaming ? (
                <StreamingText
                  content={toTokens(message.content)}
                  sources={[]}
                  followUps={[]}
                  loop={false}
                  fill
                  onDone={() => {
                    setMessages((previous) =>
                      previous.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, streaming: false }
                          : item,
                      ),
                    );
                  }}
                />
              ) : (
                <p className="text-[13.5px] leading-relaxed text-ink">
                  {message.content}
                </p>
              )}
            </article>
          );
        })}

        {isSending ? (
          <div className="mr-auto">
            <LoadingState variant="Drive" label="Recalling memories" />
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line px-3 py-3 md:px-5 md:py-4">
        <PromptBar
          demo={false}
          placeholder="Ask Cortex anything…"
          onSend={handleSend}
        />
        {errorText ? (
          <p className="mt-2 text-[12px] font-medium text-red">{errorText}</p>
        ) : (
          <p className="mt-2 text-[11.5px] text-ink-3">
            Memories write in the background — wait a few seconds before asking about a new fact.
          </p>
        )}
      </div>
    </section>
  );
}
