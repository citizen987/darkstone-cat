import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternates, getBreadcrumbJsonLd, getWebPageJsonLd } from "@/lib/seo";
import { isAdmin } from "@/lib/supabase/auth";
import { getAllMembers } from "@/lib/admin/actions";
import { maskDni, maskPhone } from "@/lib/admin/utils";
import { decrypt } from "@/lib/encryption";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AuthHero from "@/components/auth/AuthHero";
import MembersTable, { type MemberRow } from "@/components/admin/MembersTable";

export const revalidate = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const alternates = getAlternates(locale, "/admin/members");
  return {
    title: t("admin_members_title"),
    description: t("admin_members_description"),
    alternates,
    robots: { index: false, follow: false },
    openGraph: {
      title: t("admin_members_title"),
      description: t("admin_members_description"),
      url: alternates.canonical,
    },
  };
}

export default async function AdminMembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const admin = await isAdmin();

  const [tNav, tMeta, tAdmin] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "metadata" }),
    getTranslations({ locale, namespace: "admin" }),
  ]);

  const breadcrumbJsonLd = getBreadcrumbJsonLd(locale, [
    { name: tNav("admin"), path: "/admin" },
    { name: tNav("admin_members"), path: "/admin/members" },
  ]);
  const webPageJsonLd = getWebPageJsonLd(
    locale,
    "/admin/members",
    tMeta("admin_members_title"),
    tMeta("admin_members_description"),
  );

  let rows: MemberRow[] = [];
  if (admin) {
    const { data: members } = await getAllMembers();
    if (members) {
      rows = members.map((m) => {
        let phoneMasked: string | null = null;
        let dniMasked: string | null = null;

        if (m.phone_encrypted) {
          try {
            phoneMasked = maskPhone(decrypt(m.phone_encrypted));
          } catch {
            phoneMasked = null;
          }
        }

        if (m.dni_nie_encrypted) {
          try {
            dniMasked = maskDni(decrypt(m.dni_nie_encrypted));
          } catch {
            dniMasked = null;
          }
        }

        return {
          memberNumber: m.member_number,
          firstName: m.first_name,
          lastName: m.last_name,
          email: m.email,
          phoneMasked,
          dniMasked,
          postalCode: m.postal_code,
          role: m.role as "member" | "admin",
          membershipStartDate: m.membership_start_date,
        };
      });
    }
  }

  return (
    <main id="main-content" className="relative flex min-h-screen flex-col font-sans selection:bg-stone-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, webPageJsonLd]) }}
      />
      <NavBar />
      <AuthHero titleKey="members_title" subtitleKey="members_subtitle" namespace="admin" />

      <section className="flex-1 bg-brand-beige pb-20">
        <div className="container mx-auto max-w-6xl px-6 pt-16">
          {admin ? (
            <MembersTable members={rows} />
          ) : (
            <div className="rounded-2xl border border-stone-custom/10 bg-brand-white p-8 text-center">
              <h2 className="text-xl font-bold text-stone-custom">{tAdmin("unauthorized_title")}</h2>
              <p className="mt-2 text-stone-custom/70">{tAdmin("unauthorized_message")}</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </main>
  );
}
