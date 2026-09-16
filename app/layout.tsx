import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  icons: { icon: './favicon.svg' },
  title: 'Sample-Level Speech and Noise Prediction — Supplementary Material',
  description: 'HA-MAI and hop-periodic artifact mitigation: metric details and target, prediction, and error examples from six speech and noise test corpora.',
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><head><link rel="stylesheet" href="./fonts/fonts.css" /></head><body>{children}</body></html>;
}
