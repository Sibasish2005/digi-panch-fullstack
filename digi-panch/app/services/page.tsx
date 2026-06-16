"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/app/components/landing-page/navbar/navbar";
import Footer from "@/app/components/landing-page/footer/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const servicesList = [
    {
      id: "ai-assistant",
      title: "Panchayat Assistant (AI)",
      description: "Get instant AI-driven assistance for certificates, schemes, land records, and citizen services 24/7.",
      icon: <Bot className="h-6 w-6 text-blue-600" />,
      colorClass: "bg-blue-100",
      link: "/chatbot"
    },
    {
      id: "documents",
      title: "Digital Certificates",
      description: "Apply for income, caste, birth, and residential certificates securely through our online portal.",
      icon: <FileText className="h-6 w-6 text-indigo-600" />,
      colorClass: "bg-indigo-100",
      link: "/citizen/applications"
    },
    {
      id: "grievances",
      title: "Grievance System",
      description: "Submit issues regarding infrastructure, sanitation, or administration and track them in real-time.",
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
      colorClass: "bg-red-100",
      link: "/citizen/grievances"
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-grow pb-24">
        {/* HEADER SECTION */}
        <section className="relative overflow-hidden bg-slate-900 px-6 py-24 text-white">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"></div>

          <div className="relative mx-auto max-w-4xl text-center">
            <Badge className="border border-white/10 bg-white/10 px-4 py-2 text-cyan-200">
              Our Services
            </Badge>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 text-4xl md:text-5xl font-bold leading-tight"
            >
              Comprehensive Services for <br className="hidden md:block" />
              <span className="text-cyan-400">Rural Citizens</span>
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
                  <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden flex flex-col">
                    <CardHeader className="pb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${service.colorClass}`}>
                        {service.icon}
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow">
                      <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                        {service.description}
                      </p>
                      
                      <Link href={service.link}>
                        <Button variant="outline" className="w-full justify-between group">
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
