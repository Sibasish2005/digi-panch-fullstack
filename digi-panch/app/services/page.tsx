"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/app/components/landing-page/navbar/navbar";
import Footer from "@/app/components/landing-page/footer/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { 
  Bot, 
  FileText, 
  AlertCircle, 
  Landmark, 
  Home, 
  Map, 
  Users, 
  Droplet 
} from "lucide-react";

export default function ServicesPage() {
  const { user, isLoaded } = useUser();
  const role = (user?.publicMetadata?.role as string) || "CITIZEN";

  const servicesList = [
    {
      id: "ai-assistant",
      title: "Panchayat Assistant (AI)",
      description: "Get instant AI-driven assistance for certificates, schemes, land records, and citizen services 24/7.",
      icon: <Bot className="h-6 w-6 text-[#0f2a5e]" />,
      colorClass: "bg-slate-100",
      link: "/chatbot"
    },
    {
      id: "documents",
      title: "Digital Certificates",
      description: "Apply for income, caste, birth, and residential certificates securely through our online portal.",
      icon: <FileText className="h-6 w-6 text-[#0f2a5e]" />,
      colorClass: "bg-slate-100",
      link: "/citizen/applications"
    },
    {
      id: "grievances",
      title: "Grievance System",
      description: "Submit issues regarding infrastructure, sanitation, or administration and track them in real-time.",
      icon: <AlertCircle className="h-6 w-6 text-[#0f2a5e]" />,
      colorClass: "bg-slate-100",
      link: "/citizen/grievances"
    }
  ];

  if (isLoaded && user && role !== "CITIZEN" && role !== "USER") {
    return (
      <main className="min-h-screen flex flex-col bg-[#fdfdfc]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6">
          <Card className="max-w-md w-full shadow-lg border-red-100 bg-red-50/30">
            <CardContent className="flex flex-col items-center text-center pt-10 pb-10">
              <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
              <h2 className="text-3xl font-bold text-[#0f2a5e] mb-3">Access Denied</h2>
              <p className="text-slate-600 mb-8">
                The DigiPanch Services portal is strictly reserved for Citizens. As an {role.toLowerCase()}, please use your dedicated dashboard.
              </p>
              <Link href="/">
                <Button className="w-full bg-[#0f2a5e] hover:bg-[#0a1e46] text-white rounded-[4px] h-11">
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#fdfdfc]">
      <Navbar />

      <div className="flex-grow pb-24">
        {/* HEADER SECTION */}
        <section className="relative overflow-hidden bg-[#0f2a5e] px-6 py-24 text-white">

          <div className="relative mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="border border-[#c8a96e] bg-transparent text-[#c8a96e] uppercase tracking-widest rounded-none font-semibold px-4 py-2">
              Our Services
            </Badge>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ fontFamily: "var(--font-noto-serif)" }}
              className="mt-6 text-4xl md:text-5xl font-black leading-tight text-white"
            >
              Comprehensive Services for <br className="hidden md:block" />
              Rural Citizens
            </motion.h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              DigiPanch offers a wide array of digital services designed to bring administration to your fingertips. Explore what we provide below.
            </p>
          </div>
        </section>

        {/* SERVICES GRID */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {servicesList.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-sm bg-white overflow-hidden flex flex-col">
                    <CardHeader className="pb-4">
                      <div className={`w-14 h-14 rounded-sm flex items-center justify-center mb-4 ${service.colorClass}`}>
                        {service.icon}
                      </div>
                      <CardTitle className="text-xl font-bold text-[#0f2a5e]">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                      <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                        {service.description}
                      </p>
                      
                      <Link href={service.link}>
                        <Button variant="outline" className="w-full justify-between group rounded-[4px] border-[#0f2a5e] text-[#0f2a5e] hover:bg-[#0f2a5e]/5">
                          Access Service
                          <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
