import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";
import { LoginForm } from "../../_components/login-form";

export default function LoginV2() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-3xl">Portal Login</h1>
        <p className="text-muted-foreground text-sm">Please enter your credentials to proceed.</p>
      </div>

      <div className="space-y-4">
        <LoginForm />
      </div>

      <div className="text-center">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Return to Website
        </Link>
      </div>
    </div>
  );
}
