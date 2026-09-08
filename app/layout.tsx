import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  icons: { icon: './favicon.svg' },
  title: 'HA-MAI | Measuring Mirror Structure in Prediction Error',
  description: 'The error-normalized Hop-Adaptive Mirror Artifact Index: definition, periodic templates, ridge fitting, interpretation, and boundary experiments.',
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
