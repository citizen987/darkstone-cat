"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";

export default function MemberCard() {
  const t = useTranslations("profile");
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);

    try {
      const res = await fetch("/api/members/card");
      if (!res.ok) throw new Error("Failed to generate card");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Extract filename from Content-Disposition or use default
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? "carnet_darkstone.png";

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail — user can retry
    } finally {
      setDownloading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8"
    >
      {/* Card preview */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/api/members/card?preview=1"
        alt={t("card_preview_alt")}
        className="w-full max-w-xl rounded-2xl shadow-lg"
      />

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="rounded-xl bg-stone-custom px-8 py-3.5 text-sm font-semibold text-brand-white transition-colors hover:bg-stone-custom/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
      >
        {downloading ? t("card_downloading") : t("card_download")}
      </button>
    </motion.div>
  );
}
