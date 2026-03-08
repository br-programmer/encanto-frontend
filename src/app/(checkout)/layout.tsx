import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { CheckoutFooter } from "@/components/checkout/checkout-footer";
import { Providers } from "@/components/providers";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <CheckoutHeader />
      <main className="flex-1">{children}</main>
      <CheckoutFooter />
    </Providers>
  );
}
