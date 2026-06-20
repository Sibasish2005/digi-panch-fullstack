import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchAPI } from "@/lib/api-client";
import { ChevronLeft } from "lucide-react";

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = await params;
  let newsItem = null;
  
  try {
    // Note: We use the public endpoint directly, bypassing the need for a token.
    // If there is no specific /news/:id endpoint for public, we can fetch all active and find it.
    // Assuming /news fetches all news (or active only) in the backend.
    const data = await fetchAPI('/news?active_only=true');
    newsItem = data.find((n: any) => n.id === unwrappedParams.id);
  } catch (error) {
    console.error("Failed to load news article", error);
  }

  if (!newsItem) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">Article Not Found</h1>
        <p className="text-gray-500 mt-2 mb-6">This news item might have been removed or deactivated.</p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden">
        
        {/* Header Image */}
        <div className="relative w-full h-64 md:h-96">
          <Image 
            src={newsItem.image_url || newsItem.image} 
            alt={newsItem.title} 
            fill 
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="p-6 md:p-10">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                {newsItem.category}
              </Badge>
              <span className="text-sm text-gray-500 font-medium">
                {newsItem.published_date}
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight font-inter mb-6">
            {newsItem.title}
          </h1>

          <p className="text-lg md:text-xl text-gray-600 font-medium mb-8 leading-relaxed">
            {newsItem.description}
          </p>

          <hr className="mb-8 border-gray-100" />

          <div className="prose prose-lg max-w-none text-gray-800">
            {newsItem.content ? (
              // Split by newline and render paragraphs
              newsItem.content.split('\n').map((paragraph: string, idx: number) => (
                <p key={idx} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">No additional details available for this article.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
