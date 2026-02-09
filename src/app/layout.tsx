import type { Metadata } from "next";
import { Barlow_Condensed, Bree_Serif, Pirata_One, UnifrakturCook } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from './layout.module.css';
import ServiceWorkerRegister from '@/components/client/ServiceWorkerRegister';
import GlobalParamsSetterSlot from '@/components/client/GlobalParamsSetter.slot';

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  weight: ["400", "600", "700"],
});

const breeSerif = Bree_Serif({
  subsets: ["latin"],
  variable: "--font-bree-serif",
  weight: ["400"],
});

const pirataOne = Pirata_One({
  subsets: ["latin"],
  variable: "--font-pirata-one",
  weight: ["400"],
});

const unifrakturCook = UnifrakturCook({
  subsets: ["latin"],
  variable: "--font-unifraktur-cook",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Relicry",
  description: "A TCG Adventure Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${barlowCondensed.variable} ${breeSerif.variable} ${pirataOne.variable} ${unifrakturCook.variable} ${styles.body}`}
      >
        <div data-global-header className='global-header'><Header /></div>
        <ServiceWorkerRegister />
        <main data-global-main className={`${styles.main} global-main`}>{children}</main>
        <div data-global-footer className='global-footer'><Footer /></div>
        <GlobalParamsSetterSlot />
      </body>
    </html>
  );
}
