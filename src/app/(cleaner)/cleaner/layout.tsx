import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles, UserCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app-config";

export default function CleanerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/cleaner/dashboard" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <div>
              <span className="font-bold text-base leading-none">{APP_CONFIG.name}</span>
              <p className="text-[10px] text-muted-foreground font-medium">Cleaner Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/v2/login">
                <LogOut className="size-4 mr-1.5" /> Switch Account
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">{children}</main>
    </div>
  );
}
