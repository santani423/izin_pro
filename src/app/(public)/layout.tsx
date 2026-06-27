import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import WhatsAppFab from "@/components/shared/WhatsAppFab";
import BackToTop from "@/components/shared/BackToTop";

/* ─── Layout halaman publik (company profile) ─── */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFab />
      <BackToTop />
    </>
  );
}
