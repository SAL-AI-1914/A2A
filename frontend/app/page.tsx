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
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/api/chat/ws");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.sender === "bot") {
          const updatedMessage = { ...lastMessage, text: lastMessage.text + event.data };
          return [...prev.slice(0, -1), updatedMessage];
        } else {
          const botMessage: Message = { text: event.data, sender: "bot" };
          return [...prev, botMessage];
        }
      });
      if (isSpeaking) {
        const utterance = new SpeechSynthesisUtterance(event.data);
        speechSynthesis.speak(utterance);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsRecording(false);
      };
    }
  }, []);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleMuteClick = () => {
    setIsSpeaking(!isSpeaking);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    socket.send(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-sal-dark text-sal-light">
      <header className="bg-sal-blue p-4 shadow-md flex justify-between items-center">
        <div className="w-8"></div> {/* Placeholder for spacing */}
        <h1 className="text-2xl font-bold text-sal-gold text-center">
          SAL AI
        </h1>
        <button
          onClick={handleMuteClick}
          className="p-2 rounded-full text-sal-gold hover:bg-sal-dark"
        >
          {isSpeaking ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 17.142a5 5 0 010-7.072m2.828 9.9a9 9 0 010-12.728" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707a1 1 0 011.414 0L17.414 9H19a1 1 0 011 1v4a1 1 0 01-1 1h-1.586l-4.707 4.707a1 1 0 01-1.414 0L5.586 15z" />
            </svg>
          )}
        </button>
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
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="bg-sal-blue p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center">
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2 rounded-l-lg ${isRecording ? 'bg-red-500' : 'bg-sal-gold'} text-sal-dark hover:bg-opacity-80`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 10v-2m0 0a2 2 0 012 2v2a2 2 0 01-4 0v-2a2 2 0 012-2zM5 11a7 7 0 1114 0" />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SANDY anything..."
              className="flex-1 p-2 bg-sal-light text-sal-dark focus:outline-none focus:ring-2 focus:ring-sal-gold"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sal-gold text-sal-dark font-bold rounded-r-lg hover:bg-opacity-80"
            >
              Send
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
