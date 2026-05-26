"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Home, FileText, MessageSquare, ListTodo, Users, Activity, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Show, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "CITIZEN";

  const citizenLinks = [
    { name: 'Dashboard', href: '/citizen', icon: Home },
    { name: 'Apply for Document', href: '/citizen/apply', icon: FileText },
    { name: 'My Applications', href: '/citizen/applications', icon: ListTodo },
    { name: 'Grievances', href: '/citizen/grievances', icon: MessageSquare },
  ];

  const officerLinks = [
    { name: 'Pending Queue', href: '/officer', icon: ListTodo },
    { name: 'Grievances', href: '/officer/grievances', icon: MessageSquare },
  ];

  const adminLinks = [
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Document Types', href: '/admin/document-types', icon: FileText },

  ];

  let authenticatedLinks = citizenLinks;
  if (role === 'OFFICER') {
    authenticatedLinks = officerLinks;
  }
  if (role === 'ADMIN') {
    authenticatedLinks = adminLinks;
  }

  const publicLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about-us' },
    { name: 'Contact', href: '/contact-us' },
  ];

  const renderDesktopLinks = () => (
    <ul className="hidden items-center lg:flex">
      <Show when="signed-out">
        <div className="flex items-center gap-6 xl:gap-8">
          {publicLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
            return (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  className={cn(
                    "text-[15px] xl:text-base font-semibold transition hover:scale-105 inline-block",
                    isActive ? "text-blue-600" : "text-slate-700 hover:text-blue-600"
                  )}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </div>
      </Show>

      <Show when="signed-in">
        <div className="flex items-center gap-3 xl:gap-5">
          {publicLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
            return (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  className={cn(
                    "text-[13px] font-medium transition",
                    isActive ? "text-blue-600" : "text-slate-700 hover:text-blue-600"
                  )}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
          
          <div className="h-4 w-px bg-slate-200 mx-1 hidden xl:block"></div>
          {authenticatedLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
            return (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  className={cn(
                    "text-[13px] font-medium transition flex items-center gap-1.5",
                    isActive ? "text-blue-600" : "text-slate-700 hover:text-blue-600"
                  )}
                >
                  <link.icon className="h-3.5 w-3.5 hidden xl:block" />
                  {link.name}
                </Link>
              </li>
            )
          })}
        </div>
      </Show>
    </ul>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex-1 flex items-center justify-start">
          <Link href="/">
            <h1 className="cursor-pointer select-none text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Digi<span className="text-blue-600">Panch</span>
              <Show when="signed-in">
                <span className="hidden sm:inline-block text-[10px] sm:text-xs text-white bg-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  {role}
                </span>
              </Show>
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-none items-center justify-center">
          {renderDesktopLinks()}
        </div>

        {/* Desktop Auth */}
        <div className="hidden lg:flex flex-1 items-center justify-end gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button className="rounded-xl bg-blue-600 px-6 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20">
                Get Started
              </Button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" className="flex items-center gap-1.5 rounded-xl text-slate-700 hover:bg-slate-100 px-3 py-1.5 h-auto text-[13px]">
                  <User size={16} />
                  <span className="hidden xl:inline-block">Profile</span>
                </Button>
              </Link>
              <SignOutButton>
                <Button variant="outline" className="flex items-center gap-1.5 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-3 py-1.5 h-auto text-[13px]">
                  <LogOut size={16} />
                  <span className="hidden xl:inline-block">Sign Out</span>
                </Button>
              </SignOutButton>
            </div>
          </Show>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-800 p-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-200 bg-white lg:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-6 max-h-[calc(100vh-80px)] overflow-y-auto">
              {publicLinks.map(link => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "block px-4 py-3 text-[14px] font-medium rounded-lg transition-colors",
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <Show when="signed-in">
                {authenticatedLinks.map(link => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-[14px] font-medium rounded-lg transition-colors",
                        isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.name}
                    </Link>
                  )
                })}
              </Show>

              <Show when="signed-out">
                <div className="mt-4 border-t border-slate-100 pt-4 px-2">
                  <SignInButton mode="modal">
                    <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                      Log-in / Register
                    </Button>
                  </SignInButton>
                </div>
              </Show>

              <Show when="signed-in">
                <div className="mt-4 border-t border-slate-100 pt-4 px-2">
                  <div className="flex flex-col gap-3">
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full flex justify-start items-center gap-3 rounded-xl border-slate-200">
                        <User size={18} />
                        My Profile
                      </Button>
                    </Link>
                    <SignOutButton>
                      <Button variant="ghost" className="w-full flex justify-start items-center gap-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50">
                        <LogOut size={18} />
                        Sign Out
                      </Button>
                    </SignOutButton>
                  </div>
                </div>
              </Show>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
