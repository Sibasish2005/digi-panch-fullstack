"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";

import {
  ShieldCheck,
  Bot,
  Landmark,
  Users,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="w-full bg-[#fdfdfc]">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0f2a5e] px-6 py-28 text-white">

        <div className="relative mx-auto max-w-6xl text-center">

          {/* Badge */}
          <Badge variant="outline" className="border-[#c8a96e] px-4 py-2 text-[#c8a96e] font-semibold uppercase tracking-widest rounded-none bg-transparent hover:bg-transparent">
            About DigiPanch
          </Badge>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ fontFamily: "var(--font-noto-serif)" }}
            className="mt-8 text-4xl font-black leading-tight md:text-6xl text-white"
          >
            Building Smarter Digital Governance
          </motion.h1>

          {/* Description */}
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-slate-300">
            DigiPanch is a modern Panchayat governance platform
            focused on digitizing citizen services, grievance
            systems, document applications, and payment
            infrastructure through AI-powered solutions.
          </p>

          {/* Back Button */}
          <Link href="/">

            <Button
              className="mt-8 rounded-[4px] bg-transparent border border-white/55 text-white hover:bg-white/10 transition-colors"
            >
              ← Back to Homepage
            </Button>

          </Link>

        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="px-6 py-24">

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >

            <Badge variant="outline" className="border-[#c8a96e] text-[#c8a96e] uppercase tracking-widest rounded-none bg-transparent font-semibold">
              Our Vision
            </Badge>

            <h2 style={{ fontFamily: "var(--font-noto-serif)" }} className="mt-6 text-4xl font-black text-[#0f2a5e]">
              Simplifying Rural Administration
            </h2>

            <p className="mt-6 leading-relaxed text-slate-600">
              DigiPanch aims to modernize Panchayat operations
              through digital infrastructure that improves
              transparency, accessibility, and efficiency for
              both citizens and administrators.
            </p>

            <p className="mt-4 leading-relaxed text-slate-600">
              The platform is designed to reduce paperwork,
              simplify public services, digitize workflows,
              and provide secure online systems for governance
              operations.
            </p>

          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >

            <div className="overflow-hidden rounded-sm border border-slate-200 shadow-sm p-1 bg-white">

              <Image
                src="/images/about/about-main.jpg"
                alt="About DigiPanch"
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />

            </div>

          </motion.div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 pb-24">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <Badge variant="outline" className="border-[#c8a96e] text-[#c8a96e] uppercase tracking-widest rounded-none bg-transparent font-semibold">
              Platform Features
            </Badge>

            <h2 style={{ fontFamily: "var(--font-noto-serif)" }} className="mt-5 text-4xl font-black text-[#0f2a5e]">
              Core Digital Services
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Intelligent governance tools designed to support
              citizens, Panchayat officials, and digital
              administration systems.
            </p>

          </div>

          {/* Cards */}
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* Card 1 */}
            <Card className="rounded-sm border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-7">
                <div className="w-fit rounded-sm bg-slate-100 p-4">
                  <Bot className="h-6 w-6 text-[#0f2a5e]" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-[#0f2a5e]">
                  AI Assistance
                </h3>
                <p className="mt-4 leading-relaxed text-slate-600">
                  AI-powered support system for citizen
                  queries, guidance, and governance services.
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="rounded-sm border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-7">
                <div className="w-fit rounded-sm bg-slate-100 p-4">
                  <FileText className="h-6 w-6 text-[#0f2a5e]" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-[#0f2a5e]">
                  Digital Applications
                </h3>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Online application systems for certificates,
                  approvals, and Panchayat documentation.
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="rounded-sm border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-7">
                <div className="w-fit rounded-sm bg-slate-100 p-4">
                  <ShieldCheck className="h-6 w-6 text-[#0f2a5e]" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-[#0f2a5e]">
                  Grievance System
                </h3>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Transparent complaint submission and
                  tracking infrastructure for citizens.
                </p>
              </CardContent>
            </Card>

            {/* Card 4 */}
            <Card className="rounded-sm border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-7">
                <div className="w-fit rounded-sm bg-slate-100 p-4">
                  <Landmark className="h-6 w-6 text-[#0f2a5e]" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-[#0f2a5e]">
                  Online Payments
                </h3>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Secure payment systems for water bills,
                  taxes, and governance-related services.
                </p>
              </CardContent>
            </Card>

            {/* Card 5 */}
            <Card className="rounded-sm border border-slate-200 shadow-sm bg-white">
              <CardContent className="p-7">
                <div className="w-fit rounded-sm bg-slate-100 p-4">
                  <Users className="h-6 w-6 text-[#0f2a5e]" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-[#0f2a5e]">
                  Citizen Services
                </h3>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Digital systems designed to improve
                  accessibility and user experience.
                </p>
              </CardContent>
            </Card>

            {/* Card 6 */}
            <Card className="rounded-sm border border-slate-200 shadow-sm bg-white">
              <CardContent className="flex h-full flex-col justify-between p-7">
                <div>
                  <div className="w-fit rounded-sm bg-slate-100 p-4">
                    <ArrowRight className="h-6 w-6 text-[#0f2a5e]" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-[#0f2a5e]">
                    Future Expansion
                  </h3>
                  <p className="mt-4 leading-relaxed text-slate-600">
                    Expanding digital infrastructure for
                    modern governance and rural development.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 pb-24">

        <div className="mx-auto max-w-6xl">

          <Card className="overflow-hidden rounded-sm border-none bg-[#0f2a5e] text-white shadow-2xl">

            <CardContent className="px-8 py-16 text-center md:px-16">

              <Badge variant="outline" className="border-[#c8a96e] bg-transparent text-[#c8a96e] hover:bg-transparent uppercase tracking-widest font-semibold rounded-none">
                Digital Governance
              </Badge>

              <h2 style={{ fontFamily: "var(--font-noto-serif)" }} className="mt-6 text-4xl font-black text-white">
                Empowering Smarter Panchayat Systems
              </h2>

              <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-slate-300">
                DigiPanch is focused on building accessible,
                transparent, and intelligent governance
                infrastructure for modern rural administration.
              </p>

            </CardContent>
          </Card>

        </div>
      </section>

      <Separator />

    </main>
  );
}