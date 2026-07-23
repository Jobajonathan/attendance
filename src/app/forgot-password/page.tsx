import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-sm space-y-6 p-8">
        <div className="space-y-2">
          <Logo size={40} />
          <p className="text-sm text-neutral-500">Reset your password</p>
        </div>

        <ForgotPasswordForm />
      </Card>
    </div>
  );
}
