"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Home,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { type BookingSubmissionValues, submitBookingAction } from "@/server/booking-actions";
import { getServicesListAction, type ServiceItem } from "@/server/service-actions";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceParam = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [dbServices, setDbServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    async function fetchDbServices() {
      try {
        const services = await getServicesListAction();
        if (services && services.length > 0) {
          setDbServices(services);
        }
      } catch {
      } finally {
        setServicesLoading(false);
      }
    }
    fetchDbServices();
  }, []);

  // Form State
  const [formData, setFormData] = useState<BookingSubmissionValues>({
    service_type: "standard",
    full_name: "",
    email: "",
    phone: "",
    line1: "",
    city: "London",
    postcode: "",
    property_type: "house",
    bedrooms: 2,
    bathrooms: 1,
    parking_notes: "",
    preferred_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    arrival_window: "Morning (08:00 - 12:00)",
    alternative_date: "",
    required_tasks: "",
    extras: "",
    has_pets: false,
    has_hazards: false,
    key_arrangements: "",
    customer_notes: "",
  });

  useEffect(() => {
    if (initialServiceParam && dbServices.length > 0) {
      const match = dbServices.find((s) => s.title.toLowerCase().trim() === initialServiceParam.toLowerCase().trim());
      if (match) {
        const tLower = match.title.toLowerCase();
        let st: BookingSubmissionValues["service_type"] = "standard";
        if (tLower.includes("deep")) st = "deep";
        else if (tLower.includes("tenancy")) st = "end_of_tenancy";
        else if (tLower.includes("office") || tLower.includes("commercial")) st = "office";

        setFormData((prev) => ({ ...prev, service_type: st }));
      }
    }
  }, [initialServiceParam, dbServices]);

  const updateField = (field: keyof BookingSubmissionValues, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.service_type) {
      toast.error("Please select a service type");
      return;
    }
    if (step === 2 && (!formData.line1 || !formData.postcode)) {
      toast.error("Please enter property address and postcode");
      return;
    }
    if (step === 3 && !formData.preferred_date) {
      toast.error("Please select a preferred date");
      return;
    }
    if (step === 4 && (!formData.full_name || !formData.email || !formData.phone)) {
      toast.error("Please fill in your contact details");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitBookingAction(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Booking request submitted!");
      router.push(`/book/confirmation?ref=${result.bookingReference}`);
    } catch {
      toast.error("Failed to submit booking");
    } finally {
      setLoading(false);
    }
  };

  const fallbackServices = [
    {
      id: "standard",
      name: "Standard Domestic Cleaning",
      price: "From £80",
      desc: "Regular home cleaning for kitchens, bathrooms, and living areas.",
      icon: Home,
    },
    {
      id: "deep",
      name: "Deep Spring Cleaning",
      price: "From £150",
      desc: "Thorough deep clean including appliances and hard-to-reach areas.",
      icon: Sparkles,
    },
    {
      id: "end_of_tenancy",
      name: "End of Tenancy Cleaning",
      price: "From £220",
      desc: "Deposit guarantee clean matching landlord standards.",
      icon: ShieldCheck,
    },
    {
      id: "office",
      name: "Office & Commercial Cleaning",
      price: "From £120",
      desc: "Professional workspace sanitisation and care.",
      icon: Building2,
    },
  ];

  const servicesList =
    dbServices.length > 0
      ? dbServices.map((s) => {
          let icon = Home;
          let serviceTypeId: BookingSubmissionValues["service_type"] = "standard";
          const titleLower = s.title.toLowerCase();

          if (titleLower.includes("deep")) {
            icon = Sparkles;
            serviceTypeId = "deep";
          } else if (titleLower.includes("tenancy")) {
            icon = ShieldCheck;
            serviceTypeId = "end_of_tenancy";
          } else if (titleLower.includes("office") || titleLower.includes("commercial")) {
            icon = Building2;
            serviceTypeId = "office";
          }

          const priceDisplay = s.price.startsWith("From")
            ? s.price
            : `From ${s.price.startsWith("£") ? s.price : `£${s.price}`}`;

          return {
            id: serviceTypeId,
            name: s.title,
            price: priceDisplay,
            desc: s.description || "Professional cleaning service.",
            icon: icon,
          };
        })
      : fallbackServices;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Progress Header */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="text-primary border-primary/30">
          Step {step} of 5
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Request a Cleaning Service</h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details below to receive an official quotation from our team.
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs font-medium border-b border-border pb-4">
        <div className={step >= 1 ? "text-primary font-bold" : "text-muted-foreground"}>1. Service</div>
        <div className={step >= 2 ? "text-primary font-bold" : "text-muted-foreground"}>2. Property</div>
        <div className={step >= 3 ? "text-primary font-bold" : "text-muted-foreground"}>3. Schedule</div>
        <div className={step >= 4 ? "text-primary font-bold" : "text-muted-foreground"}>4. Contact</div>
        <div className={step >= 5 ? "text-primary font-bold" : "text-muted-foreground"}>5. Review</div>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6 space-y-6">
          {/* STEP 1: SERVICE SELECTOR */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Select Service Type</h3>
              <p className="text-xs text-muted-foreground">Choose the type of cleaning service you require.</p>

              {servicesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-5 rounded-xl border border-border bg-card/60 animate-pulse space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="size-10 rounded-lg" />
                        <Skeleton className="h-5 w-20 rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4 rounded-md" />
                        <Skeleton className="h-3.5 w-full rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {servicesList.map((s) => {
                    const Icon = s.icon;
                    const selected = formData.service_type === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => updateField("service_type", s.id)}
                        className={`p-5 rounded-xl border cursor-pointer transition-all space-y-3 ${
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                            : "border-border hover:border-primary/40 bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Icon className="size-5" />
                          </div>
                          <span className="font-bold text-sm text-primary font-mono">{s.price}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-base">{s.name}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-1">{s.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PROPERTY DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Property Details & Address</h3>
              <p className="text-xs text-muted-foreground">Enter the address and property size for your clean.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium">Street Address *</label>
                  <Input
                    placeholder="e.g. 123 High Street"
                    value={formData.line1}
                    onChange={(e) => updateField("line1", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">City / Area</label>
                  <Input value={formData.city} onChange={(e) => updateField("city", e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Postcode *</label>
                  <Input
                    placeholder="e.g. EC1A 1BB"
                    value={formData.postcode}
                    onChange={(e) => updateField("postcode", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Property Type</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    value={formData.property_type}
                    onChange={(e) => updateField("property_type", e.target.value)}
                  >
                    <option value="house">House</option>
                    <option value="flat">Flat / Apartment</option>
                    <option value="office">Office Building</option>
                    <option value="commercial">Commercial Space</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Bedrooms</label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={formData.bedrooms}
                      onChange={(e) => updateField("bedrooms", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Bathrooms</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.bathrooms}
                      onChange={(e) => updateField("bathrooms", parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium">Parking Notes</label>
                  <Input
                    placeholder="e.g. Visitor parking bay available / Resident permit provided"
                    value={formData.parking_notes}
                    onChange={(e) => updateField("parking_notes", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE & ACCESS */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Preferred Date & Arrival Window</h3>
              <p className="text-xs text-muted-foreground">Select when you would like our cleaners to arrive.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Preferred Date *</label>
                  <Input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => updateField("preferred_date", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Arrival Window</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    value={formData.arrival_window}
                    onChange={(e) => updateField("arrival_window", e.target.value)}
                  >
                    <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                    <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                    <option value="Flexible (All Day)">Flexible (All Day)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium">Key & Entry Access Instructions</label>
                  <Input
                    placeholder="e.g. Lockbox code 1234 on side gate / Key with concierge"
                    value={formData.key_arrangements}
                    onChange={(e) => updateField("key_arrangements", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT DETAILS */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Your Contact Information</h3>
              <p className="text-xs text-muted-foreground">Where should we send your official quotation?</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium">Full Name *</label>
                  <Input
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="e.g. sarah@example.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Phone Number *</label>
                  <Input
                    placeholder="e.g. 07700 900123"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium">Special Requests or Instructions</label>
                  <Textarea
                    rows={3}
                    placeholder="e.g. Focus on kitchen oven and descaling main bathroom shower."
                    value={formData.customer_notes}
                    onChange={(e) => updateField("customer_notes", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SUBMIT */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Review Your Booking Request</h3>
              <p className="text-xs text-muted-foreground">
                Please double-check your booking details before submitting.
              </p>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 text-xs">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Service Selected:</span>
                  <span className="font-bold text-foreground capitalize">
                    {formData.service_type.replace("_", " ")} Clean
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold text-foreground">
                    {formData.line1}, {formData.city}, {formData.postcode}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Scheduled Date:</span>
                  <span className="font-semibold text-foreground">
                    {formData.preferred_date} ({formData.arrival_window})
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Customer Name:</span>
                  <span className="font-semibold text-foreground">{formData.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email / Phone:</span>
                  <span className="font-semibold text-foreground">
                    {formData.email} • {formData.phone}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex justify-between pt-4 border-t border-border">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                <ArrowLeft className="size-4 mr-1" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button onClick={handleNext} className="bg-primary">
                Next Step <ArrowRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {loading ? "Submitting Request..." : "Submit Booking Enquiry"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-muted-foreground">Loading booking page...</div>}>
      <BookingContent />
    </Suspense>
  );
}
