import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternates, getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/seo";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AuthHero from "@/components/auth/AuthHero";
import MemberCard from "@/components/profile/MemberCard";

export const revalidate = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const alternates = getAlternates(locale, "/profile/card");
  return {
    title: t("profile_card_title"),
    description: t("profile_card_description"),
    alternates,
    robots: { index: false, follow: false },
    openGraph: {
      title: t("profile_card_title"),
      description: t("profile_card_description"),
      url: alternates.canonical,
    },
  };
}

export default async function ProfileCardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const t = await getTranslations({ locale, namespace: "metadata" });
  const breadcrumbJsonLd = getBreadcrumbJsonLd(locale, [
    { name: tNav("profile"), path: "/profile" },
    { name: tNav("profile_card"), path: "/profile/card" },
  ]);
  const webPageJsonLd = getWebPageJsonLd(locale, "/profile/card", t("profile_card_title"), t("profile_card_description"));

  return (
    <main id="main-content" className="relative flex min-h-screen flex-col font-sans selection:bg-stone-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, webPageJsonLd]) }}
      />
      <NavBar />
      <AuthHero titleKey="card_title" subtitleKey="card_subtitle" namespace="profile" />

      <section className="flex-1 bg-brand-beige pb-20">
        <div className="container mx-auto max-w-4xl px-6 pt-16">
          <MemberCard />
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}
