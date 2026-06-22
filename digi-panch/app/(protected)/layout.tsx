import Link from "next/link";
import { FloatingAssistantButton } from "@/app/components/FloatingAssistantButton";

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
    <div className="flex h-screen bg-[#fdfdfc] pt-20 relative"> 
      {/* The global Navbar handles navigation. */}
      <main className="flex-1 overflow-y-auto px-2 py-4 sm:p-4 md:p-8 w-full">
        {children}
      </main>
      
      {/* Floating AI Assistant Button */}
      {showChatbot && <FloatingAssistantButton />}
    </div>
  );
}
