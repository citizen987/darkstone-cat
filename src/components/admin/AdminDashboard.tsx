"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "motion/react";
import { MdPeople, MdPersonAdd, MdEmail, MdChevronRight, MdImage } from "react-icons/md";

type AdminDashboardProps = {
  stats: {
    total: number;
    newThisMonth: number;
    newsletter: number;
  };
};

const STAT_CARDS = [
  { key: "stat_total", icon: MdPeople, color: "text-emerald-600" },
  { key: "stat_new_month", icon: MdPersonAdd, color: "text-blue-600" },
  { key: "stat_newsletter", icon: MdEmail, color: "text-brand-orange-text" },
] as const;

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  const t = useTranslations("admin");

  const statValues = [stats.total, stats.newThisMonth, stats.newsletter];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              className="rounded-2xl border border-stone-custom/10 bg-brand-white p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Icon className={`mb-2 text-2xl ${card.color}`} />
              <p className="text-3xl font-bold text-stone-custom">{statValues[i]}</p>
              <p className="mt-1 text-sm text-stone-custom/60">{t(card.key)}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link
            href="/admin/members"
            className="group flex items-center justify-between rounded-2xl border border-stone-custom/10 bg-brand-white p-6 transition-colors hover:border-brand-orange/30 hover:bg-brand-orange/5"
          >
            <div>
              <h3 className="text-lg font-semibold text-stone-custom">{t("nav_members")}</h3>
              <p className="mt-1 text-sm text-stone-custom/60">{t("nav_members_description")}</p>
            </div>
            <MdChevronRight className="text-2xl text-stone-custom/40 transition-transform group-hover:translate-x-1 group-hover:text-brand-orange-text" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Link
            href="/events/images"
            className="group flex items-center justify-between rounded-2xl border border-stone-custom/10 bg-brand-white p-6 transition-colors hover:border-brand-orange/30 hover:bg-brand-orange/5"
          >
            <div className="flex items-center gap-3">
              <MdImage className="text-2xl text-stone-custom/60" />
              <div>
                <h3 className="text-lg font-semibold text-stone-custom">{t("nav_event_images")}</h3>
                <p className="mt-1 text-sm text-stone-custom/60">{t("nav_event_images_description")}</p>
              </div>
            </div>
            <MdChevronRight className="text-2xl text-stone-custom/40 transition-transform group-hover:translate-x-1 group-hover:text-brand-orange-text" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
