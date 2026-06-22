"use client";

import Link from "next/link";

import {
  Mail,
  Globe,
  Phone,
  MapPin,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-[#fdfdfc]">

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Top Section */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">

          {/* Brand */}
          <div>

            <h2 style={{ fontFamily: "var(--font-noto-serif)" }} className="text-2xl font-black text-slate-900 tracking-tight">
              Digi<span className="text-[#0f2a5e]">Panch</span>
            </h2>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              Simplifying Panchayat governance through
              AI-powered digital services, grievance systems,
              and citizen-focused online platforms.
            </p>

          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-6 text-sm text-slate-600">

            <Link
              href="/"
              className="transition hover:text-[#0f2a5e]"
            >
              Home
            </Link>

            <Link
              href="/about-us"
              className="transition hover:text-[#0f2a5e]"
            >
              About
            </Link>

            <Link
              href="/services"
              className="transition hover:text-[#0f2a5e]"
            >
              Services
            </Link>

            <Link
              href="/contact-us"
              className="transition hover:text-[#0f2a5e]"
            >
              Contact
            </Link>

          </div>

          {/* Contact / Icons */}
          <div className="flex items-center gap-3">

            <Button
              size="icon"
              variant="outline"
              className="rounded-[4px] hover:bg-[#0f2a5e] hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="rounded-[4px] hover:bg-[#0f2a5e] hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="rounded-[4px] hover:bg-[#0f2a5e] hover:text-white transition-colors"
            >
              <Globe className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="rounded-[4px] hover:bg-[#0f2a5e] hover:text-white transition-colors"
            >
              <MapPin className="h-4 w-4" />
            </Button>

          </div>

        </div>

        {/* Divider */}
        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 text-center text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 DigiPanch. All rights reserved.
          </p>

          <div className="flex justify-center gap-5">

            <Link
              href="/privacy-policy"
              className="transition hover:text-[#0f2a5e]"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-[#0f2a5e]"
            >
              Terms
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}