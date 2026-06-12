import type { Metadata } from "next";
import "@showcase/design-system/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Godofredo C. Gatus II",
  description: "Platform engineer showcase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#architecture-explorer">
          Skip to demonstrators
        </a>
        {children}
      </body>
    </html>
  );
}
