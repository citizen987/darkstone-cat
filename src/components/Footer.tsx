"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-300 py-12 text-center text-stone-500 bg-[#eee8dc]">
        <div className="container mx-auto px-6 flex flex-col items-center gap-6">
            <p>&copy; {currentYear} Darkstone Catalunya. {t("rights")}</p>
            <div className="flex gap-4">
                {/* Social Placeholders */}
                <a href="https://instagram.com/darkstone.cat" className="hover:text-stone-900 transition-colors">Instagram</a>
                <a href="https://x.com/darkstonecat" className="hover:text-stone-900 transition-colors">Twitter</a>
                <a href="https://t.me/darkstonecat" className="hover:text-stone-900 transition-colors">Telegram</a>
            </div>
        </div>
    </footer>
  );
}
