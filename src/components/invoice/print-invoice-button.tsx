"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintInvoiceButton({ className }: { className?: string }) {
  return (
    <Button variant="outline" size="sm" className={className} onClick={() => window.print()}>
      <Printer className="size-3.5 mr-1.5" /> Print / PDF Invoice
    </Button>
  );
}
