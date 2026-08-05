import Link from "next/link";
import Image from "next/image";

import {
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Home,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServicesListAction } from "@/server/service-actions";

export default async function LandingPage() {
  const dbServices = await getServicesListAction();

  const services =
    dbServices.length > 0
      ? dbServices.map((s) => {
          let icon = Home;
          const tLower = s.title.toLowerCase();
          let popular = false;

          if (tLower.includes("deep")) {
            icon = Sparkles;
            popular = true;
          } else if (tLower.includes("tenancy")) {
            icon = ShieldCheck;
          } else if (tLower.includes("office") || tLower.includes("commercial")) {
            icon = Building2;
          }

          const priceDisplay = s.price.startsWith("From")
            ? s.price
            : `From ${s.price.startsWith("£") ? s.price : `£${s.price}`}`;

          return {
            title: s.title,
            price: priceDisplay,
            duration: s.duration || "2 hours",
            icon: icon,
            description: s.description || "Professional cleaning service.",
            features:
              s.checklist && s.checklist.length > 0
                ? s.checklist.slice(0, 4)
                : ["Dusting & wiping surfaces", "Vacuuming & mopping floors", "Sanitising surfaces"],
            popular: popular,
          };
        })
      : [
          {
            title: "Standard Cleaning",
            price: "From £80",
            duration: "2 hours",
            icon: Home,
            description: "Regular domestic cleaning for kitchen, bathrooms, bedrooms, and living spaces.",
            features: [
              "Dusting & wiping surfaces",
              "Vacuuming & mopping floors",
              "Bathroom scrubbing",
              "Kitchen counter sanitising",
            ],
          },
          {
            title: "Deep Cleaning",
            price: "From £150",
            duration: "4 hours",
            icon: Sparkles,
            description: "Thorough top-to-bottom clean tackling built-up grime, appliances, and hidden areas.",
            features: [
              "Inside oven & fridge",
              "Skirting boards & doors",
              "Limescale removal",
              "Detailed tile & grout clean",
            ],
            popular: true,
          },
          {
            title: "End of Tenancy",
            price: "From £220",
            duration: "6 hours",
            icon: ShieldCheck,
            description: "Landlord-approved guarantee clean ensuring 100% deposit return.",
            features: [
              "Full property sanitisation",
              "Inside all cupboards",
              "Deposit return guarantee",
              "Before & After photo evidence",
            ],
          },
          {
            title: "Office Cleaning",
            price: "From £120",
            duration: "3 hours",
            icon: Building2,
            description: "Customized commercial cleaning for productive, hygienic workplace environments.",
            features: [
              "Desk & workstation sanitisation",
              "Communal kitchen clean",
              "Trash emptying & recycling",
              "Washroom disinfection",
            ],
          },
        ];

  const highlights = [
    {
      icon: ShieldCheck,
      title: "Vetted Cleaners",
      description: "All cleaners undergo identity checks, background verification, and rigorous training.",
    },
    {
      icon: Camera,
      title: "Photo Evidence Guarantee",
      description: "Cleaners upload timestamped before & after photos for full transparency and quality review.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Choose your preferred arrival window and date. Easy online quotation and invoice tracking.",
    },
    {
      icon: Sparkles,
      title: "100% Satisfaction Guarantee",
      description: "If you are not completely satisfied with any area cleaned, we will re-clean it free of charge.",
    },
  ];

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Badge
                variant="outline"
                className="px-3.5 py-1 text-xs font-semibold rounded-full border-primary/30 text-primary bg-primary/10"
              >
                <Sparkles className="size-3.5 mr-1.5 inline-block text-primary" />
                Trusted Professional Cleaning Services
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                Spotless Cleanliness, <span className="text-primary">Effortless Peace of Mind.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Book professional cleaners for your home or business in minutes. Transparent quotes, automatic
                invoicing, and guaranteed quality with photo evidence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-md" asChild>
                  <Link href="/book">
                    Book a Cleaning Service <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
                  <Link href="/services">View Pricing & Services</Link>
                </Button>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/60 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-xs text-muted-foreground">Jobs Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">4.9 / 5.0</p>
                  <p className="text-xs text-muted-foreground">Customer Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-xs text-muted-foreground">Photo Evidence</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-border shadow-2xl space-y-0 bg-card">
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <Image
                    src="/images/clean_home.png"
                    alt="Pristine Modern Home Interior"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                    <Badge className="bg-emerald-500 text-white font-semibold">100% Quality Guaranteed</Badge>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Instant Quote Request</h3>
                      <p className="text-xs text-muted-foreground">Get a clear price estimate today</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      Fast 24h Response
                    </Badge>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs font-medium">
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                      <span>Domestic, Deep & Commercial Cleaning</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-medium">
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                      <span>Itemised Official Quotations & Invoices</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-medium">
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                      <span>Before & After Photo Evidence Report</span>
                    </div>
                  </div>

                  <Button className="w-full h-11 text-base font-medium" asChild>
                    <Link href="/book">Start Request Form</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="text-primary border-primary/30">
            Our Offerings
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Tailored Cleaning Services</h2>
          <p className="text-muted-foreground text-base">
            Choose from our range of specialized cleaning packages for home, office, or move-out needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, idx) => {
            const IconComponent = s.icon;
            return (
              <Card key={idx} className={`flex flex-col relative ${s.popular ? "border-primary shadow-lg" : ""}`}>
                {s.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <IconComponent className="size-5" />
                  </div>
                  <CardTitle className="text-xl">{s.title}</CardTitle>
                  <CardDescription>{s.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">{s.price}</span>
                      <span className="text-xs text-muted-foreground">/ {s.duration} approx</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {s.features.map((feat, fidx) => (
                        <li key={fidx} className="flex items-center gap-2">
                          <Check className="size-3.5 text-primary shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant={s.popular ? "default" : "outline"} className="w-full" asChild>
                    <Link href={`/book?service=${encodeURIComponent(s.title)}`}>Book Service</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/30 py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="text-primary border-primary/30">
              Why Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">The Cleaning Company Difference</h2>
            <p className="text-muted-foreground text-base">
              We combine professional cleaning standards with complete digital transparency at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((h, idx) => {
              const IconComp = h.icon;
              return (
                <div key={idx} className="bg-card border border-border p-6 rounded-2xl space-y-3">
                  <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <IconComp className="size-6" />
                  </div>
                  <h3 className="font-semibold text-lg">{h.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{h.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="text-primary border-primary/30">
            Simple Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
            <span className="text-3xl font-black text-primary/20">01</span>
            <h3 className="font-semibold text-lg">Request Service</h3>
            <p className="text-xs text-muted-foreground">
              Fill in your property details and preferred date on our easy booking form.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
            <span className="text-3xl font-black text-primary/20">02</span>
            <h3 className="font-semibold text-lg">Receive Quotation</h3>
            <p className="text-xs text-muted-foreground">
              Our team reviews your request and sends an itemised quotation for online acceptance.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
            <span className="text-3xl font-black text-primary/20">03</span>
            <h3 className="font-semibold text-lg">Job Executed</h3>
            <p className="text-xs text-muted-foreground">
              Assigned cleaner completes work and uploads timestamped before & after photo evidence.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
            <span className="text-3xl font-black text-primary/20">04</span>
            <h3 className="font-semibold text-lg">Review & Pay</h3>
            <p className="text-xs text-muted-foreground">
              Review completed job evidence, view your invoice, and pay securely via bank transfer or cash.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="bg-muted/30 py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="text-primary border-primary/30">
              Reviews
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Loved by Homeowners & Tenants</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "The end of tenancy clean was flawless! My landlord returned 100% of my deposit without any questions. The photo evidence link was super reassuring.",
                author: "Sarah M.",
                role: "Tenant in London",
                rating: 5,
              },
              {
                quote:
                  "Extremely professional service. Having before and after photos uploaded directly to the job record gives total peace of mind.",
                author: "David K.",
                role: "Homeowner",
                rating: 5,
              },
              {
                quote:
                  "We use them for our office cleaning twice a week. Reliable, punctual, and the invoice workflow is super smooth for our accounting team.",
                author: "Emma T.",
                role: "Office Manager",
                rating: 5,
              },
            ].map((t, idx) => (
              <Card key={idx} className="flex flex-col justify-between">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">&quot;{t.quote}&quot;</p>
                  <div>
                    <p className="font-semibold text-sm">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 text-center space-y-6 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready for a Pristine Space?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-base">
            Get an instant quotation or book your cleaning service in less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button size="lg" variant="secondary" className="text-base font-semibold px-8 h-12" asChild>
              <Link href="/book">Book Your Clean Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base font-semibold px-8 h-12 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
