# Coding Standards

Code conventions and best practices for the CLS project.

---

## Language & Types

- TypeScript strict mode is enabled. No `any`. Use precise types.
- Prefer type inference where it's obvious. Annotate when it adds clarity.
- Use `type` for object shapes. Use `interface` only when extending is needed.
- All Supabase queries should use generated types from `database.types.ts`.

---

## File Naming

| Type | Convention | Example |
|---|---|---|
| Pages | `page.tsx` | `page.tsx` |
| Layouts | `layout.tsx` | `layout.tsx` |
| Components | `kebab-case.tsx` | `booking-details-panel.tsx` |
| Hooks | `use-kebab-case.ts` | `use-current-user.ts` |
| Server Actions | `kebab-case-actions.ts` | `booking-actions.ts` |
| Types/Schemas | `kebab-case-schema.ts` | `booking-schema.ts` |
| Utilities | `kebab-case.ts` | `format-currency.ts` |

---

## Import Aliases

Use `@/` for all internal imports. Never use relative paths with `../../../`.

```ts
// Correct
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Wrong
import { Button } from "../../../components/ui/button";
```

---

## Component Structure

```tsx
// 1. "use client" directive (only if needed — prefer Server Components)
"use client";

// 2. React imports
import type { ReactNode } from "react";

// 3. External library imports
import { useForm } from "react-hook-form";

// 4. Internal imports (ordered: components, hooks, lib, types)
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";

// 5. Types
interface Props {
  bookingId: string;
}

// 6. Component
export function BookingDetailsPanel({ bookingId }: Props) {
  // ...
}
```

---

## Server vs Client Components

| Use Server Component | Use Client Component |
|---|---|
| Fetching data from Supabase | Interactive UI (forms, modals) |
| Layout wrappers | Using `useState`, `useEffect` |
| Static content | Browser APIs |
| Reading cookies/session | Real-time subscriptions |

Keep `page.tsx` as a Server Component by default. Extract interactive pieces into Client Components inside `_components/`.

---

## Server Actions

All mutations go through Server Actions (never client-side Supabase calls for mutations).

```ts
// src/server/booking-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markBookingUnderReview(bookingId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Always check session first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Forbidden");

  // Perform mutation
  const { error } = await supabase
    .from("bookings")
    .update({ status: "under_review" })
    .eq("id", bookingId);

  if (error) throw new Error(error.message);

  // Revalidate affected paths
  revalidatePath(`/dashboard/enquiries/${bookingId}`);
  revalidatePath("/dashboard/enquiries");
  revalidatePath("/dashboard/overview");
}
```

---

## Form Pattern

All forms use React Hook Form + Zod.

```ts
// schema file
import { z } from "zod";

export const contactFormSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
```

```tsx
// form component
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormValues } from "./contact-schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { full_name: "", email: "", phone: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    // call server action
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

---

## Formatting Rules (Biome)

- Double quotes `"` (not single)
- Semicolons required
- 2-space indentation
- 120-character line width
- Sorted imports (Biome auto-handles)

Run before committing:

```bash
npm run check:fix
```

---

## Styling Rules

- Use semantic Tailwind tokens (e.g., `bg-card`, `text-muted-foreground`, `border-border`)
- Never use arbitrary hex/RGB/HSL values. Use Tailwind named colors if a semantic token doesn't exist.
- Never use `!important` except in `globals.css` for explicit overrides
- Keep className strings short — extract to a component if it's getting complex
- Use `cn()` from `@/lib/utils` to merge conditional classes

```ts
import { cn } from "@/lib/utils";

<div className={cn("flex items-center", isActive && "text-primary")} />
```

---

## Git Commit Convention

Use conventional commits:

```
feat: add quote builder form
fix: correct invoice number sequence on year rollover
refactor: extract StatusBadge to shared components
docs: update workflow.md with cleaner decline flow
chore: update sidebar-items.ts with CLS nav structure
```

---

## Error Handling

```ts
// Server Action — always return typed result
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<ActionResult> {
  try {
    // ...
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[updateBookingStatus]", err);
    return { success: false, error: "Failed to update booking status" };
  }
}
```

```tsx
// Client — handle result with toast
const result = await updateBookingStatus(id, "under_review");
if (!result.success) {
  toast.error(result.error);
  return;
}
toast.success("Booking marked as under review");
```

---

## Loading & Empty States

Every data-fetching page must handle:

- **Loading:** Use `<Skeleton />` or `<Spinner />` via Suspense
- **Empty:** Use `<Empty />` component with a descriptive message
- **Error:** Use error boundary or try/catch with user-visible message

---

## Accessibility

- Use semantic HTML: `<main>`, `<nav>`, `<section>`, `<article>`, `<header>`, `<footer>`
- Every interactive element has a visible label (not just placeholder text)
- Icons without text need `aria-label`
- Tables have proper `<thead>`, `<th>` with scope
- Forms: associate labels with inputs via `htmlFor` / `id`
- All pages are keyboard-navigable
- Focus states must be visible (Tailwind `focus-visible:ring` classes)
