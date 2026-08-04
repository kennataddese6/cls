import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getJobByToken } from "@/server/job-actions";

export default async function SecureJobEntryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const job = await getJobByToken(token);

  if (!job) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If cleaner not logged in, redirect to login page with return URL
  if (!user) {
    redirect(`/auth/v2/login?next=/jobs/${token}`);
  }

  // Redirect to cleaner job detail
  redirect(`/cleaner/jobs/${job.id}`);
}
