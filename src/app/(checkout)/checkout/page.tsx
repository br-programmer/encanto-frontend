import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = {
  title: "Checkout | Encanto Florería",
  description: "Completa tu pedido y recibe tus flores frescas en Manta.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl font-serif text-center mb-2">Finalizar compra</h1>
        <p className="text-foreground-secondary text-center">
          Completa los datos de entrega para recibir tu pedido
        </p>
      </div>

      {/* Checkout Form */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <CheckoutForm />
      </div>
    </div>
  );
}
