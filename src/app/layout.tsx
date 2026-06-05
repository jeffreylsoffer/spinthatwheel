import type {Metadata} from 'next';
import { Nunito, League_Gothic, Orbitron } from 'next/font/google';
import { cn } from "@/lib/utils";
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import CabaretBorder from '@/components/cabaret-border';
import { Analytics } from "@vercel/analytics/next";

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

const leagueGothic = League_Gothic({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-league-gothic',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SPIN THAT WHEEL',
  description: 'An interactive spinning wheel game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("overflow-x-hidden", nunito.variable, leagueGothic.variable, orbitron.variable)}>
      <head>
 <meta property="og:image" content="/social-card.png" />
 <meta name="twitter:card" content="summary_large_image" />
 <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💫</text></svg>" type="image/svg+xml" />
        {/* Preload the wheel glitter texture (desktop only) so it doesn't pop in after the wheel paints */}
        <link rel="preload" as="image" href="/glitter.webp" media="(min-width: 950px)" />
      </head>
      <body className={cn("font-body antialiased relative")}>
        {children}
        <Toaster />
        <CabaretBorder />
        <Analytics/>
      </body>
    </html>
  );
}
