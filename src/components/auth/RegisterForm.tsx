"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { updateMemberAfterSignup } from "@/lib/supabase/actions";

type FormStatus = "idle" | "submitting" | "success" | "error";

type FieldErrors = {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  dni?: string;
  conduct?: string;
  privacy?: string;
};

const DNI_REGEX = /^[0-9]{8}[A-Za-z]$/;
const NIE_REGEX = /^[XYZxyz][0-9]{7}[A-Za-z]$/;

export default function RegisterForm() {
  const t = useTranslations("auth");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(form: FormData): FieldErrors {
    const errs: FieldErrors = {};
    const email = (form.get("email") as string).trim();
    const password = (form.get("password") as string);
    const firstName = (form.get("first_name") as string).trim();
    const lastName = (form.get("last_name") as string).trim();
    const dni = (form.get("dni") as string).trim();
    const conduct = form.get("conduct");
    const privacy = form.get("privacy");

    if (!email) {
      errs.email = t("required_field");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = t("invalid_email");
    }

    if (!password) {
      errs.password = t("required_field");
    } else if (password.length < 8) {
      errs.password = t("password_min_length");
    }

    if (!firstName) errs.first_name = t("required_field");
    if (!lastName) errs.last_name = t("required_field");

    if (dni && !DNI_REGEX.test(dni) && !NIE_REGEX.test(dni)) {
      errs.dni = t("invalid_email"); // reused as generic format error — but let's use a clearer one
    }

    if (!conduct) errs.conduct = t("must_accept_conduct");
    if (!privacy) errs.privacy = t("must_accept_privacy");

    return errs;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const fieldErrors = validate(formData);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus("submitting");
    setErrorMessage("");

    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;
    const firstName = (formData.get("first_name") as string).trim();
    const lastName = (formData.get("last_name") as string).trim();

    const supabase = createClient();
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      setStatus("error");
      if (
        error.message.includes("already registered") ||
        error.message.includes("already been registered")
      ) {
        setErrorMessage(t("register_error_email_in_use"));
      } else {
        setErrorMessage(t("register_error_generic"));
      }
      return;
    }

    // Update member with optional fields + consents via Server Action
    // Uses admin client because no session exists yet (email confirmation pending)
    const { error: updateError } = await updateMemberAfterSignup({
      userId: signUpData.user?.id ?? "",
      phone: formData.get("phone") as string,
      dni: formData.get("dni") as string,
      postal_code: formData.get("postal_code") as string,
      ludoya_username: formData.get("ludoya_username") as string,
      bgg_username: formData.get("bgg_username") as string,
      newsletter_accepted: !!formData.get("newsletter"),
    });

    if (updateError) {
      // Non-critical: signup succeeded, member row exists, but optional fields failed
      console.error("Failed to update member after signup:", updateError);
    }

    setStatus("success");
  }

  const isSubmitting = status === "submitting";

  const inputClassName =
    "w-full rounded-xl border border-stone-custom/15 bg-brand-white px-4 py-3 text-stone-custom placeholder:text-stone-custom/50 outline-none transition-colors focus:border-brand-orange focus-visible:outline-2 focus-visible:outline-brand-orange focus-visible:outline-offset-2 disabled:opacity-50";

  function clearError(field: keyof FieldErrors) {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  return (
    <div className="mx-auto w-full max-w-lg">
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
              {t("register_success_title")}
            </h3>
            <p className="mb-6 max-w-sm text-sm text-green-700/80">
              {t("register_success_message")}
            </p>
            <Link
              href="/login"
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              {t("register_login_link")}
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="register-form"
            className="space-y-8"
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

            {/* Required fields */}
            <fieldset className="space-y-5">
              <legend className="text-lg font-semibold text-stone-custom">
                {t("register_section_required")}
              </legend>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first_name"
                    className="mb-2 block text-sm font-medium text-stone-custom/80"
                  >
                    {t("register_first_name_label")}{" "}
                    <span className="text-brand-red" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    required
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.first_name}
                    aria-describedby={
                      errors.first_name ? "first_name-error" : undefined
                    }
                    onChange={() => clearError("first_name")}
                    className={inputClassName}
                  />
                  {errors.first_name && (
                    <p
                      id="first_name-error"
                      className="mt-1 text-xs text-red-600"
                    >
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="mb-2 block text-sm font-medium text-stone-custom/80"
                  >
                    {t("register_last_name_label")}{" "}
                    <span className="text-brand-red" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    required
                    autoComplete="family-name"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.last_name}
                    aria-describedby={
                      errors.last_name ? "last_name-error" : undefined
                    }
                    onChange={() => clearError("last_name")}
                    className={inputClassName}
                  />
                  {errors.last_name && (
                    <p
                      id="last_name-error"
                      className="mt-1 text-xs text-red-600"
                    >
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-stone-custom/80"
                >
                  {t("register_email_label")}{" "}
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
                  onChange={() => clearError("email")}
                  className={inputClassName}
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
                  {t("register_password_label")}{" "}
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
                  aria-describedby="password-hint password-error"
                  onChange={() => clearError("password")}
                  className={inputClassName}
                />
                <p
                  id="password-hint"
                  className="mt-1 text-xs text-stone-custom/50"
                >
                  {t("register_password_hint")}
                </p>
                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.password}
                  </p>
                )}
              </div>
            </fieldset>

            {/* Optional fields */}
            <fieldset className="space-y-5">
              <legend className="text-lg font-semibold text-stone-custom">
                {t("register_section_optional")}
              </legend>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-stone-custom/80"
                  >
                    {t("register_phone_label")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="dni"
                    className="mb-2 block text-sm font-medium text-stone-custom/80"
                  >
                    {t("register_dni_label")}
                  </label>
                  <input
                    type="text"
                    id="dni"
                    name="dni"
                    autoComplete="off"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.dni}
                    aria-describedby={errors.dni ? "dni-error" : undefined}
                    onChange={() => clearError("dni")}
                    className={inputClassName}
                  />
                  {errors.dni && (
                    <p id="dni-error" className="mt-1 text-xs text-red-600">
                      {errors.dni}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="postal_code"
                    className="mb-2 block text-sm font-medium text-stone-custom/80"
                  >
                    {t("register_postal_code_label")}
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    autoComplete="postal-code"
                    disabled={isSubmitting}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="ludoya_username"
                    className="mb-2 block text-sm font-medium text-stone-custom/80"
                  >
                    {t("register_ludoya_label")}
                  </label>
                  <input
                    type="text"
                    id="ludoya_username"
                    name="ludoya_username"
                    autoComplete="off"
                    disabled={isSubmitting}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="bgg_username"
                    className="mb-2 block text-sm font-medium text-stone-custom/80"
                  >
                    {t("register_bgg_label")}
                  </label>
                  <input
                    type="text"
                    id="bgg_username"
                    name="bgg_username"
                    autoComplete="off"
                    disabled={isSubmitting}
                    className={inputClassName}
                  />
                </div>
              </div>
            </fieldset>

            {/* Consents */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-stone-custom">
                {t("register_section_consents")}
              </legend>

              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="conduct"
                    disabled={isSubmitting}
                    onChange={() => clearError("conduct")}
                    className="mt-1 h-4 w-4 rounded border-stone-custom/30 text-brand-orange accent-brand-orange"
                  />
                  <span className="text-sm text-stone-custom/80">
                    {t.rich("register_conduct_checkbox", {
                      link: (chunks: ReactNode) => (
                        <Link
                          href="/conduct"
                          target="_blank"
                          className="font-medium text-brand-orange-text underline transition-colors hover:text-brand-orange"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                    <span className="text-brand-red" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  </span>
                </label>
                {errors.conduct && (
                  <p className="mt-1 ml-7 text-xs text-red-600">
                    {errors.conduct}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="privacy"
                    disabled={isSubmitting}
                    onChange={() => clearError("privacy")}
                    className="mt-1 h-4 w-4 rounded border-stone-custom/30 text-brand-orange accent-brand-orange"
                  />
                  <span className="text-sm text-stone-custom/80">
                    {t.rich("register_privacy_checkbox", {
                      link: (chunks: ReactNode) => (
                        <Link
                          href="/data-protection"
                          target="_blank"
                          className="font-medium text-brand-orange-text underline transition-colors hover:text-brand-orange"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                    <span className="text-brand-red" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  </span>
                </label>
                {errors.privacy && (
                  <p className="mt-1 ml-7 text-xs text-red-600">
                    {errors.privacy}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="newsletter"
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 rounded border-stone-custom/30 text-brand-orange accent-brand-orange"
                  />
                  <span className="text-sm text-stone-custom/80">
                    {t("register_newsletter_checkbox")}
                  </span>
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-stone-custom px-6 py-3.5 text-sm font-semibold text-brand-white transition-colors hover:bg-stone-custom/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
            >
              {isSubmitting ? t("register_submitting") : t("register_submit")}
            </button>

            <p className="text-center text-sm text-stone-custom/60">
              {t("register_has_account")}{" "}
              <Link
                href="/login"
                className="font-medium text-brand-orange-text transition-colors hover:text-brand-orange"
              >
                {t("register_login_link")}
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
