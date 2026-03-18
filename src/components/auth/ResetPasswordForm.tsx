"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";

type FormStatus = "idle" | "submitting" | "success" | "error";

type FieldErrors = {
  password?: string;
  confirm?: string;
};

const REDIRECT_DELAY_MS = 3000;

export default function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(password: string, confirm: string): FieldErrors {
    const errs: FieldErrors = {};
    if (!password) {
      errs.password = t("required_field");
    } else if (password.length < 8) {
      errs.password = t("reset_error_too_short");
    }
    if (!confirm) {
      errs.confirm = t("required_field");
    } else if (password && confirm !== password) {
      errs.confirm = t("reset_error_mismatch");
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    const fieldErrors = validate(password, confirm);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus("submitting");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorMessage(t("reset_error_generic"));
      return;
    }

    setStatus("success");
  }

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => router.push("/profile"), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, router]);

  const isSubmitting = status === "submitting";

  return (
    <div className="mx-auto w-full max-w-md">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 px-6 py-16 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-7 w-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-green-800">
              {t("reset_success_title")}
            </h3>
            <p className="mb-6 max-w-sm text-sm text-green-700/80">
              {t("reset_success_message")}
            </p>
            <p className="text-xs text-green-600/70">
              {t("reset_redirecting")}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="reset-form"
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            noValidate
          >
            {status === "error" && errorMessage && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </motion.div>
            )}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-stone-custom/80"
              >
                {t("reset_password_label")}{" "}
                <span className="text-brand-red" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="new-password"
                minLength={8}
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                onChange={() =>
                  errors.password &&
                  setErrors((e) => ({ ...e, password: undefined }))
                }
                className="w-full rounded-xl border border-stone-custom/15 bg-brand-white px-4 py-3 text-stone-custom placeholder:text-stone-custom/50 outline-none transition-colors focus:border-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange focus-visible:outline-offset-2 disabled:opacity-50"
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="mb-2 block text-sm font-medium text-stone-custom/80"
              >
                {t("reset_confirm_label")}{" "}
                <span className="text-brand-red" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                type="password"
                id="confirm"
                name="confirm"
                required
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.confirm}
                aria-describedby={
                  errors.confirm ? "confirm-error" : undefined
                }
                onChange={() =>
                  errors.confirm &&
                  setErrors((e) => ({ ...e, confirm: undefined }))
                }
                className="w-full rounded-xl border border-stone-custom/15 bg-brand-white px-4 py-3 text-stone-custom placeholder:text-stone-custom/50 outline-none transition-colors focus:border-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange focus-visible:outline-offset-2 disabled:opacity-50"
              />
              {errors.confirm && (
                <p id="confirm-error" className="mt-1 text-xs text-red-600">
                  {errors.confirm}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-stone-custom px-6 py-3.5 text-sm font-semibold text-brand-white transition-colors hover:bg-stone-custom/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
            >
              {isSubmitting ? t("reset_submitting") : t("reset_submit")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
