"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Copy, Check, ShieldCheck, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { createCleanerAccountAction } from "@/server/job-actions";

export default function CreateCleanerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cleanerType, setCleanerType] = useState<"individual" | "company">("individual");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [serviceAreas, setServiceAreas] = useState("North London, Central London");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      toast.error("Please fill in required fields (Name, Email, Phone)");
      return;
    }

    setLoading(true);
    try {
      const res = await createCleanerAccountAction({
        full_name: fullName,
        email,
        phone,
        cleaner_type: cleanerType,
        company_name: companyName,
        address,
        service_areas: serviceAreas,
        notes,
      });

      if (!res.success || !res.generatedPassword) {
        toast.error(res.error || "Failed to create cleaner account");
        return;
      }

      toast.success("Cleaner account created!");
      setCreatedCredentials({
        email: res.email || email,
        password: res.generatedPassword,
      });
    } catch {
      toast.error("Failed to create cleaner account");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "email" | "password") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast.success("Email copied to clipboard");
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
      toast.success("Password copied to clipboard");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/cleaners">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Cleaner Account</h1>
          <p className="text-xs text-muted-foreground">
            Generate credentials for a new cleaner and share via WhatsApp manually.
          </p>
        </div>
      </div>

      {createdCredentials ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-700 flex items-center gap-2">
              <ShieldCheck className="size-6 text-emerald-600" /> Cleaner Account Created!
            </CardTitle>
            <CardDescription>Copy credentials below to send to the cleaner via WhatsApp.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-card border border-border space-y-4 font-mono text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-sans">Email Address:</span>
                  <p className="font-bold">{createdCredentials.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdCredentials.email, "email")}
                  className="gap-1.5"
                >
                  {copiedEmail ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  {copiedEmail ? "Copied" : "Copy Email"}
                </Button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <span className="text-xs text-muted-foreground font-sans">Generated Password:</span>
                  <p className="font-bold text-primary">{createdCredentials.password}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdCredentials.password, "password")}
                  className="gap-1.5"
                >
                  {copiedPassword ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  {copiedPassword ? "Copied" : "Copy Password"}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCreatedCredentials(null)}>
                Create Another Cleaner
              </Button>
              <Button asChild>
                <Link href="/dashboard/cleaners">Go to Cleaners Directory</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Cleaner Profile & Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="cleaner-full_name" className="text-sm font-medium">
                    Full Name *
                  </label>
                  <Input
                    id="cleaner-full_name"
                    placeholder="e.g. John Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cleaner-email" className="text-sm font-medium">
                    Email Address *
                  </label>
                  <Input
                    id="cleaner-email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cleaner-phone" className="text-sm font-medium">
                    Phone Number *
                  </label>
                  <Input
                    id="cleaner-phone"
                    placeholder="+44 7700 900000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cleaner-cleaner_type" className="text-sm font-medium">
                    Cleaner Type
                  </label>
                  <select
                    id="cleaner-cleaner_type"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={cleanerType}
                    onChange={(e) => setCleanerType(e.target.value as "individual" | "company")}
                  >
                    <option value="individual">Individual Cleaner</option>
                    <option value="company">Subcontractor / Cleaning Company</option>
                  </select>
                </div>

                {cleanerType === "company" && (
                  <div className="space-y-2">
                    <label htmlFor="cleaner-company_name" className="text-sm font-medium">
                      Company Name
                    </label>
                    <Input
                      id="cleaner-company_name"
                      placeholder="e.g. Apex Cleaners Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="cleaner-service_areas" className="text-sm font-medium">
                    Service Areas (comma-separated)
                  </label>
                  <Input
                    id="cleaner-service_areas"
                    placeholder="e.g. North London, Islington, Camden"
                    value={serviceAreas}
                    onChange={(e) => setServiceAreas(e.target.value)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="cleaner-notes" className="text-sm font-medium">
                    Internal Notes (Optional)
                  </label>
                  <Textarea
                    id="cleaner-notes"
                    rows={3}
                    placeholder="Special skills, availability preferences, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 text-base gap-2">
                <UserPlus className="size-4" />{" "}
                {loading ? "Creating Account & Credentials..." : "Generate Cleaner Credentials"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
