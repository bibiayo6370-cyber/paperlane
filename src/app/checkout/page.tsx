import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutView from "@/components/CheckoutView";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <CheckoutView email={user.email ?? ""} />
    </div>
  );
}
