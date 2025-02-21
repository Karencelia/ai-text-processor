"use client";

import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      text: inputText,
      language: "Detecting...",
      summary: "",
      translatedText: "",
    };
    setMessages([...messages, newMessage]);
    setInputText("");

    detectLanguage(inputText, messages.length);
  };

  const detectLanguage = async (text, index) => {
    try {
      if (typeof self.ai?.languageDetector?.create !== "function") {
        console.error("Language Detector API not supported or not initialized.");
        return;
      }

      const detector = await self.ai.languageDetector.create();
      const result = await detector.detect(text);
      const language = result?.languages?.[0]?.language || "Unknown";

      updateMessage(index, "language", language);
    } catch (error) {
      console.error("Language detection failed", error);
    }
  };

  const summarizeText = async (text, index) => {
    try {
      const response = await fetch("https://chrome-ai-api.com/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      updateMessage(index, "summary", data.summary);
    } catch (error) {
      console.error("Summarization failed", error);
    }
  };

  const translateText = async (text, index, targetLang) => {
    try {
      const response = await fetch("https://chrome-ai-api.com/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang }),
      });
      const data = await response.json();
      updateMessage(index, "translatedText", data.translation);
    } catch (error) {
      console.error("Translation failed", error);
    }
  };

  const updateMessage = (index, key, value) => {
    setMessages((prev) => {
      const updatedMessages = [...prev];
      updatedMessages[index] = { ...updatedMessages[index], [key]: value };
      return updatedMessages;
    });
  };

  return (
    <div className="flex flex-col h-screen p-4 max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto border p-4 rounded bg-gray-100">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4 p-3 bg-white rounded shadow">
            <p className="text-lg">{msg.text}</p>
            <p className="text-sm text-gray-500">Language: {msg.language}</p>
            {msg.summary && (
              <p className="text-sm mt-2 text-blue-500">Summary: {msg.summary}</p>
            )}
            <div className="mt-2 flex space-x-2">
              {msg.language === "en" && msg.text.length > 150 && (
                <button
                  className="p-2 bg-green-500 text-white rounded"
                  onClick={() => summarizeText(msg.text, index)}
                >
                  Summarize
                </button>
              )}
              <select
                className="p-2 border rounded"
                onChange={(e) =>
                  translateText(msg.text, index, e.target.value)
                }
              >
                <option value="">Select Language</option>
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
                <option value="es">Spanish</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
                <option value="fr">French</option>
              </select>
            </div>
            {msg.translatedText && (
              <p className="text-sm mt-2 text-red-500">
                Translated: {msg.translatedText}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex mt-4 border p-2 rounded bg-white">
        <textarea
          className="flex-1 p-2 border rounded resize-none"
          rows="2"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your text here..."
        ></textarea>
        <button
          className="ml-2 p-2 bg-blue-500 text-white rounded"
          onClick={handleSend}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
