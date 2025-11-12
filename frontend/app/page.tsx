"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set initial greeting message
  useEffect(() => {
    setMessages([
      { text: "Hello! I am SANDY, your Strategic AI Networked Dialogue Yield assistant. How can I help you today?", sender: "bot" }
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = { text: data.response, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Failed to fetch from API:", error);
      const errorMessage: Message = {
        text: "Sorry, I'm having trouble connecting to my brain. Please check the backend server.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-sal-dark text-sal-light">
      <header className="bg-sal-blue p-4 shadow-md">
        <h1 className="text-2xl font-bold text-sal-gold text-center">
          SAL AI
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-lg px-4 py-2 rounded-lg shadow ${
                    msg.sender === "user"
                      ? "bg-sal-gold text-sal-dark"
                      : "bg-sal-blue text-sal-light"
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="max-w-lg px-4 py-2 rounded-lg shadow bg-sal-blue text-sal-light">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-sal-gold rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-sal-gold rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-sal-gold rounded-full animate-pulse"></div>
                    </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="bg-sal-blue p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SANDY anything..."
              className="flex-1 p-2 rounded-l-lg bg-sal-light text-sal-dark focus:outline-none focus:ring-2 focus:ring-sal-gold"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sal-gold text-sal-dark font-bold rounded-r-lg hover:bg-opacity-80 disabled:bg-gray-500"
              disabled={isLoading}
            >
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
