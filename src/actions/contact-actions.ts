"use server";

import { api } from "@/lib/api";
import type { CreateContactRequest } from "@/lib/api";

export async function submitContactAction(
  data: CreateContactRequest
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await api.contact.create(data);
    return { success: true };
  } catch (err: unknown) {
    const apiErr = err as { status?: number; data?: { message?: string } };

    if (apiErr.status === 429) {
      return { success: false, error: "Has enviado demasiados mensajes. Intenta en un minuto." };
    }

    const message = apiErr?.data?.message || "Error al enviar el mensaje. Intenta de nuevo.";
    return { success: false, error: message };
  }
}
