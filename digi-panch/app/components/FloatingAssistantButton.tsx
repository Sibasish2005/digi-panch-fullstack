'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export function FloatingAssistantButton() {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Constraints area for dragging - covers the whole screen */}
      <div 
        ref={constraintsRef} 
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden" 
      />
      
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ x: 0, y: 0 }}
        style={{ touchAction: "none" }}
        className="fixed bottom-8 right-8 z-50 cursor-grab active:cursor-grabbing"
      >
        {/* We use pointer-events-auto to re-enable clicks inside the draggable area */}
        <Link 
          href="/chatbot" 
          className="pointer-events-auto flex items-center gap-2 bg-[#0f2a5e] hover:bg-[#0a1e46] text-white px-5 py-3 rounded-[4px] shadow-lg hover:shadow-xl transition-colors duration-300 font-medium"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          <Bot className="h-5 w-5" />
          AI Assistant
        </Link>
      </motion.div>
    </>
  );
}
