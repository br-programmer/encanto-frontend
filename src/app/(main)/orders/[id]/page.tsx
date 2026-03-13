import { redirect } from "next/navigation";

export default async function OrderRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  const url = token ? `/pedidos/${id}?token=${token}` : `/pedidos/${id}`;
  redirect(url);
}
