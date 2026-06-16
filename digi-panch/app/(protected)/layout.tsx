import Link from "next/link";
import { Bot } from "lucide-react";

import { auth, currentUser } from "@clerk/nextjs/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) || "USER";
  
  // Only show chatbot for citizens
  const showChatbot = role === "USER" || role === "CITIZEN";

  return (
    <div className="flex h-screen bg-gray-50 pt-[72px] relative"> 
      {/* The global Navbar handles navigation. */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        {children}
      </main>
      
      {/* Floating AI Assistant Button */}
      {showChatbot && (
        <Link 
          href="/chatbot" 
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
        >
          <Bot className="h-5 w-5" />
          AI Assistant
        </Link>
      )}
    </div>
  );
}
