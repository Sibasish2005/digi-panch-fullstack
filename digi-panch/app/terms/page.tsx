"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <main className="min-h-screen w-full bg-[#fdfdfc] px-6 py-20">

      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">

          <Link href="/">

            <Button
              variant="outline"
              className="rounded-[4px] border-[#0f2a5e] text-[#0f2a5e] hover:bg-[#0f2a5e]/5"
            >
              ← Back to Homepage
            </Button>

          </Link>

          <h1 style={{ fontFamily: "var(--font-noto-serif)" }} className="mt-8 text-4xl font-black text-[#0f2a5e]">
            Terms & Conditions
          </h1>

          <p className="mt-4 leading-relaxed text-slate-600">
            These terms and conditions govern the use of the
            DigiPanch platform and related digital governance
            services.
          </p>

        </div>

        {/* Main Card */}
        <Card className="rounded-sm border border-slate-200 shadow-sm bg-white">

          <CardContent className="space-y-10 p-8 md:p-10">

            {/* Section 1 */}
            <div>

              <h2 className="text-2xl font-bold text-[#0f2a5e]">
                Acceptance of Terms
              </h2>

              <p className="mt-4 leading-relaxed text-slate-600">
                By accessing or using DigiPanch services,
                users agree to comply with the terms,
                policies, and applicable regulations
                associated with the platform.
              </p>

            </div>

            <Separator />

            {/* Section 2 */}
            <div>

              <h2 className="text-2xl font-bold text-[#0f2a5e]">
                Platform Usage
              </h2>

              <p className="mt-4 leading-relaxed text-slate-600">
                Users are responsible for providing accurate
                information during applications, grievance
                submissions, and payment-related activities.
              </p>

            </div>

            <Separator />

            {/* Section 3 */}
            <div>

              <h2 className="text-2xl font-bold text-[#0f2a5e]">
                Digital Services
              </h2>

              <p className="mt-4 leading-relaxed text-slate-600">
                DigiPanch provides access to governance-related
                digital services including document applications,
                grievance systems, AI assistance, and online
                payment infrastructure.
              </p>

            </div>

            <Separator />

            {/* Section 4 */}
            <div>

              <h2 className="text-2xl font-bold text-[#0f2a5e]">
                User Responsibilities
              </h2>

              <p className="mt-4 leading-relaxed text-slate-600">
                Users must not misuse the platform, attempt
                unauthorized access, submit misleading
                information, or disrupt digital services.
              </p>

            </div>

            <Separator />

            {/* Section 5 */}
            <div>

              <h2 className="text-2xl font-bold text-[#0f2a5e]">
                Payments & Transactions
              </h2>

              <p className="mt-4 leading-relaxed text-slate-600">
                Payment-related services may involve third-party
                payment providers. Users are responsible for
                verifying transaction details before confirming
                payments.
              </p>

            </div>

            <Separator />

            {/* Section 6 */}
            <div>

              <h2 className="text-2xl font-bold text-[#0f2a5e]">
                Service Availability
              </h2>

              <p className="mt-4 leading-relaxed text-slate-600">
                DigiPanch may update, modify, suspend, or
                temporarily restrict certain services for
                maintenance, security, or operational
                improvements.
              </p>

            </div>

            <Separator />

            {/* Section 7 */}
            <div>

              <h2 className="text-2xl font-bold text-[#0f2a5e]">
                Privacy & Data
              </h2>

              <p className="mt-4 leading-relaxed text-slate-600">
                User information and platform interactions are
                subject to the DigiPanch Privacy Policy and
                applicable data protection practices.
              </p>

            </div>

            <Separator />

            {/* Section 8 */}
            <div>

              <h2 className="text-2xl font-bold text-[#0f2a5e]">
                Policy Changes
              </h2>

              <p className="mt-4 leading-relaxed text-slate-600">
                DigiPanch reserves the right to revise these
                terms and conditions periodically to reflect
                governance, legal, or operational changes.
              </p>

            </div>

            <Separator />

            {/* Section 9 */}
            <div>

              <h2 className="text-2xl font-bold text-[#0f2a5e]">
                Contact Information
              </h2>

              <p className="mt-4 leading-relaxed text-slate-600">
                For questions regarding these terms and
                conditions, users may contact the DigiPanch
                administration through the official support
                channels available on the platform.
              </p>

            </div>

          </CardContent>
        </Card>

      </div>
    </main>
  );
}