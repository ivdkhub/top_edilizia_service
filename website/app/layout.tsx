import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Top Edilizia Service | Costruzioni e ristrutturazioni a Saronno",
  description:
    "Impresa edile a Saronno: costruzioni, ristrutturazioni civili e industriali e restauro edifici. Top Edilizia Service S.r.l., esperienza e qualità in Lombardia.",
  icons: {
    icon: "/media/logo.png",
    shortcut: "/media/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">
        <noscript>
          <style>{".site-loader{display:none}html,body{overflow:auto!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
