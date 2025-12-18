"use client";

import { useTranslations } from "next-intl";

export default function Activities() {
  const t = useTranslations("activities");

  return (
    <section id="activities" className="bg-stone-200/50 py-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="mb-6 text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-stone-600 mb-12">
          {t("text")}
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Activity Cards (Placeholders for now, can be images later) */}
          <div className="group relative overflow-hidden rounded-3xl bg-white aspect-square flex items-center justify-center shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10 text-2xl font-semibold text-stone-800">
              Board Games
            </span>
          </div>
          <div className="group relative overflow-hidden rounded-3xl bg-white aspect-square flex items-center justify-center shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10 text-2xl font-semibold text-stone-800">
              Role Playing
            </span>
          </div>
          <div className="group relative overflow-hidden rounded-3xl bg-white aspect-square flex items-center justify-center shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10 text-2xl font-semibold text-stone-800">
              Community
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
