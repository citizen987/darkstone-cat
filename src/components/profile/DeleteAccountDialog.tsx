"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { AnimatePresence, motion } from "motion/react";
import { deleteAccount } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/client";

type DeleteAccountDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const confirmWord = t("delete_confirm_word");
  const canDelete = confirmText.trim().toUpperCase() === confirmWord.toUpperCase();

  async function handleDelete() {
    setDeleting(true);
    setError("");

    const { error: deleteError } = await deleteAccount();

    if (deleteError) {
      setError(t("delete_error"));
      setDeleting(false);
      return;
    }

    // Sign out client-side and redirect
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  function handleClose() {
    if (deleting) return;
    setConfirmText("");
    setError("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl bg-brand-white p-8 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-red-600">{t("delete_title")}</h2>
            <p className="mt-3 text-sm text-stone-custom/70">{t("delete_warning")}</p>

            <div className="mt-6">
              <label htmlFor="delete-confirm" className="mb-2 block text-sm font-medium text-stone-custom/80">
                {t("delete_confirm_prompt")}
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={deleting}
                autoComplete="off"
                className="w-full rounded-xl border border-stone-custom/15 bg-brand-white px-4 py-3 text-stone-custom placeholder:text-stone-custom/50 outline-none transition-colors focus:border-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange focus-visible:outline-offset-2 disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleClose}
                disabled={deleting}
                className="flex-1 rounded-xl border border-stone-custom/15 bg-brand-white px-4 py-3 text-sm font-semibold text-stone-custom transition-colors hover:bg-stone-custom/5 disabled:opacity-50"
              >
                {t("delete_cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete || deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-brand-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {deleting ? "..." : t("delete_confirm_button")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
