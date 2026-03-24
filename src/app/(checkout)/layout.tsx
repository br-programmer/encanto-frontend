import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { CheckoutFooter } from "@/components/checkout/checkout-footer";
import { Providers } from "@/components/providers";
import { PayPalProvider } from "@/components/checkout/paypal-provider";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <PayPalProvider>
        <CheckoutHeader />
        <main className="flex-1">{children}</main>
        <CheckoutFooter />
      </PayPalProvider>
    </Providers>
  );
}
