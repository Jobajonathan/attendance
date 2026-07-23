import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "./register-form";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default async function RegisterPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: linkRows } = await supabase.rpc("get_registration_link", { p_token: token });
  const link = linkRows?.[0];

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <Logo size={40} className="mb-6" />
      <Card className="w-full max-w-md p-8">
        <h1 className="font-heading text-lg font-semibold text-neutral-900">New Member Registration</h1>
        {!link ? (
          <Alert tone="info" className="mt-3">
            This registration link isn&apos;t valid.
          </Alert>
        ) : !link.is_active ? (
          <Alert tone="info" className="mt-3">
            This registration link is no longer active. Contact your Administrative Officer for a
            current link.
          </Alert>
        ) : (
          <>
            <p className="mt-1 text-sm text-neutral-500">
              Fill in your details below. A department admin will review and approve your
              registration.
            </p>
            <RegisterForm token={token} />
          </>
        )}
      </Card>
    </div>
  );
}
