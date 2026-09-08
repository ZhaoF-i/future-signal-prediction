import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  icons: { icon: './favicon.svg' },
  title: 'HA-MAI — Supplementary Material',
  description: 'Supplementary material on the error-normalized Hop-Adaptive Mirror Artifact Index: definition, estimation, numerical limits, and boundary experiments.',
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
