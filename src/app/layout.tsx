import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Life in Jakarta',
  description: 'Smart daily planning for Jakarta life - real-time flood alerts, traffic conditions, and optimal departure times',
  keywords: ['Jakarta', 'flood', 'traffic', 'dashboard', 'Indonesia', 'banjir', 'lalu lintas', 'life', 'daily planning'],
  authors: [{ name: 'Jakarta Smart City' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Leaflet CSS for map */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-slate-100 dark:bg-slate-900">
        {children}
      </body>
    </html>
  );
}
