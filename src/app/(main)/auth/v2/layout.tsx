import type { ReactNode } from "react";
import Image from "next/image";
import { Sparkles, ShieldCheck } from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="h-screen w-full overflow-hidden bg-background">
      <div className="grid h-full justify-center p-2 lg:grid-cols-2">
        {/* Left Side: Login Form */}
        <div className="relative order-1 flex h-full items-center justify-center p-6">{children}</div>

        {/* Right Side: High-res Hero Image Panel */}
        <div className="relative order-2 hidden h-full rounded-3xl overflow-hidden bg-neutral-900 lg:flex flex-col justify-between p-12 text-white">
          <Image
            src="/images/login_hero.png"
            alt="Professional Cleaning Management"
            fill
            priority
            className="object-cover object-center opacity-45 mix-blend-overlay"
          />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                <Sparkles className="size-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">{APP_CONFIG.name}</span>
            </div>
          </div>

          <div className="relative z-10 max-w-md space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="size-4" /> Operational Management Portal
            </div>
            <h2 className="text-3xl font-bold leading-tight">Spotless Cleanliness & Effortless Workflow Management.</h2>
            <p className="text-sm text-neutral-200 leading-relaxed">
              Track customer enquiries, generate itemised quotes, assign verified cleaners, and review before & after
              photo evidence.
            </p>
          </div>

          <div className="relative z-10 text-xs text-neutral-400 border-t border-white/10 pt-4">
            {APP_CONFIG.copyright}
          </div>
        </div>
      </div>
    </main>
  );
}
