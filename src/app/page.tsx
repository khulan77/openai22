"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ArticleForm from "@/components/ArticleForm";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string; // Нэмсэн
  quizzes?: any[]; // Нэмсэн
  createdAt: string;
}

export default function Home() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [articleLoading, setArticleLoading] = useState(true);

  const [summary, setSummary] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const router = useRouter();

  // Нийтлэлүүдийг татаж авах функц
  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/articles");
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setArticleLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Сэргийлэлт
    if (!content.trim()) {
      toast.error("Текстээ оруулна уу");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          title: title || "Гарчиггүй",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary);
        toast.success("Summary амжилттай үүслээ!");
      } else {
        toast.error(data.error || "Алдаа гарлаа");
      }
    } catch (error) {
      toast.error("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticle = async () => {
    // 1. Double save-ээс сэргийлэх
    if (loading) return;

    if (!summary || !title) {
      toast.error("Гарчиг оруулаад, эхлээд Summary үүсгэнэ үү");
      return;
    }

    setLoading(true);
    try {
      const saveResponse = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          summary,
          quizzes: [],
        }),
      });

      if (saveResponse.ok) {
        toast.success("Амжилттай хадгалагдлаа!");

        // Датаг дахин татаж History-г шинэчлэх
        await fetchArticles();

        // Form цэвэрлэх
        setTitle("");
        setContent("");
        setSummary(null);
      } else {
        toast.error("Хадгалахад алдаа гарлаа");
      }
    } catch (error) {
      toast.error("Хадгалахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (loading) return;
    if (!content.trim()) {
      toast.error("Текст хоосон байна");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || content.substring(0, 40) + "...",
          text: content,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Тест амжилттай үүслээ, шилжиж байна...");
        router.push(`/quiz/${result.id}`);
      } else {
        const data = await response.json();
        toast.error(data.error || "Тест үүсгэхэд алдаа гарлаа");
      }
    } catch (error) {
      toast.error("Хүсэлт явуулахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar articles={articles} loading={articleLoading} />
      <main className="flex-1 min-h-screen p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <ArticleForm
            title={title}
            content={content}
            summary={summary}
            loading={loading}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onGenerateSummary={handleGenerateSummary}
            onSaveArticle={handleSaveArticle}
            onGenerateQuiz={handleGenerateQuiz}
          />
        </div>
      </main>
    </div>
  );
}
