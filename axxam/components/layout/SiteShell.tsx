import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SiteShell({
  children,
  showFooter = true,
}: {
  children: React.ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)]">
      <Header />
      <div className="flex-1">{children}</div>
      {showFooter && <Footer />}
    </div>
  );
}
