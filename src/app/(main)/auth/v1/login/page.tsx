import Link from "next/link";
import Image from "next/image";
import { Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";
import { LoginForm } from "../../_components/login-form";

export default function LoginV1() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Panel: Hero Image & Branding */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white bg-neutral-900 overflow-hidden">
        <Image
          src="/images/login_hero.png"
          alt="Professional Cleaning Service"
          fill
          priority
          className="object-cover object-center opacity-40 mix-blend-overlay"
        />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <Sparkles className="size-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">{APP_CONFIG.name}</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="size-4" /> Secure Staff & Admin Portal
          </div>
          <h2 className="text-3xl font-bold leading-tight">Streamlining Operations & Excellence in Every Clean.</h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Manage customer enquiries, quotations, job assignments, and photo evidence reviews in one unified portal.
          </p>
        </div>

        <div className="relative z-10 flex justify-between items-center text-xs text-neutral-400 border-t border-white/10 pt-6">
          <span>{APP_CONFIG.copyright}</span>
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="size-3.5" /> Back to Website
          </Link>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="font-bold text-base">{APP_CONFIG.name}</span>
          </div>

          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
          >
            <ArrowLeft className="size-3.5" /> Public Website
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm space-y-8 my-auto">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Sign in to Account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your official email address and password to access your dashboard.
            </p>
          </div>

          <LoginForm />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          {APP_CONFIG.copyright} • Authorized Personnel Only
        </div>
      </div>
    </div>
  );
}
