import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternates, getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/seo";
import { isAdmin } from "@/lib/supabase/auth";
import { fetchUpcomingEvents } from "@/lib/ludoya";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AuthHero from "@/components/auth/AuthHero";
import EventImagesHero from "@/components/events/EventImagesHero";
import EventImagesContent from "@/components/events/EventImagesContent";

export const revalidate = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const alternates = getAlternates(locale, "/events/images");
  return {
    title: t("event_images_title"),
    description: t("event_images_description"),
    alternates,
    robots: { index: false, follow: false },
  };
}

export default async function EventImagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const admin = await isAdmin();

  const [eventsResult, tNav, tMeta, tAdmin] = await Promise.all([
    fetchUpcomingEvents(),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "metadata" }),
    getTranslations({ locale, namespace: "admin" }),
  ]);

  const breadcrumbJsonLd = getBreadcrumbJsonLd(locale, [
    { name: tNav("events"), path: "/events" },
    { name: tMeta("event_images_title"), path: "/events/images" },
  ]);
  const webPageJsonLd = getWebPageJsonLd(
    locale,
    "/events/images",
    tMeta("event_images_title"),
    tMeta("event_images_description")
  );

  if (!admin) {
    return (
      <main id="main-content" className="relative flex min-h-screen flex-col font-sans selection:bg-stone-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, webPageJsonLd]) }}
        />
        <NavBar />
        <AuthHero titleKey="title" subtitleKey="subtitle" namespace="admin" />
        <section className="flex-1 bg-brand-beige pb-20">
          <div className="container mx-auto max-w-4xl px-6 pt-16">
            <div className="rounded-2xl border border-stone-custom/10 bg-brand-white p-8 text-center">
              <h2 className="text-xl font-bold text-stone-custom">{tAdmin("unauthorized_title")}</h2>
              <p className="mt-2 text-stone-custom/70">{tAdmin("unauthorized_message")}</p>
            </div>
          </div>
        </section>
        <Footer />
        <ScrollToTop />
      </main>
    );
  }

  return (
    <main id="main-content" className="relative min-h-screen font-sans selection:bg-stone-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, webPageJsonLd]),
        }}
      />
      <NavBar />
      <EventImagesHero />
      <EventImagesContent
        regularEvents={eventsResult.regularEvents}
        specialEvents={eventsResult.specialEvents}
        locale={locale}
      />
      <Footer />
      <ScrollToTop />
    </main>
  );
}
