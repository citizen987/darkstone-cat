"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { MdImage, MdDownload, MdClose } from "react-icons/md";
import type { LudoyaEvent } from "@/lib/ludoya";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  regularEvents: LudoyaEvent[];
  specialEvents: LudoyaEvent[];
  locale: string;
}

type ImageState = "idle" | "loading" | "error";

// ---------------------------------------------------------------------------
// Date formatting (client-side, locale-aware)
// ---------------------------------------------------------------------------

function formatDate(startsAt: string, locale: string, timeZone: string): string {
  const date = new Date(startsAt);
  return date.toLocaleDateString(locale === "ca" ? "ca-ES" : locale === "es" ? "es-ES" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  });
}

function formatTime(startsAt: string, endsAt: string, timeZone: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("ca-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    });
  return `${fmt(startsAt)} – ${fmt(endsAt)}`;
}

// ---------------------------------------------------------------------------
// Sanitize filename
// ---------------------------------------------------------------------------

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Event Card
// ---------------------------------------------------------------------------

function EventImageCard({ event, locale }: { event: LudoyaEvent; locale: string }) {
  const t = useTranslations("event_images");
  const [state, setState] = useState<ImageState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const imageEndpoint = `/api/events/${event.id}/image`;
  const tz = event.timeZone || "Europe/Madrid";
  const hasGames = event.plannedPlays.length > 0;

  const fetchImage = useCallback(async (): Promise<Blob | null> => {
    setState("loading");
    try {
      const res = await fetch(imageEndpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      setState("idle");
      return blob;
    } catch {
      setState("error");
      return null;
    }
  }, [imageEndpoint]);

  const handlePreview = useCallback(async () => {
    if (previewUrl) {
      // Already have a preview, just show it
      return;
    }
    const blob = await fetchImage();
    if (blob) {
      setPreviewUrl(URL.createObjectURL(blob));
    }
  }, [fetchImage, previewUrl]);

  const handleDownload = useCallback(async () => {
    // Reuse existing blob if preview is open
    let blob: Blob | null = null;
    if (previewUrl) {
      blob = await fetch(previewUrl).then((r) => r.blob());
    } else {
      blob = await fetchImage();
    }
    if (!blob) return;

    const date = new Date(event.startsAt).toISOString().slice(0, 10);
    const filename = `darkstone-${sanitizeFilename(event.title)}-${date}.png`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fetchImage, previewUrl, event.startsAt, event.title]);

  const closePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  return (
    <>
      <motion.div
        className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-stone-900">{event.title}</h3>
          <p className="text-sm text-stone-500">
            {formatDate(event.startsAt, locale, tz)} · {formatTime(event.startsAt, event.endsAt, tz)}
          </p>
        </div>

        {/* Game pills */}
        {hasGames ? (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-stone-600">
              {t("games_count", { count: event.plannedPlays.length })}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {event.plannedPlays.map((pp, i) => (
                <span
                  key={i}
                  className="inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700"
                >
                  {pp.gameName}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="mb-4 text-sm italic text-stone-400">{t("no_games")}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            disabled={state === "loading"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
          >
            <MdImage className="h-4 w-4" />
            {state === "loading" ? t("generating") : t("view_image")}
          </button>
          <button
            onClick={handleDownload}
            disabled={state === "loading"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
          >
            <MdDownload className="h-4 w-4" />
            {t("download")}
          </button>
        </div>

        {/* Error */}
        {state === "error" && (
          <p className="mt-2 text-sm text-red-600">{t("error_generating")}</p>
        )}
      </motion.div>

      {/* Preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-1.5 shadow-lg transition-colors hover:bg-stone-100"
              aria-label={t("close")}
            >
              <MdClose className="h-5 w-5 text-stone-700" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={event.title}
              className="max-h-[85vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Test Card — generates mock images with N games
// ---------------------------------------------------------------------------

function TestImageCard({ count }: { count: number }) {
  const [state, setState] = useState<ImageState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const imageEndpoint = `/api/test-image/${count}`;

  const fetchImage = useCallback(async (): Promise<Blob | null> => {
    setState("loading");
    try {
      const res = await fetch(imageEndpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      setState("idle");
      return blob;
    } catch {
      setState("error");
      return null;
    }
  }, [imageEndpoint]);

  const handlePreview = useCallback(async () => {
    if (previewUrl) return;
    const blob = await fetchImage();
    if (blob) setPreviewUrl(URL.createObjectURL(blob));
  }, [fetchImage, previewUrl]);

  const handleDownload = useCallback(async () => {
    let blob: Blob | null = null;
    if (previewUrl) {
      blob = await fetch(previewUrl).then((r) => r.blob());
    } else {
      blob = await fetchImage();
    }
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `darkstone-test-${count}-games.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fetchImage, previewUrl, count]);

  const closePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  return (
    <>
      <motion.div
        className="rounded-xl border border-dashed border-stone-300 bg-white/60 p-5 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-3">
          <h3 className="text-lg font-bold text-stone-900">
            Test — {count} {count === 1 ? "joc" : "jocs"}
          </h3>
          <p className="text-sm text-stone-400">Mock data</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            disabled={state === "loading"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-500 disabled:opacity-50"
          >
            <MdImage className="h-4 w-4" />
            {state === "loading" ? "Generant..." : "Veure imatge"}
          </button>
          <button
            onClick={handleDownload}
            disabled={state === "loading"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
          >
            <MdDownload className="h-4 w-4" />
            Descarregar
          </button>
        </div>

        {state === "error" && (
          <p className="mt-2 text-sm text-red-600">Error generant la imatge</p>
        )}
      </motion.div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-1.5 shadow-lg transition-colors hover:bg-stone-100"
              aria-label="Tancar"
            >
              <MdClose className="h-5 w-5 text-stone-700" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`Test ${count} jocs`}
              className="max-h-[85vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Event section
// ---------------------------------------------------------------------------

function EventSection({
  title,
  events,
  locale,
}: {
  title: string;
  events: LudoyaEvent[];
  locale: string;
}) {
  if (events.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-stone-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((event) => (
          <EventImageCard key={event.id} event={event} locale={locale} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Test section
// ---------------------------------------------------------------------------

const TEST_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function TestSection() {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-stone-900">Test</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {TEST_COUNTS.map((count) => (
          <TestImageCard key={count} count={count} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EventImagesContent({
  regularEvents,
  specialEvents,
  locale,
}: Props) {
  const t = useTranslations("event_images");

  const hasEvents = regularEvents.length > 0 || specialEvents.length > 0;

  return (
    <section className="bg-brand-beige px-6 py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        {hasEvents ? (
          <>
            <EventSection
              title={t("regular_title")}
              events={regularEvents}
              locale={locale}
            />
            <EventSection
              title={t("special_title")}
              events={specialEvents}
              locale={locale}
            />
          </>
        ) : (
          <motion.p
            className="text-center text-lg text-stone-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t("no_events")}
          </motion.p>
        )}

        <TestSection />
      </div>
    </section>
  );
}
