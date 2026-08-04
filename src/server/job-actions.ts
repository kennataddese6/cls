"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateCleanerInput {
  full_name: string;
  email: string;
  phone: string;
  cleaner_type: "individual" | "company";
  company_name?: string;
  address?: string;
  service_areas?: string;
  notes?: string;
}

export async function createCleanerAccountAction(input: CreateCleanerInput) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) throw new Error("Unauthorized: Admin login required");

    // Generate random strong password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    let autoPassword = "";
    for (let i = 0; i < 12; i++) {
      autoPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create Supabase Auth User with service role or auth signup
    const { data: authUser, error: authErr } = await supabase.auth.signUp({
      email: input.email,
      password: autoPassword,
      options: {
        data: {
          role: "cleaner",
          full_name: input.full_name,
        },
      },
    });

    if (authErr || !authUser.user) {
      throw new Error(authErr?.message || "Failed to create cleaner auth account");
    }

    const cleanerId = authUser.user.id;

    // Insert or update profiles table
    await supabase.from("profiles").upsert({
      id: cleanerId,
      role: "cleaner",
      full_name: input.full_name,
      phone: input.phone,
    });

    // Insert into cleaners table
    const serviceAreasArray = input.service_areas ? input.service_areas.split(",").map((s) => s.trim()) : ["General"];

    await supabase.from("cleaners").insert({
      id: cleanerId,
      cleaner_type: input.cleaner_type,
      company_name: input.company_name || null,
      address: input.address || null,
      service_areas: serviceAreasArray,
      status: "available",
      notes: input.notes || null,
    });

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: adminUser.id,
      actor_role: "admin",
      action: "cleaner.created",
      record_type: "cleaners",
      record_id: cleanerId,
      new_value: { email: input.email, full_name: input.full_name },
    });

    revalidatePath("/dashboard/cleaners");

    return {
      success: true,
      cleanerId,
      email: input.email,
      generatedPassword: autoPassword,
    };
  } catch (err: unknown) {
    console.error("[createCleanerAccountAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to create cleaner account";
    return { success: false, error: errorMessage };
  }
}

export async function getCleanersList() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cleaners")
    .select("*, profile:profiles(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getCleanersList]", error);
    return [];
  }
  return data;
}

export async function getCleanerById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: cleaner, error } = await supabase
    .from("cleaners")
    .select("*, profile:profiles(*), jobs(*, booking:bookings(*))")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getCleanerById]", error);
    return null;
  }
  return cleaner;
}

export async function assignCleanerToJobAction(input: {
  booking_id: string;
  cleaner_id: string;
  scheduled_date: string;
  scheduled_time: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) throw new Error("Unauthorized");

    // Check if job record exists for this booking
    const { data: existingJob } = await supabase.from("jobs").select("id").eq("booking_id", input.booking_id).single();

    let jobId: string;
    let secureToken: string;

    if (existingJob) {
      jobId = existingJob.id;
      const { data: updatedJob } = await supabase
        .from("jobs")
        .update({
          cleaner_id: input.cleaner_id,
          scheduled_date: input.scheduled_date,
          scheduled_time: input.scheduled_time,
          declined_at: null,
          declined_reason: null,
        })
        .eq("id", jobId)
        .select("secure_token")
        .single();
      secureToken = updatedJob?.secure_token || "";
    } else {
      const { data: newJob, error: jobErr } = await supabase
        .from("jobs")
        .insert({
          booking_id: input.booking_id,
          cleaner_id: input.cleaner_id,
          scheduled_date: input.scheduled_date,
          scheduled_time: input.scheduled_time,
        })
        .select("id, secure_token")
        .single();

      if (jobErr || !newJob) throw new Error(jobErr?.message || "Failed to assign job");
      jobId = newJob.id;
      secureToken = newJob.secure_token;
    }

    // Update booking status to cleaner_assigned
    await supabase.from("bookings").update({ status: "cleaner_assigned" }).eq("id", input.booking_id);

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: adminUser.id,
      actor_role: "admin",
      action: "job.assigned",
      record_type: "jobs",
      record_id: jobId,
      new_value: { cleaner_id: input.cleaner_id, scheduled_date: input.scheduled_date },
    });

    revalidatePath(`/dashboard/jobs/${jobId}`);
    revalidatePath("/dashboard/jobs");

    return {
      success: true,
      jobId,
      secureToken,
    };
  } catch (err: unknown) {
    console.error("[assignCleanerToJobAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to assign cleaner to job";
    return { success: false, error: errorMessage };
  }
}

export async function getJobsList(statusFilter?: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "*, cleaner:cleaners(*, profile:profiles(*)), booking:bookings(*, customer:customers(*), address:customer_addresses(*))",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getJobsList]", error);
    return [];
  }
  return data;
}

export async function getJobById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      "*, cleaner:cleaners(*, profile:profiles(*)), booking:bookings(*, customer:customers(*), address:customer_addresses(*), photos(*))",
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getJobById]", error);
    return null;
  }
  return job;
}

export async function getJobByToken(token: string) {
  const supabase = await createSupabaseServerClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      "*, cleaner:cleaners(*, profile:profiles(*)), booking:bookings(*, customer:customers(*), address:customer_addresses(*), photos(*))",
    )
    .eq("secure_token", token)
    .single();

  if (error) {
    console.error("[getJobByToken]", error);
    return null;
  }
  return job;
}

export async function updateCleanerJobStatusAction(input: {
  job_id: string;
  action: "accept" | "decline" | "start" | "complete";
  declined_reason?: string;
  cleaner_notes?: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: cleanerUser },
    } = await supabase.auth.getUser();

    if (!cleanerUser) throw new Error("Unauthorized");

    const { data: job } = await supabase
      .from("jobs")
      .select("id, booking_id, cleaner_id")
      .eq("id", input.job_id)
      .single();

    if (!job) throw new Error("Job not found");

    const now = new Date().toISOString();

    if (input.action === "accept") {
      await supabase.from("jobs").update({ accepted_at: now }).eq("id", job.id);
      await supabase.from("bookings").update({ status: "cleaner_accepted" }).eq("id", job.booking_id);
    } else if (input.action === "decline") {
      await supabase
        .from("jobs")
        .update({ declined_at: now, declined_reason: input.declined_reason || "Cleaner declined assignment" })
        .eq("id", job.id);
      await supabase.from("bookings").update({ status: "cleaner_assigned" }).eq("id", job.booking_id);
    } else if (input.action === "start") {
      await supabase.from("jobs").update({ started_at: now }).eq("id", job.id);
      await supabase.from("bookings").update({ status: "in_progress" }).eq("id", job.booking_id);
    } else if (input.action === "complete") {
      await supabase.from("jobs").update({ completed_at: now, cleaner_notes: input.cleaner_notes }).eq("id", job.id);
      await supabase.from("bookings").update({ status: "completed_pending_review" }).eq("id", job.booking_id);
    }

    await supabase.from("audit_logs").insert({
      actor_id: cleanerUser.id,
      actor_role: "cleaner",
      action: `job.${input.action}`,
      record_type: "jobs",
      record_id: job.id,
      new_value: { action: input.action },
    });

    revalidatePath(`/cleaner/jobs/${job.id}`);
    revalidatePath("/cleaner/dashboard");

    return { success: true };
  } catch (err: unknown) {
    console.error("[updateCleanerJobStatusAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to update job status";
    return { success: false, error: errorMessage };
  }
}

export async function adminApproveJobCompletionAction(jobId: string, bookingId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) throw new Error("Unauthorized");

    await supabase.from("bookings").update({ status: "completed" }).eq("id", bookingId);

    await supabase.from("audit_logs").insert({
      actor_id: adminUser.id,
      actor_role: "admin",
      action: "job.completion_approved",
      record_type: "jobs",
      record_id: jobId,
    });

    revalidatePath(`/dashboard/jobs/${jobId}`);
    revalidatePath("/dashboard/jobs");

    return { success: true };
  } catch (err: unknown) {
    console.error("[adminApproveJobCompletionAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to approve job completion";
    return { success: false, error: errorMessage };
  }
}
