"use client";

import { useState } from "react";
import { Upload, Loader2, Building2, Copy, CheckCircle2 } from "lucide-react";
import { uploadTransferProofAction } from "@/actions/order-actions";
import { formatPrice } from "@/lib/utils";
import type { Order, BankAccount } from "@/lib/api";

interface TransferProofUploadProps {
  orderId: string;
  bankAccounts: BankAccount[];
  totalCents: number;
  onUploadSuccess: (order: Order) => void;
}

export function TransferProofUpload({
  orderId,
  bankAccounts,
  totalCents,
  onUploadSuccess,
}: TransferProofUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const accessToken = (() => {
        try {
          const tokens = localStorage.getItem("encanto-tokens");
          if (tokens) return JSON.parse(tokens).accessToken;
        } catch { /* ignore */ }
        return undefined;
      })();
      const guestToken = localStorage.getItem("encanto-guest-token") || undefined;

      const formData = new FormData();
      formData.append("file", file);

      const updatedOrder = await uploadTransferProofAction(orderId, formData, accessToken, guestToken);
      onUploadSuccess(updatedOrder);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al subir el comprobante";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(id);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      {/* Bank accounts */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Datos para transferencia</h3>
        </div>
        <p className="text-sm text-foreground-secondary mb-4">
          Realiza la transferencia por <span className="font-medium text-primary">{formatPrice(totalCents)}</span>:
        </p>
        <div className="space-y-3">
          {bankAccounts.map((account) => (
            <div key={account.id} className="p-3 bg-secondary/30 rounded-lg border border-border text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-normal">{account.bankName}</p>
                  <p className="text-foreground-secondary">
                    {account.accountType === "savings" ? "Ahorros" : "Corriente"} — {account.accountNumber}
                  </p>
                  <p className="text-foreground-secondary">{account.beneficiary}</p>
                  <p className="text-foreground-secondary">
                    {account.documentType === "cedula" ? "C.I." : "RUC"}: {account.documentNumber}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(account.accountNumber, account.id)}
                  className="p-2 hover:bg-secondary rounded-md transition-colors"
                  title="Copiar número de cuenta"
                >
                  {copiedAccount === account.id ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-foreground-secondary" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="p-6">
        <h3 className="font-normal mb-3">Subir comprobante de pago</h3>
        <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-sm text-foreground-secondary">Subiendo...</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-foreground-muted" />
              <span className="text-sm text-foreground-secondary">
                Haz clic para subir imagen o PDF del comprobante
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
        {uploadError && (
          <p className="text-sm text-destructive mt-2">{uploadError}</p>
        )}
      </div>
    </div>
  );
}
