import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="text-primary border-primary/30">
          Get In Touch
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">We&apos;re Here to Help</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Have a question about our cleaning services, need a custom quote, or want to modify an existing booking?
          Contact our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Phone</h4>
                  <p className="text-sm text-muted-foreground">+44 (0) 20 7946 0912</p>
                  <p className="text-xs text-muted-foreground">Mon - Sat: 8:00 AM - 7:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Email</h4>
                  <p className="text-sm text-muted-foreground">hello@cleaningcompany.com</p>
                  <p className="text-xs text-muted-foreground">Support response within 4 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Office Address</h4>
                  <p className="text-sm text-muted-foreground">123 High Street, City Centre</p>
                  <p className="text-xs text-muted-foreground">London, EC1A 1BB</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Working Hours</h4>
                  <p className="text-sm text-muted-foreground">Monday – Saturday: 08:00 – 19:00</p>
                  <p className="text-xs text-muted-foreground">Sunday: Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-sm font-medium">
                      Your Name
                    </label>
                    <Input id="contact-name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input id="contact-email" type="email" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input id="contact-subject" placeholder="Quotation enquiry / General question" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea id="contact-message" rows={5} placeholder="How can we help you?" />
                </div>

                <Button type="button" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
