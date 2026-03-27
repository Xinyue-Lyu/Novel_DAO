import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novel DAO Frontend",
  description: "Frontend for a DAO-based novel contest platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#f9fafb", color: "#111827" }}>
        {children}
      </body>
    </html>
  );
}