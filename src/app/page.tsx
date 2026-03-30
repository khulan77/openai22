// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import ArticleForm from "@/components/ArticleForm";
// import { toast } from "sonner";

// interface Article {
//   id: string;
//   title: string;
//   summary: string;
//   content: string;
//   quizzes?: any[];
//   createdAt: string;
// }

// export default function Home() {
//   const [content, setContent] = useState("");
//   const [title, setTitle] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [savingArticle, setSavingArticle] = useState(false);
//   const [generatingQuiz, setGeneratingQuiz] = useState(false);
//   const [articleLoading, setArticleLoading] = useState(true);
//   const [summary, setSummary] = useState<string | null>(null);
//   const [articles, setArticles] = useState<Article[]>([]);
//   const router = useRouter();

//   const fetchArticles = async () => {
//     try {
//       const response = await fetch("/api/articles");
//       const data = await response.json();
//       setArticles(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Error fetching articles:", error);
//       toast.error("Нийтлэлүүд ачаалахад алдаа гарлаа");
//     } finally {
//       setArticleLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchArticles();
//   }, []);

//   const handleDeleteArticle = async (id: string) => {
//     try {
//       const response = await fetch(`/api/articles/${id}`, {
//         method: "DELETE",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         toast.error(data?.error || "Устгахад алдаа гарлаа");
//         return;
//       }

//       setArticles((prev) => prev.filter((article) => article.id !== id));
//       toast.success("Амжилттай устгалаа");
//     } catch (error) {
//       console.error("Delete error:", error);
//       toast.error("Сервертэй холбогдоход алдаа гарлаа");
//     }
//   };

//   const handleGenerateSummary = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (loading) return;

//     if (!content.trim()) {
//       toast.error("Текстээ оруулна уу");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           text: content,
//           title: title || "Гарчиггүй",
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setSummary(data.summary);
//         toast.success("Summary амжилттай үүслээ!");
//       } else {
//         toast.error(data.error || "Алдаа гарлаа");
//       }
//     } catch (error) {
//       toast.error("Сервертэй холбогдоход алдаа гарлаа");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveArticle = async () => {
//     if (savingArticle) return;

//     if (!summary || !title || !content.trim()) {
//       toast.error("Гарчиг оруулаад, эхлээд Summary үүсгэнэ үү");
//       return;
//     }

//     setSavingArticle(true);

//     try {
//       const saveResponse = await fetch("/api/articles", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title,
//           content,
//           summary,
//           quizzes: [],
//         }),
//       });

//       const data = await saveResponse.json().catch(() => null);

//       if (!saveResponse.ok) {
//         toast.error(data?.error || "Хадгалахад алдаа гарлаа");
//         return;
//       }

//       toast.success("Амжилттай хадгалагдлаа!");
//       await fetchArticles();
//       setTitle("");
//       setContent("");
//       setSummary(null);
//     } catch (error) {
//       console.error("Save error:", error);
//       toast.error("Хадгалахад алдаа гарлаа");
//     } finally {
//       setSavingArticle(false);
//     }
//   };

//   const handleGenerateQuiz = async () => {
//     if (generatingQuiz) return;

//     if (!content.trim()) {
//       toast.error("Текст хоосон байна");
//       return;
//     }

//     setGeneratingQuiz(true);

//     try {
//       const response = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title: title || content.substring(0, 40) + "...",
//           text: content,
//         }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         toast.success("Тест амжилттай үүслээ, шилжиж байна...");
//         router.push(`/quiz/${result.id}`);
//       } else {
//         toast.error(result.error || "Тест үүсгэхэд алдаа гарлаа");
//       }
//     } catch (error) {
//       console.error("Quiz error:", error);
//       toast.error("Хүсэлт явуулахад алдаа гарлаа");
//     } finally {
//       setGeneratingQuiz(false);
//     }
//   };

//   const handleTakeQuizFromHistory = async (articleId: string) => {
//     if (generatingQuiz) return;

//     const selectedArticle = articles.find((article) => article.id === articleId);

//     if (!selectedArticle) {
//       toast.error("Article олдсонгүй");
//       return;
//     }

//     if (selectedArticle.quizzes && selectedArticle.quizzes.length > 0) {
//       const existingQuiz = selectedArticle.quizzes[0];
//       router.push(`/quiz/${existingQuiz.id}`);
//       return;
//     }

//     setGeneratingQuiz(true);

//     try {
//       const response = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title: selectedArticle.title,
//           text: selectedArticle.content,
//           articleId: selectedArticle.id,
//         }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         toast.error(result.error || "Quiz үүсгэхэд алдаа гарлаа");
//         return;
//       }

//       toast.success("Quiz үүсгэлээ");
//       await fetchArticles();
//       router.push(`/quiz/${result.id}`);
//     } catch (error) {
//       console.error("Take quiz error:", error);
//       toast.error("Quiz үүсгэх үед алдаа гарлаа");
//     } finally {
//       setGeneratingQuiz(false);
//     }
//   };

//   return (
//     <div className="flex">
//       <Sidebar
//         articles={articles}
//         loading={articleLoading}
//         onDelete={handleDeleteArticle}
//         onTakeQuiz={handleTakeQuizFromHistory}
//       />

//       <main className="flex-1 min-h-screen p-8 bg-gray-50">
//         <div className="max-w-2xl mx-auto">
//           <ArticleForm
//             title={title}
//             content={content}
//             summary={summary}
//             loading={loading || savingArticle || generatingQuiz}
//             onTitleChange={setTitle}
//             onContentChange={setContent}
//             onGenerateSummary={handleGenerateSummary}
//             onSaveArticle={handleSaveArticle}
//             onGenerateQuiz={handleGenerateQuiz}
//           />
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ArticleForm from "@/components/ArticleForm";
import { toast } from "sonner";

interface Quiz {
  id: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  quizzes?: Quiz[];
  createdAt: string;
}

export default function Home() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [articleLoading, setArticleLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const router = useRouter();

  const saveLockRef = useRef(false);
  const quizLockRef = useRef(false);

  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/articles");
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Нийтлэлүүд ачаалахад алдаа гарлаа");
    } finally {
      setArticleLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDeleteArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || "Устгахад алдаа гарлаа");
        return;
      }

      setArticles((prev) => prev.filter((article) => article.id !== id));
      toast.success("Амжилттай устгалаа");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Сервертэй холбогдоход алдаа гарлаа");
    }
  };

  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

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
      console.error("Summary error:", error);
      toast.error("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticle = async () => {
    if (saveLockRef.current || savingArticle) return;

    if (!summary || !title || !content.trim()) {
      toast.error("Гарчиг оруулаад, эхлээд Summary үүсгэнэ үү");
      return;
    }

    saveLockRef.current = true;
    setSavingArticle(true);

    try {
      const saveResponse = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim(),
          quizzes: [],
        }),
      });

      const data = await saveResponse.json().catch(() => null);

      if (!saveResponse.ok) {
        toast.error(data?.error || "Хадгалахад алдаа гарлаа");
        return;
      }

      toast.success("Амжилттай хадгалагдлаа!");
      await fetchArticles();
      setTitle("");
      setContent("");
      setSummary(null);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Хадгалахад алдаа гарлаа");
    } finally {
      saveLockRef.current = false;
      setSavingArticle(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (quizLockRef.current || generatingQuiz) return;

    if (!content.trim()) {
      toast.error("Текст хоосон байна");
      return;
    }

    quizLockRef.current = true;
    setGeneratingQuiz(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || content.substring(0, 40) + "...",
          text: content,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Тест амжилттай үүслээ, шилжиж байна...");
        router.push(`/quiz/${result.id}`);
      } else {
        toast.error(result.error || "Тест үүсгэхэд алдаа гарлаа");
      }
    } catch (error) {
      console.error("Quiz error:", error);
      toast.error("Хүсэлт явуулахад алдаа гарлаа");
    } finally {
      quizLockRef.current = false;
      setGeneratingQuiz(false);
    }
  };

  const handleTakeQuizFromHistory = async (articleId: string) => {
    if (quizLockRef.current || generatingQuiz) return;

    const selectedArticle = articles.find((article) => article.id === articleId);

    if (!selectedArticle) {
      toast.error("Article олдсонгүй");
      return;
    }

    if (selectedArticle.quizzes && selectedArticle.quizzes.length > 0) {
      router.push(`/quiz/${articleId}`);
      return;
    }

    quizLockRef.current = true;
    setGeneratingQuiz(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedArticle.title,
          text: selectedArticle.content,
          articleId: selectedArticle.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Quiz үүсгэхэд алдаа гарлаа");
        return;
      }

      toast.success("Quiz үүсгэлээ");
      await fetchArticles();
      router.push(`/quiz/${selectedArticle.id}`);
    } catch (error) {
      console.error("Take quiz error:", error);
      toast.error("Quiz үүсгэх үед алдаа гарлаа");
    } finally {
      quizLockRef.current = false;
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar
        articles={articles}
        loading={articleLoading}
        onDelete={handleDeleteArticle}
        onTakeQuiz={handleTakeQuizFromHistory}
      />

      <main className="flex-1 min-h-screen p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <ArticleForm
            title={title}
            content={content}
            summary={summary}
            loading={loading || savingArticle || generatingQuiz}
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