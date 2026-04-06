import { Suspense } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { ServiceRequestForm } from "@/components/service-request-form";
import { api } from "@/lib/api";

export const metadata = {
  title: "Solicitar Servicio | Encanto Floristería",
  description: "Solicita una cotización para nuestros servicios de decoración floral, propuestas y eventos especiales.",
};

export const revalidate = 60;

export default async function SolicitarServicioPage() {
  const { result: services } = await api.serviceCatalog.list();

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Solicitar Servicio" }]} />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-3">Solicitar cotización</h1>
          <p className="text-foreground-secondary">
            Cuéntanos qué necesitas y te enviaremos una propuesta personalizada.
          </p>
        </div>

        <Suspense fallback={null}>
          <ServiceRequestForm services={services} />
        </Suspense>
      </div>
    </div>
  );
}
