"use client";

import { useTranslations } from "next-intl";

export default function InfoSection() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-24 py-24">
      {/* About Section */}
      <section id="about" className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-20">
          <div className="md:w-1/2">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
              {t("about.title")}
            </h2>
            <div className="h-1.5 w-20 rounded-full bg-stone-300"></div>
            <p className="mt-8 text-xl leading-relaxed text-stone-600">
              {t("about.text")}
            </p>
          </div>
          <div className="grid gap-6 md:w-1/2 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-3 text-xl font-bold text-stone-800">
                {t("about.highlight1")}
              </h3>
              <p className="text-stone-600">{t("about.highlight1_desc")}</p>
            </div>
            <div className="rounded-3xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-3 text-xl font-bold text-stone-800">
                {t("about.highlight2")}
              </h3>
              <p className="text-stone-600">{t("about.highlight2_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="bg-stone-200/50 py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-stone-900 md:text-5xl">
            {t("activities.title")}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-stone-600 mb-12">
            {t("activities.text")}
          </p>

          <div className="grid gap-8 md:grid-cols-3">
             {/* Activity Cards (Placeholders for now, can be images later) */}
             <div className="group relative overflow-hidden rounded-3xl bg-white aspect-square flex items-center justify-center shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 text-2xl font-semibold text-stone-800">Board Games</span>
             </div>
             <div className="group relative overflow-hidden rounded-3xl bg-white aspect-square flex items-center justify-center shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 text-2xl font-semibold text-stone-800">Role Playing</span>
             </div>
             <div className="group relative overflow-hidden rounded-3xl bg-white aspect-square flex items-center justify-center shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 text-2xl font-semibold text-stone-800">Community</span>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
