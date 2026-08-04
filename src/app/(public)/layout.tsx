import type { ReactNode } from "react";

import Link from "next/link";

import { ArrowRight, Clock, Mail, Phone, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app-config";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" /> +44 (0) 20 7946 0912
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Mail className="size-3.5" /> hello@cleaningcompany.com
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> Mon - Sat: 8:00 AM - 7:00 PM
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground transition-transform group-hover:scale-105">
              <Sparkles className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-tight">{APP_CONFIG.name}</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Professional Care
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/services" className="transition-colors hover:text-primary">
              Services
            </Link>
            <Link href="/about" className="transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/gallery" className="transition-colors hover:text-primary">
              Gallery
            </Link>
            <Link href="/testimonials" className="transition-colors hover:text-primary">
              Reviews
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/v2/login">Sign In</Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link href="/book">
                Book Now <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <span className="font-bold text-base">{APP_CONFIG.name}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Premium domestic and commercial cleaning services. Trusted by hundreds of homes and businesses across
                the country.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-4">Quick Links</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/services" className="hover:text-foreground transition-colors">
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="hover:text-foreground transition-colors">
                    Before & After Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className="hover:text-foreground transition-colors">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-4">Services</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>Standard Domestic Clean</li>
                <li>Deep Spring Clean</li>
                <li>End of Tenancy Clean</li>
                <li>Commercial & Office Clean</li>
                <li>Carpet & Upholstery Clean</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-4">Get In Touch</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>123 High Street, London, EC1A 1BB</li>
                <li>+44 (0) 20 7946 0912</li>
                <li>hello@cleaningcompany.com</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>{APP_CONFIG.copyright}</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
