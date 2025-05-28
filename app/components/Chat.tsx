"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { SendHorizonal } from "lucide-react";
import ReactMarkdown from "react-markdown";

const Chat = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    keepLastMessageOnError: true,
  });

  const chatContainer = useRef<HTMLDivElement>(null);

  const scroll = () => {
    if (chatContainer.current) {
      const { offsetHeight, scrollHeight, scrollTop } = chatContainer.current;
      if (scrollHeight >= scrollTop + offsetHeight) {
        chatContainer.current.scrollTo(0, scrollHeight + 200);
      }
    }
  };

  useEffect(() => {
    scroll();
  }, [messages]);

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center px-4 py-6">
      <div
        ref={chatContainer}
        className="w-full max-w-xl rounded-xl p-4 space-y-4 shadow-lg overflow-y-auto flex-1"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-3 ${m.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            {m.role === "user" ? null : (
              <Image
                className="rounded-full"
                alt="AI avatar"
                width={32}
                height={32}
                src="/ai-avatar.png"
              />
            )}
            <div
              className={`p-3 rounded-lg max-w-xs text-sm ${m.role === "user"
                ? "bg-red-500 text-white"
                : "bg-yellow-400 text-black"
                }`}
            >
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
            {m.role === "user" ? (
              <Image
                className="rounded-full"
                alt="User avatar"
                width={32}
                height={32}
                src="/user-avatar.jpg"
              />
            ) : null}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl mt-4 flex items-center bg-gray-800 rounded-xl p-2 border border-red-400"
      >
        <input
          name="input-field"
          type="text"
          placeholder="Tanyakan sesuatu..."
          onChange={handleInputChange}
          value={input}
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-3"
          autoComplete="off"
        />
        <button type="submit">
          <SendHorizonal className="text-red-400" />
        </button>
      </form>
    </div>
  );
};

export default Chat;