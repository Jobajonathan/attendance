import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-sm space-y-6 p-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <Logo size={48} />
          <p className="mt-1 text-sm text-neutral-500">Light Nation Protocol Department</p>
        </div>

        <LoginForm />
      </Card>
    </div>
  );
}
