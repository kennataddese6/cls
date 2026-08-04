"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

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
import { type BookingSubmissionValues, submitBookingAction } from "@/server/booking-actions";

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const servicesList = [
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
              <div className="space-y-1">
                <CardTitle className="text-xl">Select Service Type</CardTitle>
                <CardDescription>Choose the type of cleaning service you require.</CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {servicesList.map((svc) => {
                  const IconComp = svc.icon;
                  const isSelected = formData.service_type === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() => updateField("service_type", svc.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <IconComp className="size-5" />
                        </div>
                        <span className="text-xs font-bold text-primary">{svc.price}</span>
                      </div>
                      <h4 className="font-semibold text-base mt-3">{svc.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{svc.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PROPERTY DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">Property Details</CardTitle>
                <CardDescription>Where will the cleaning take place?</CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="booking-line1" className="text-sm font-medium">
                    Street Address *
                  </label>
                  <Input
                    id="booking-line1"
                    placeholder="e.g. 45 Park Lane"
                    value={formData.line1}
                    onChange={(e) => updateField("line1", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="booking-city" className="text-sm font-medium">
                    City / Town *
                  </label>
                  <Input
                    id="booking-city"
                    placeholder="e.g. London"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="booking-postcode" className="text-sm font-medium">
                    Postcode *
                  </label>
                  <Input
                    id="booking-postcode"
                    placeholder="e.g. W1K 1PN"
                    value={formData.postcode}
                    onChange={(e) => updateField("postcode", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="booking-property_type" className="text-sm font-medium">
                    Property Type
                  </label>
                  <select
                    id="booking-property_type"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={formData.property_type}
                    onChange={(e) => updateField("property_type", e.target.value)}
                  >
                    <option value="house">House</option>
                    <option value="flat">Flat / Apartment</option>
                    <option value="office">Office Space</option>
                    <option value="commercial">Commercial / Retail</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="booking-bedrooms" className="text-sm font-medium">
                    Bedrooms
                  </label>
                  <Input
                    id="booking-bedrooms"
                    type="number"
                    min={0}
                    max={10}
                    value={formData.bedrooms}
                    onChange={(e) => updateField("bedrooms", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="booking-bathrooms" className="text-sm font-medium">
                    Bathrooms
                  </label>
                  <Input
                    id="booking-bathrooms"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.bathrooms}
                    onChange={(e) => updateField("bathrooms", parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="booking-parking_notes" className="text-sm font-medium">
                    Parking Notes (Optional)
                  </label>
                  <Input
                    id="booking-parking_notes"
                    placeholder="e.g. Driveway available / Visitor permit required"
                    value={formData.parking_notes}
                    onChange={(e) => updateField("parking_notes", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">Preferred Schedule</CardTitle>
                <CardDescription>When would you like the cleaning completed?</CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="booking-preferred_date" className="text-sm font-medium">
                    Preferred Date *
                  </label>
                  <Input
                    id="booking-preferred_date"
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => updateField("preferred_date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="booking-arrival_window" className="text-sm font-medium">
                    Arrival Window
                  </label>
                  <select
                    id="booking-arrival_window"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={formData.arrival_window}
                    onChange={(e) => updateField("arrival_window", e.target.value)}
                  >
                    <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                    <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                    <option value="Late Afternoon (16:00 - 19:00)">Late Afternoon (16:00 - 19:00)</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="booking-alternative_date" className="text-sm font-medium">
                    Alternative Date (Optional)
                  </label>
                  <Input
                    id="booking-alternative_date"
                    type="date"
                    value={formData.alternative_date}
                    onChange={(e) => updateField("alternative_date", e.target.value)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="booking-key_arrangements" className="text-sm font-medium">
                    Key Access / Entry Instructions
                  </label>
                  <Input
                    id="booking-key_arrangements"
                    placeholder="e.g. Someone will be home / Key in lockbox (code given later)"
                    value={formData.key_arrangements}
                    onChange={(e) => updateField("key_arrangements", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & DETAILS */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">Your Contact Details</CardTitle>
                <CardDescription>We will send your quote and job updates to this email.</CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="booking-full_name" className="text-sm font-medium">
                    Full Name *
                  </label>
                  <Input
                    id="booking-full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="booking-email" className="text-sm font-medium">
                    Email Address *
                  </label>
                  <Input
                    id="booking-email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="booking-phone" className="text-sm font-medium">
                    Phone Number *
                  </label>
                  <Input
                    id="booking-phone"
                    placeholder="+44 7700 900000"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="booking-customer_notes" className="text-sm font-medium">
                    Special Cleaning Instructions / Notes
                  </label>
                  <Textarea
                    id="booking-customer_notes"
                    rows={3}
                    placeholder="e.g. Please focus on oven, master ensuite, and kitchen tiles..."
                    value={formData.customer_notes}
                    onChange={(e) => updateField("customer_notes", e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2 sm:col-span-2">
                  <Checkbox
                    id="pets"
                    checked={formData.has_pets}
                    onCheckedChange={(checked) => updateField("has_pets", Boolean(checked))}
                  />
                  <label htmlFor="pets" className="text-sm font-normal cursor-pointer">
                    There are pets at the property
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SUBMIT */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <CardTitle className="text-xl">Review Your Booking Request</CardTitle>
                <CardDescription>Please check the summary before submitting your request.</CardDescription>
              </div>

              <div className="bg-muted/40 rounded-xl p-5 border border-border space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">Selected Service:</span>
                    <p className="font-semibold capitalize">{formData.service_type.replace("_", " ")} Clean</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Property:</span>
                    <p className="font-semibold capitalize">
                      {formData.property_type} ({formData.bedrooms} Bed, {formData.bathrooms} Bath)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">Address:</span>
                    <p className="font-medium">
                      {formData.line1}, {formData.city}, {formData.postcode}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Schedule:</span>
                    <p className="font-medium">
                      {formData.preferred_date} ({formData.arrival_window})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Customer:</span>
                    <p className="font-medium">{formData.full_name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Contact:</span>
                    <p className="font-medium">
                      {formData.email} • {formData.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                <ArrowLeft className="size-4 mr-2" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="px-8">
                {loading ? "Submitting Request..." : "Submit Booking Request"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
