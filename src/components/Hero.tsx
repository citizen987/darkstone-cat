"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20 text-center"
    >
      <div className="animate-fade-in-up relative mx-auto mb-8 h-48 w-48 transition-transform duration-700 hover:scale-105 md:h-64 md:w-64">
        <Image
          src="/images/darkstone_logo.png"
          alt="Darkstone Catalunya Logo"
          fill
          priority
          className="object-contain drop-shadow-2xl"
        />
      </div>

      <h1 className="animate-fade-in-up max-w-4xl text-5xl font-extrabold tracking-tight text-stone-900 opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms] md:text-7xl">
        Darkstone Catalunya
      </h1>
      
      <p className="animate-fade-in-up mt-6 max-w-2xl text-xl font-light text-stone-600 opacity-0 [animation-fill-mode:forwards] [animation-delay:400ms] md:text-2xl">
        {t("tagline")}
      </p>

      <p className="animate-fade-in-up mt-4 max-w-lg text-stone-500 opacity-0 [animation-fill-mode:forwards] [animation-delay:500ms]">
        {t("description")}
      </p>

      <div className="animate-fade-in-up mt-10 opacity-0 [animation-fill-mode:forwards] [animation-delay:700ms]">
        <a
          href="#activities"
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-stone-900 px-8 py-3 font-medium text-stone-50 transition-all duration-300 hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-500/30"
        >
          <span className="mr-2">{t("cta")}</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </section>
  );
}
