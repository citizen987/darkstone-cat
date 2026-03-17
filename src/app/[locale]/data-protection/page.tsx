import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternates, getOgImageUrl, getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/seo";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import DataProtectionContent from "@/components/legal/DataProtectionContent";

export const revalidate = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const alternates = getAlternates(locale, "/data-protection");
  return {
    title: t("data_protection_title"),
    description: t("data_protection_description"),
    alternates,
    robots: { index: false, follow: true },
    openGraph: {
      title: t("data_protection_title"),
      description: t("data_protection_description"),
      url: alternates.canonical,
      images: [{ url: getOgImageUrl(locale), width: 1200, height: 630, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("data_protection_title"),
      description: t("data_protection_description"),
    },
  };
}

export default async function DataProtectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const breadcrumbJsonLd = getBreadcrumbJsonLd(locale, [
    {
      name: locale === "ca" ? "Protecció de dades" : locale === "es" ? "Protección de datos" : "Data protection",
      path: "/data-protection",
    },
  ]);
  const webPageJsonLd = getWebPageJsonLd(locale, "/data-protection", t("data_protection_title"), t("data_protection_description"));

  return (
    <main id="main-content" className="relative min-h-screen font-sans selection:bg-stone-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, webPageJsonLd]) }}
      />
      <NavBar />
      <DataProtectionContent />
      <Footer />
      <ScrollToTop />
    </main>
  );
}
