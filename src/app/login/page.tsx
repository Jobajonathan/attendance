import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm space-y-6 p-8">
        <div className="space-y-2">
          <Logo size={40} />
          <p className="text-sm text-slate-500">Light Nation Protocol Department</p>
        </div>

        <LoginForm />
      </Card>
    </div>
  );
}
