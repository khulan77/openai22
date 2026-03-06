"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function HomePage() {
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

  return <div>Home</div>;
}
