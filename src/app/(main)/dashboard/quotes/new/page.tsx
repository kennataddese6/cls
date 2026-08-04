"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, FileText, Send, Save, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { createQuoteAction, type QuoteItemInput } from "@/server/quote-actions";

export default function QuoteBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const [loading, setLoading] = useState(false);
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0]);
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
  );
  const [appointmentTime, setAppointmentTime] = useState("Morning (09:00 AM)");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(20);
  const [scope, setScope] = useState("Professional domestic/commercial cleaning service as agreed.");
  const [terms, setTerms] = useState("Payment due upon completion of service. Quotation valid for 14 days from issue.");

  const [items, setItems] = useState<QuoteItemInput[]>([
    { description: "Standard Cleaning Service", quantity: 1, unit_price: 80 },
  ]);

  const addItem = () => {
    setItems((prev) => [...prev, { description: "Additional Task / Extra", quantity: 1, unit_price: 25 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("Quotation must have at least one line item");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItemInput, value: unknown) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Totals calculations
  const rawSubtotal = items.reduce((acc, item) => acc + (item.quantity || 0) * (item.unit_price || 0), 0);
  const discountedSubtotal = Math.max(0, rawSubtotal - (discountAmount || 0));
  const vatAmount = (discountedSubtotal * (vatRate || 0)) / 100;
  const grandTotal = discountedSubtotal + vatAmount;

  const handleSave = async (sendImmediately: boolean) => {
    if (!bookingId) {
      toast.error("No booking selected for this quotation");
      return;
    }

    setLoading(true);
    try {
      const res = await createQuoteAction(
        {
          booking_id: bookingId,
          scope,
          terms,
          expiry_date: expiryDate,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          discount_amount: Number(discountAmount) || 0,
          vat_rate: Number(vatRate) || 0,
          items,
        },
        sendImmediately,
      );

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success(sendImmediately ? "Quotation sent to customer!" : "Quotation draft saved");
      router.push("/dashboard/quotes");
    } catch {
      toast.error("Failed to save quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/quotes">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Quotation</h1>
            <p className="text-xs text-muted-foreground">
              Booking Ref ID: <span className="font-mono text-primary">{bookingId || "Not selected"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
            <Save className="size-4 mr-1.5" /> Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={loading}>
            <Send className="size-4 mr-1.5" /> Send to Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Schedule & Expiry */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Appointment & Validity</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Appointment Date</label>
                <Input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Arrival Window</label>
                <Input
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  placeholder="e.g. Morning (09:00 AM)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Quote Expiry Date</label>
                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Line Items Table */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Line Items & Pricing</CardTitle>
                <CardDescription>Itemise cleaning tasks, labor, and extras</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="size-3.5 mr-1" /> Add Line
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item, idx) => {
                  const lineTotal = (item.quantity || 0) * (item.unit_price || 0);
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg bg-muted/40 border border-border text-sm"
                    >
                      <div className="col-span-6 space-y-1">
                        <label className="text-[10px] text-muted-foreground">Description</label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(idx, "description", e.target.value)}
                          placeholder="Task description"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] text-muted-foreground">Qty</label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 1)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] text-muted-foreground">Unit (£)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={item.unit_price}
                          onChange={(e) => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="col-span-2 flex items-center justify-between pt-4">
                        <span className="font-semibold text-xs">£{lineTotal.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => removeItem(idx)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Scope & Terms */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Scope & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Scope of Work</label>
                <Textarea rows={3} value={scope} onChange={(e) => setScope(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Terms & Conditions</label>
                <Textarea rows={2} value={terms} onChange={(e) => setTerms(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Calculation Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border sticky top-20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="size-4 text-primary" /> Summary & Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground text-xs">Subtotal</span>
                <span className="font-semibold">£{rawSubtotal.toFixed(2)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Discount (£)</label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">VAT Rate (%)</label>
                <Input
                  type="number"
                  step="1"
                  min={0}
                  max={100}
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground text-xs">Calculated VAT ({vatRate}%)</span>
                <span className="font-semibold text-xs">£{vatAmount.toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="font-bold text-base">Grand Total</span>
                <span className="font-bold text-xl text-primary">£{grandTotal.toFixed(2)}</span>
              </div>

              <div className="pt-4 space-y-2">
                <Button className="w-full" onClick={() => handleSave(true)} disabled={loading}>
                  <Send className="size-4 mr-1.5" /> Send Quote Link to Customer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
