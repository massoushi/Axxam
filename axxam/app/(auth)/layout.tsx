import SiteShell from "@/components/layout/SiteShell";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteShell showFooter={false}>{children}</SiteShell>;
}
