import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = {
  title: "Checkout | Encanto Florería",
  description: "Completa tu pedido y recibe tus flores frescas en Manta.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <CheckoutForm />
      </div>
    </div>
  );
}
