
import { type Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing'; // We need to create this or inline it. For now, inline check.
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: "Darkstone Cat",
  description: "Darkstone Catalunya",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!['ca', 'es', 'en'].includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-[#eee8dc] text-zinc-800">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
