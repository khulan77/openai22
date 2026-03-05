
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function HomePage() {
  // const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!content || !title) return alert("Гарчиг болон текстээ оруулна уу");
    
    setLoading(true);
    try {
      const response = await fetch("/api/article", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          // userId: user?.id, // Clerk-ээс ирж буй ID
        }),
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">AI Article Summarizer ✨</h1>
      
      <input
        className="w-full p-2 border rounded text-black"
        placeholder="Нийтлэлийн гарчиг..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full h-64 p-2 border rounded text-black"
        placeholder="Нийтлэлийн текстээ энд хуулна уу..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={handleSummarize}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? "Уншиж байна..." : "Хураангуйлах"}
      </button>

      {summary && (
        <div className="mt-6 p-4 bg-gray-100 rounded text-black">
          <h2 className="font-bold mb-2">Хураангуй:</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}