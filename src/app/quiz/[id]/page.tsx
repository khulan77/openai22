"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  articleId: string;
  question: string;
  options: string[];
  answer: number;
  createdAt: string;
  updatedAt: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  quizzes: Question[];
}

interface UserScore {
  id: string;
  userId: string;
  score: number;
  createdAt: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const quizId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    {}
  );
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousScores, setPreviousScores] = useState<UserScore[]>([]);
  const [showPreviousScores, setShowPreviousScores] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!quizId) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/articles/${quizId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }

        const data = await response.json();

        if (!data.quizzes || data.quizzes.length === 0) {
          const quizResponse = await fetch("/api/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: data.title,
              text: data.content,
              articleId: data.id,
            }),
          });

          if (!quizResponse.ok) {
            throw new Error("Failed to generate quiz");
          }

          const refreshedResponse = await fetch(`/api/articles/${quizId}`);

          if (!refreshedResponse.ok) {
            throw new Error("Failed to fetch updated article");
          }

          const refreshedData = await refreshedResponse.json();
          setArticle(refreshedData);
        } else {
          setArticle(data);
        }
      } catch (error) {
        console.error("Error:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [quizId]);

  useEffect(() => {
    const fetchPreviousScores = async () => {
      if (!article) return;

      try {
        const response = await fetch(`/api/scores?articleId=${article.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch previous scores");
        }

        const data = await response.json();
        setPreviousScores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching previous scores:", error);
      }
    };

    fetchPreviousScores();
  }, [article]);

  useEffect(() => {
    if (article && !showResults) {
      setStartTime(Date.now());
    }
  }, [article, showResults]);

  const getTimeSpent = () => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScoreValue = () => {
    if (!article || !article.quizzes || article.quizzes.length === 0) return 0;

    let correctAnswers = 0;

    article.quizzes.forEach((question) => {
      if (selectedAnswers[question.id] === Number(question.answer)) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / article.quizzes.length) * 100);
  };

  const handleNextQuestion = () => {
    if (!article || !article.quizzes || article.quizzes.length === 0) return;

    if (currentQuestionIndex < article.quizzes.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    const finalScore = calculateScoreValue();
    setScore(finalScore);
    setShowResults(true);
  };

  const handleSubmitScore = async () => {
    if (
      !article ||
      !article.quizzes ||
      article.quizzes.length === 0 ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const timeSpent = getTimeSpent();
      const finalScore = calculateScoreValue();

      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId: article.id,
          score: finalScore,
          timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save score");
      }

      toast.success("Score saved successfully!");

      // score хадгалсны дараа Home руу буцаана
      router.replace("/");
    } catch (error) {
      console.error("Error saving score:", error);
      toast.error("Failed to save score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setShowResults(false);
    setShowPreviousScores(false);
    setStartTime(Date.now());
  };

  const handleGoHome = () => {
    router.replace("/");
  };

  const togglePreviousScores = () => {
    setShowPreviousScores((prev) => !prev);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Loading quiz...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error || "Article not found"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleGoHome} className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!article.quizzes || article.quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">No Quiz Available</CardTitle>
            <CardDescription>
              This article doesn't have a quiz yet.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleGoHome} className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = article.quizzes[currentQuestionIndex];
const progress =
  article.quizzes.length > 1
    ? (currentQuestionIndex / (article.quizzes.length - 1)) * 100
    : 0;
const isLastQuestion = currentQuestionIndex === article.quizzes.length - 1;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{article.title}</CardTitle>
            <CardDescription>
              {showResults
                ? "Quiz completed!"
                : `Question ${currentQuestionIndex + 1} of ${
                    article.quizzes.length
                  }`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!showResults && <Progress value={progress} className="h-2" />}

            {!showResults ? (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {currentQuestion.question}
                  </h3>

                  <RadioGroup
                    value={
                      selectedAnswers[currentQuestion.id]?.toString() || ""
                    }
                    onValueChange={(value) =>
                      handleAnswerSelect(currentQuestion.id, parseInt(value))
                    }
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${currentQuestion.id}-${index}`}
                        />
                        <Label htmlFor={`option-${currentQuestion.id}-${index}`}>
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestion.id] === undefined}
                  >
                    {isLastQuestion ? "Finish Quiz" : "Next Question"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="mb-2 text-2xl font-bold">Quiz Completed!</h3>
                  <p className="text-lg">Your score: {score}%</p>
                </div>

                {!showPreviousScores ? (
                  <>
                    <div className="space-y-4">
                      {article.quizzes.map((question, index) => {
                        const userAnswer = selectedAnswers[question.id];
                        const correctAnswer = Number(question.answer);
                        const isCorrect = userAnswer === correctAnswer;

                        return (
                          <div key={question.id} className="space-y-2">
                            <div className="flex items-start gap-2">
                              {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 mt-1 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 mt-1 text-red-500" />
                              )}

                              <div>
                                <p className="font-medium">
                                  Question {index + 1}: {question.question}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Your answer:{" "}
                                  {userAnswer !== undefined
                                    ? question.options[userAnswer]
                                    : "No answer selected"}
                                </p>
                                {!isCorrect && (
                                  <p className="text-sm text-green-600">
                                    Correct answer:{" "}
                                    {question.options[correctAnswer]}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button variant="outline" onClick={handleRestartQuiz}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restart Quiz
                      </Button>

                      <Button
                        variant="outline"
                        onClick={togglePreviousScores}
                      >
                        View History
                      </Button>

                      <Button
                        onClick={handleSubmitScore}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save Score & Finish"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">
                        Your Quiz History
                      </h3>
                      <Button variant="outline" onClick={togglePreviousScores}>
                        Back to Results
                      </Button>
                    </div>

                    {previousScores.length > 0 ? (
                      <div className="space-y-4">
                        {previousScores.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                Attempt {previousScores.length - index}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(item.createdAt)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xl font-bold">
                                {item.score}%
                              </p>
                              {index > 0 && (
                                <p
                                  className={`text-sm ${
                                    item.score > previousScores[index - 1].score
                                      ? "text-green-500"
                                      : item.score <
                                        previousScores[index - 1].score
                                      ? "text-red-500"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {item.score > previousScores[index - 1].score
                                    ? "↑ Improved"
                                    : item.score <
                                      previousScores[index - 1].score
                                    ? "↓ Decreased"
                                    : "→ Same"}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p>No previous scores found.</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-4 mt-6">
                      <Button variant="outline" onClick={handleRestartQuiz}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Take Quiz Again
                      </Button>
                      <Button onClick={handleGoHome}>
                        <Home className="w-4 h-4 mr-2" />
                        Go to Home
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}