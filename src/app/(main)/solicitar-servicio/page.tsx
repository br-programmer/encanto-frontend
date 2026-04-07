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
        <Suspense fallback={null}>
          <ServiceRequestForm services={services} />
        </Suspense>
      </div>
    </div>
  );
}
