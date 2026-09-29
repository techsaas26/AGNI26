import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Merch" };

// TODO: merch images (front/back), price, and order form link.
export default function MerchPage() {
  return (
    <>
      <PageHeader title="Merch" subtitle="Official AGNI'26 merchandise" />
      <p className="px-4 pb-16 text-center text-paper/60">Drops soon.</p>
    </>
  );
}
