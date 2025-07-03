import type {Metadata} from 'next';
import { cn } from "@/lib/utils";
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import CabaretBorder from '@/components/cabaret-border';
import { Analytics } from "@vercel/analytics/next";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
 <meta property="og:image" content="/social-card.png" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta property="og:image" content="/social-card.png" />
 <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💫</text></svg>" type="image/svg+xml" />
 <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌀</text></svg>" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Orbitron:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased relative overflow-x-hidden")}>
        {children}
        <Toaster />
        <CabaretBorder />
        <Analytics/>
      </body>
    </html>
  );
}
