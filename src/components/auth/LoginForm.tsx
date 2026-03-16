"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";

type FormStatus = "idle" | "submitting" | "error";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const confirmed = searchParams.get("confirmed");
  const recovery = searchParams.get("recovery");
  const redirect = searchParams.get("redirect");

  function validate(data: { email: string; password: string }): FieldErrors {
    const errs: FieldErrors = {};
    if (!data.email.trim()) {
      errs.email = t("required_field");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = t("invalid_email");
    }
    if (!data.password.trim()) {
      errs.password = t("required_field");
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const fieldErrors = validate(data);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus("submitting");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setStatus("error");
      if (error.message === "Invalid login credentials") {
        setErrorMessage(t("login_error_invalid_credentials"));
      } else if (error.message === "Email not confirmed") {
        setErrorMessage(t("login_error_email_not_confirmed"));
      } else {
        setErrorMessage(t("login_error_generic"));
      }
      return;
    }

    // Hard navigation to ensure cookies are fully set before SSR reads them.
    // Using router.replace() here causes repeated RSC fetches due to
    // token refresh race between client-side Supabase and the middleware.
    window.location.href = redirect ?? "/profile";
  }

  const isSubmitting = status === "submitting";

  return (
    <div className="mx-auto w-full max-w-md">
      <AnimatePresence mode="wait">
        <motion.form
          key="login-form"
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          noValidate
        >
          {confirmed === "success" && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {t("login_confirmed_success")}
            </motion.div>
          )}

          {confirmed === "error" && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {t("login_confirmed_error")}
            </motion.div>
          )}

          {recovery === "error" && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {t("login_recovery_error")}
            </motion.div>
          )}

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
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-stone-custom/80"
            >
              {t("login_email_label")}{" "}
              <span className="text-brand-red" aria-hidden="true">
                *
              </span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={() =>
                errors.email && setErrors((e) => ({ ...e, email: undefined }))
              }
              className="w-full rounded-xl border border-stone-custom/15 bg-brand-white px-4 py-3 text-stone-custom placeholder:text-stone-custom/50 outline-none transition-colors focus:border-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange focus-visible:outline-offset-2 disabled:opacity-50"
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-stone-custom/80"
            >
              {t("login_password_label")}{" "}
              <span className="text-brand-red" aria-hidden="true">
                *
              </span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-stone-custom px-6 py-3.5 text-sm font-semibold text-brand-white transition-colors hover:bg-stone-custom/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
          >
            {isSubmitting ? t("login_submitting") : t("login_submit")}
          </button>

          <div className="flex flex-col items-center gap-3 text-sm">
            <Link
              href="/forgot-password"
              className="text-brand-orange-text transition-colors hover:text-brand-orange"
            >
              {t("login_forgot_password")}
            </Link>
            <p className="text-stone-custom/60">
              {t("login_no_account")}{" "}
              <Link
                href="/register"
                className="font-medium text-brand-orange-text transition-colors hover:text-brand-orange"
              >
                {t("login_register_link")}
              </Link>
            </p>
          </div>
        </motion.form>
      </AnimatePresence>
    </div>
  );
}
