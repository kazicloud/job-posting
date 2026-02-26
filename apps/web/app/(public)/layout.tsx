import { ReactNode } from "react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
