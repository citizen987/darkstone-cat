"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: "ca", label: "CAT" },
    { code: "es", label: "ESP" },
    { code: "en", label: "ENG" },
  ] as const;

  const handleLanguageChange = (newLocale: typeof languages[number]["code"]) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex gap-2 text-sm font-medium">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`transition-colors duration-200 ${
            locale === lang.code
              ? "text-stone-900 underline decoration-2 underline-offset-4"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
