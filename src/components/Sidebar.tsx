// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal } from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import SidebarSkeleton from "./SidebarSkeleton";

// interface Article {
//   id: string;
//   title: string;
//   summary: string;
//   createdAt: string;
// }

// interface SidebarProps {
//   articles: Article[];
//   loading?: boolean;
//   onDelete?: (id: string) => void;
// }

// export default function Sidebar({
//   articles,
//   loading = false,
//   onDelete,
// }: SidebarProps) {
//   const router = useRouter();

//   const handleArticleClick = (articleId: string) => {
//     router.push(`/article/${articleId}`);
//   };

//   const handleTakeQuiz = (articleId: string) => {
//     router.push(`/quiz/${articleId}`);
//   };

//   const handleDelete = (articleId: string) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this article?"
//     );

//     if (confirmed) {
//       onDelete?.(articleId);
//     }
//   };

//   return (
//     <div className="h-screen p-4 overflow-y-auto bg-white border-r w-80">
//       <h2 className="mb-4 text-xl font-bold">Article History</h2>

//       <div className="space-y-4">
//         {loading ? (
//           <SidebarSkeleton />
//         ) : articles.length > 0 ? (
//           articles.map((article) => (
//             <Card
//               key={article.id}
//               onClick={() => handleArticleClick(article.id)}
//               className="relative overflow-hidden transition-shadow cursor-pointer group hover:shadow-md"
//             >
//               <div className="absolute z-10 transition-opacity opacity-0 right-3 top-3 group-hover:opacity-100">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="w-8 h-8"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <MoreHorizontal className="w-4 h-4" />
//                     </Button>
//                   </DropdownMenuTrigger>

//                   <DropdownMenuContent align="end">
//                     <DropdownMenuItem
//                       className="text-red-600 focus:text-red-600"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDelete(article.id);
//                       }}
//                     >
//                       Delete
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>

//               <CardHeader className="p-4 pr-12">
//                 <CardTitle className="text-lg line-clamp-2">
//                   {article.title}
//                 </CardTitle>
//                 <p className="text-xs text-gray-500">
//                   {formatDistanceToNow(new Date(article.createdAt), {
//                     addSuffix: true,
//                   })}
//                 </p>
//               </CardHeader>

//               <CardContent className="p-4 pt-0">
//                 <p className="text-sm text-gray-600 line-clamp-3">
//                   {article.summary}
//                 </p>
//               </CardContent>

//               <CardFooter className="flex justify-end p-4 pt-0">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleTakeQuiz(article.id);
//                   }}
//                 >
//                   Take Quiz
//                 </Button>
//               </CardFooter>
//             </Card>
//           ))
//         ) : (
//           <div className="py-8 text-center text-gray-500">
//             <p>No articles yet.</p>
//             <p className="text-sm">Create your first article to get started.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import SidebarSkeleton from "./SidebarSkeleton";

interface Article {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  quizzes?: any[];
}

interface SidebarProps {
  articles: Article[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onTakeQuiz?: (id: string) => void;
}

export default function Sidebar({
  articles,
  loading = false,
  onDelete,
  onTakeQuiz,
}: SidebarProps) {
  const router = useRouter();

  const handleArticleClick = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };

  const handleDelete = (articleId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?",
    );

    if (confirmed) {
      onDelete?.(articleId);
    }
  };

  return (
    <div className="h-screen p-4 overflow-y-auto bg-white border-r w-80">
      <h2 className="mb-4 text-xl font-bold">Article History</h2>

      <div className="space-y-4">
        {loading ? (
          <SidebarSkeleton />
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <Card
              key={article.id}
              onClick={() => handleArticleClick(article.id)}
              className="relative overflow-hidden transition-shadow cursor-pointer group hover:shadow-md"
            >
              <div className="absolute z-10 transition-opacity opacity-0 right-3 top-3 group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(article.id);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="p-4 pr-12">
                <CardTitle className="text-lg line-clamp-2">
                  {article.title}
                </CardTitle>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(article.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {article.summary}
                </p>
              </CardContent>

              <CardFooter className="flex justify-end p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTakeQuiz?.(article.id);
                  }}
                >
                  Take Quiz
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p>No articles yet.</p>
            <p className="text-sm">Create your first article to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
