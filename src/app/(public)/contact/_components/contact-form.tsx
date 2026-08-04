"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { submitContactFormAction } from "@/server/enquiry-actions";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitContactFormAction({ name, email, phone, subject, message });

      if (!res.success) {
        toast.error(res.error || "Failed to send message. Please try again.");
        setLoading(false);
        return;
      }

      setSubmittedRef(res.reference || "ENQ");
      toast.success("Message sent! Reference: " + res.reference);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("An error occurred while sending your message.");
    } finally {
      setLoading(false);
    }
  };

  if (submittedRef) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
        <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-emerald-800">Message Received!</h3>
        <p className="text-sm text-emerald-700 max-w-md mx-auto leading-relaxed">
          Thank you for contacting Sam Spotless Cleaning. Your enquiry reference is{" "}
          <span className="font-mono font-bold text-foreground underline">{submittedRef}</span>. Our administration team
          will get back to you shortly!
        </p>
        <Button variant="outline" onClick={() => setSubmittedRef(null)} className="mt-2">
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-sm font-medium">
            Your Name *
          </label>
          <Input
            id="contact-name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className="text-sm font-medium">
            Email Address *
          </label>
          <Input
            id="contact-email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="contact-phone" className="text-sm font-medium">
            Phone Number (Optional)
          </label>
          <Input
            id="contact-phone"
            type="tel"
            placeholder="+44 7700 900000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-subject" className="text-sm font-medium">
            Subject *
          </label>
          <Input
            id="contact-subject"
            placeholder="Quotation enquiry / General question"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-sm font-medium">
          Message *
        </label>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="How can we help you?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 gap-2 font-semibold text-base">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {loading ? "Sending Message..." : "Send Message"}
      </Button>
    </form>
  );
}
