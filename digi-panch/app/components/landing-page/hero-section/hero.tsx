"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* ── Background Video — desktop (md+) ── */}
      <motion.div
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute inset-0 hidden md:block"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="/hero video/Hilly_village_in_Northeast_India_202606230050.mp4"
            type="video/mp4"
          />
        </video>
      </motion.div>

      {/* ── Background Video — mobile ── */}
      <motion.div
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute inset-0 block md:hidden"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="/hero video/mobile/Drone_footage_village_path_India_202606230123.mp4"
            type="video/mp4"
          />
        </video>
      </motion.div>

      {/* ── Layered overlay: transparent at top → heavy black at bottom ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.52) 40%, rgba(0,0,0,0.82) 80%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      {/* ── Hero Content ── */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-4xl w-full text-center flex flex-col items-center gap-6">

          {/* Official stamp-style tag */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span
              style={{ fontFamily: "var(--font-noto-serif)" }}
              className="inline-block border border-[#c8a96e] px-5 py-[7px] text-[11px] tracking-[0.22em] uppercase text-[#e8d8b0] font-semibold"
            >
              AI Powered Rural Administration
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            style={{ fontFamily: "var(--font-noto-serif)" }}
            className="text-white font-black leading-[1.12] text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] tracking-tight"
          >
            Governance That Reaches<br className="hidden sm:block" />{" "}
            Every Village
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.22 }}
            className="text-white/70 text-base sm:text-lg font-inter tracking-wide"
          >
            Digital services for Gram Panchayats across India.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.38 }}
            className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary — India blue */}
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-9 py-[14px] text-sm font-semibold tracking-wide text-white font-inter transition-colors duration-200"
                style={{
                  backgroundColor: "#1a3a6b",
                  borderRadius: "4px",
                  border: "1px solid #1a3a6b",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#15305a")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#1a3a6b")
                }
              >
                Explore Services
              </motion.button>
            </Link>

            {/* Secondary — transparent + white border */}
            <Link href="/about-us">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-9 py-[14px] text-sm font-semibold tracking-wide text-white font-inter transition-colors duration-200"
                style={{
                  backgroundColor: "transparent",
                  borderRadius: "4px",
                  border: "1px solid rgba(255,255,255,0.55)",
                }}
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          {/* Emblem-style divider line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.55 }}
            className="mt-4 flex items-center gap-3 origin-center"
          >
            <span className="block h-px w-16 bg-[#c8a96e]/50" />
            <span className="text-[#c8a96e]/70 text-[10px] tracking-[0.3em] uppercase font-inter">
              DigiPanch
            </span>
            <span className="block h-px w-16 bg-[#c8a96e]/50" />
          </motion.div>

        </div>
      </div>
    </div>
  );
}