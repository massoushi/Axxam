import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomBar from "@/components/layout/MobileBottomBar";
import WhatsAppFab from "@/components/layout/WhatsAppFab";

export default function SiteShell({
  children,
  showFooter = true,
  showWhatsApp = true,
}: {
  children: React.ReactNode;
  showFooter?: boolean;
  showWhatsApp?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface)]">
      <Header />
      <div className="flex-1 pb-24 md:pb-0">{children}</div>
      {showFooter && <Footer />}
      <MobileBottomBar />
      {showWhatsApp && <WhatsAppFab className="hidden md:flex" />}
    </div>
  );
}
