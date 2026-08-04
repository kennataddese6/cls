"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

    const adminSupabase = createSupabaseAdminClient();

    // Generate random strong password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    let autoPassword = "";
    for (let i = 0; i < 12; i++) {
      autoPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    let cleanerId: string;

    // Use Admin Client to create a pre-confirmed user
    const { data: newUser, error: createErr } = await adminSupabase.auth.admin.createUser({
      email: input.email,
      password: autoPassword,
      email_confirm: true,
      user_metadata: {
        role: "cleaner",
        full_name: input.full_name,
      },
    });

    if (newUser?.user) {
      cleanerId = newUser.user.id;
    } else if (createErr && createErr.message.includes("already registered")) {
      // Fetch existing user ID and update password
      const { data: userList } = await adminSupabase.auth.admin.listUsers();
      const existingUser = userList?.users.find((u) => u.email === input.email);

      if (!existingUser) throw new Error("User registered but ID not found");
      cleanerId = existingUser.id;

      // Update password & metadata for existing cleaner
      await adminSupabase.auth.admin.updateUserById(cleanerId, {
        password: autoPassword,
        email_confirm: true,
        user_metadata: { role: "cleaner", full_name: input.full_name },
      });
    } else {
      throw new Error(createErr?.message || "Failed to create cleaner account");
    }

    // Upsert into profiles table using adminSupabase to bypass RLS restrictions
    await adminSupabase.from("profiles").upsert({
      id: cleanerId,
      role: "cleaner",
      full_name: input.full_name,
      phone: input.phone,
    });

    // Upsert into cleaners table using adminSupabase
    const serviceAreasArray = input.service_areas ? input.service_areas.split(",").map((s) => s.trim()) : ["General"];

    await adminSupabase.from("cleaners").upsert({
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

export async function updateCleanerAction(input: {
  id: string;
  full_name: string;
  phone: string;
  cleaner_type: "individual" | "company";
  company_name?: string;
  address?: string;
  service_areas?: string;
  status: "available" | "busy" | "inactive";
  notes?: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) throw new Error("Unauthorized");

    // Update profile
    await supabase
      .from("profiles")
      .update({
        full_name: input.full_name,
        phone: input.phone,
      })
      .eq("id", input.id);

    // Update cleaner record
    const serviceAreasArray = input.service_areas ? input.service_areas.split(",").map((s) => s.trim()) : ["General"];

    await supabase
      .from("cleaners")
      .update({
        cleaner_type: input.cleaner_type,
        company_name: input.company_name || null,
        address: input.address || null,
        service_areas: serviceAreasArray,
        status: input.status,
        notes: input.notes || null,
      })
      .eq("id", input.id);

    revalidatePath(`/dashboard/cleaners/${input.id}`);
    revalidatePath("/dashboard/cleaners");

    return { success: true };
  } catch (err: unknown) {
    console.error("[updateCleanerAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to update cleaner";
    return { success: false, error: errorMessage };
  }
}

export async function deleteCleanerAction(cleanerId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) throw new Error("Unauthorized");

    const adminSupabase = createSupabaseAdminClient();

    // Delete cleaner record
    await supabase.from("cleaners").delete().eq("id", cleanerId);
    await supabase.from("profiles").delete().eq("id", cleanerId);
    await adminSupabase.auth.admin.deleteUser(cleanerId);

    revalidatePath("/dashboard/cleaners");

    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteCleanerAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to delete cleaner";
    return { success: false, error: errorMessage };
  }
}

export async function resetCleanerPasswordAction(cleanerId: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();

    // Get cleaner profile and email
    let email: string | undefined;
    let fullName: string = "Cleaner";

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", cleanerId)
      .maybeSingle();

    if (profile?.email) {
      email = profile.email;
      fullName = profile.full_name || fullName;
    } else {
      const { data: authUserRes } = await adminSupabase.auth.admin.getUserById(cleanerId);
      if (authUserRes?.user?.email) {
        email = authUserRes.user.email;
        fullName = authUserRes.user.user_metadata?.full_name || fullName;
      }
    }

    if (!email) {
      throw new Error("Cleaner email not found in auth or profile records.");
    }

    // Generate random strong password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Update user password in auth schema
    const { error: updateErr } = await adminSupabase.auth.admin.updateUserById(cleanerId, {
      password: newPassword,
      email_confirm: true,
    });

    if (updateErr) throw new Error(updateErr.message);

    // Audit log
    await adminSupabase.from("audit_logs").insert({
      action: "cleaner.password_reset",
      record_type: "cleaners",
      record_id: cleanerId,
      new_value: { email: email },
    });

    return {
      success: true,
      email: email,
      fullName: fullName,
      newPassword,
    };
  } catch (err: unknown) {
    console.error("[resetCleanerPasswordAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to reset cleaner password";
    return { success: false, error: errorMessage };
  }
}

export async function getCleanersList() {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const { data: cleaners, error } = await adminSupabase
      .from("cleaners")
      .select("*, profile:profiles(*)")
      .order("created_at", { ascending: false });

    // Fetch auth users to merge email and sync missing cleaner records
    const { data: userList } = await adminSupabase.auth.admin.listUsers();
    const authUsersMap = new Map((userList?.users || []).map((u) => [u.id, u]));

    const cleanerAuthUsers =
      userList?.users?.filter(
        (u) =>
          u.user_metadata?.role === "cleaner" || u.email?.includes("cleaner") || u.email === "kennataddese6@gmail.com",
      ) || [];

    for (const u of cleanerAuthUsers) {
      const existsInList = cleaners?.some((c) => c.id === u.id);
      if (!existsInList) {
        // Sync profile & cleaner record
        await adminSupabase.from("profiles").upsert({
          id: u.id,
          role: "cleaner",
          full_name: u.user_metadata?.full_name || u.email?.split("@")[0] || "Cleaner",
        });

        await adminSupabase.from("cleaners").upsert({
          id: u.id,
          cleaner_type: "individual",
          service_areas: ["North London", "Central London"],
          status: "available",
        });
      }
    }

    // Refetch synced cleaners
    const { data: updatedCleaners } = await adminSupabase
      .from("cleaners")
      .select("*, profile:profiles(*)")
      .order("created_at", { ascending: false });

    const finalCleaners = updatedCleaners || cleaners || [];

    // Ensure email is populated from auth if missing in profile
    return finalCleaners.map((c) => {
      const authUser = authUsersMap.get(c.id);
      return {
        ...c,
        profile: {
          ...c.profile,
          email: c.profile?.email || authUser?.email || "cleaner@samspotless.com",
          full_name: c.profile?.full_name || authUser?.user_metadata?.full_name || "Cleaner",
        },
      };
    });
  } catch (err) {
    console.error("[getCleanersList]", err);
    return [];
  }
}

export async function getCleanerById(id: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();

    let { data: cleaner } = await adminSupabase
      .from("cleaners")
      .select("*, profile:profiles(*), jobs(*, booking:bookings(*))")
      .eq("id", id)
      .maybeSingle();

    // If not found in cleaners table, check auth.users and auto-sync
    if (!cleaner) {
      const { data: authUserRes } = await adminSupabase.auth.admin.getUserById(id);
      const authUser = authUserRes?.user;

      if (authUser) {
        await adminSupabase.from("profiles").upsert({
          id: authUser.id,
          role: "cleaner",
          full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Cleaner",
        });

        await adminSupabase.from("cleaners").upsert({
          id: authUser.id,
          cleaner_type: "individual",
          service_areas: ["North London", "Central London"],
          status: "available",
        });

        const { data: synced } = await adminSupabase
          .from("cleaners")
          .select("*, profile:profiles(*), jobs(*, booking:bookings(*))")
          .eq("id", id)
          .maybeSingle();

        cleaner = synced;
      }
    }

    if (!cleaner) return null;

    // Attach email from auth if missing
    if (!cleaner.profile?.email) {
      const { data: authUserRes } = await adminSupabase.auth.admin.getUserById(id);
      if (authUserRes?.user?.email) {
        cleaner = {
          ...cleaner,
          profile: {
            ...cleaner.profile,
            email: authUserRes.user.email,
          },
        };
      }
    }

    return cleaner;
  } catch (err) {
    console.error("[getCleanerById]", err);
    return null;
  }
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

    await supabase.from("bookings").update({ status: "cleaner_assigned" }).eq("id", input.booking_id);

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

export async function getCleanerAssignedJobs() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: cleanerUser },
  } = await supabase.auth.getUser();

  if (!cleanerUser) return [];

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      "*, cleaner:cleaners(*, profile:profiles(*)), booking:bookings(*, customer:customers(*), address:customer_addresses(*))",
    )
    .eq("cleaner_id", cleanerUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getCleanerAssignedJobs]", error);
    return [];
  }

  return jobs || [];
}

export async function getJobsList(statusFilter?: string) {
  const supabase = await createSupabaseServerClient();

  // Fetch existing jobs first
  const { data: existingJobs, error: jobsErr } = await supabase
    .from("jobs")
    .select(
      "*, cleaner:cleaners(*, profile:profiles(*)), booking:bookings(*, customer:customers(*), address:customer_addresses(*))",
    )
    .order("created_at", { ascending: false });

  if (jobsErr) {
    console.error("[getJobsList]", jobsErr);
  }

  const jobsList = existingJobs || [];
  const assignedBookingIds = new Set(jobsList.map((j) => j.booking_id));

  // Fetch bookings that are in accepted or paid status but don't have a jobs row yet
  const { data: operationalBookings } = await supabase
    .from("bookings")
    .select("*, customer:customers(*), address:customer_addresses(*)")
    .in("status", [
      "quotation_accepted",
      "cleaner_assigned",
      "cleaner_accepted",
      "in_progress",
      "completed_pending_review",
      "completed",
      "paid",
    ])
    .order("created_at", { ascending: false });

  const unassignedJobs = (operationalBookings || [])
    .filter((b) => !assignedBookingIds.has(b.id))
    .map((b) => ({
      id: b.id, // Use booking id as temporary job reference
      booking_id: b.id,
      cleaner_id: null,
      scheduled_date: b.preferred_date,
      scheduled_time: b.arrival_window || "Morning",
      secure_token: null,
      created_at: b.created_at,
      cleaner: null,
      booking: b,
    }));

  return [...jobsList, ...unassignedJobs];
}

export async function getJobById(id: string) {
  const supabase = await createSupabaseServerClient();

  // Try querying by job id
  const adminSupabase = createSupabaseAdminClient();
  const { data: job } = await adminSupabase
    .from("jobs")
    .select(
      "*, cleaner:cleaners(*, profile:profiles(*)), booking:bookings(*, customer:customers(*), address:customer_addresses(*), photos(*), invoices(*))",
    )
    .eq("id", id)
    .maybeSingle();

  if (job) return job;

  // Try querying by booking id
  const { data: jobByBooking } = await adminSupabase
    .from("jobs")
    .select(
      "*, cleaner:cleaners(*, profile:profiles(*)), booking:bookings(*, customer:customers(*), address:customer_addresses(*), photos(*), invoices(*))",
    )
    .eq("booking_id", id)
    .maybeSingle();

  if (jobByBooking) return jobByBooking;

  // Otherwise check if booking exists and return pending wrapper
  const { data: booking } = await adminSupabase
    .from("bookings")
    .select("*, customer:customers(*), address:customer_addresses(*), photos(*), invoices(*)")
    .eq("id", id)
    .maybeSingle();

  if (!booking) return null;

  return {
    id: booking.id,
    booking_id: booking.id,
    cleaner_id: null,
    scheduled_date: booking.preferred_date,
    scheduled_time: booking.arrival_window || "Morning",
    secure_token: null,
    created_at: booking.created_at,
    cleaner: null,
    booking,
  };
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

    let { data: job } = await supabase
      .from("jobs")
      .select("id, booking_id, cleaner_id")
      .eq("id", input.job_id)
      .single();

    if (!job) {
      const { data: jobByBooking } = await supabase
        .from("jobs")
        .select("id, booking_id, cleaner_id")
        .eq("booking_id", input.job_id)
        .single();
      job = jobByBooking;
    }

    if (!job) throw new Error("Job record not found. Please assign cleaner first.");

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
      // Enforce mandatory before & after photo upload requirement
      const adminSupabase = createSupabaseAdminClient();
      const { data: photos } = await adminSupabase
        .from("photos")
        .select("*")
        .or(`booking_id.eq.${job.booking_id},booking_id.eq.${job.id}`);

      const hasBefore = photos?.some((p: any) => p.category === "before" || p.photo_type === "before");
      const hasAfter = photos?.some((p: any) => p.category === "after" || p.photo_type === "after");

      if (!photos || photos.length === 0 || !hasBefore || !hasAfter) {
        return {
          success: false,
          error:
            "Photo evidence required: You must upload at least one 'Before' photo and one 'After' photo before submitting the job for approval.",
        };
      }

      await adminSupabase
        .from("jobs")
        .update({ completed_at: now, cleaner_notes: input.cleaner_notes })
        .eq("id", job.id);
      await adminSupabase.from("bookings").update({ status: "completed_pending_review" }).eq("id", job.booking_id);
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

export async function uploadJobPhotoAction(formData: FormData) {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const jobId = formData.get("job_id") as string;
    const bookingId = formData.get("booking_id") as string;
    const category = (formData.get("category") as "before" | "after") || "before";
    const file = formData.get("file") as File;

    if (!file || !bookingId) {
      return { success: false, error: "File and booking ID are required" };
    }

    // Determine uploaded_by profile ID
    let uploadedById = user?.id;
    if (!uploadedById) {
      const { data: firstProfile } = await adminSupabase.from("profiles").select("id").limit(1).single();
      uploadedById = firstProfile?.id;
    }

    if (!uploadedById) {
      return { success: false, error: "User profile record not found for photo upload" };
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `${bookingId}/${category}_${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure job-photos bucket is publicly accessible
    await adminSupabase.storage.updateBucket("job-photos", { public: true }).catch(() => {});

    // 1. Upload to Supabase Storage bucket 'job-photos'
    const { error: storageErr } = await adminSupabase.storage.from("job-photos").upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

    let photoUrl = "";
    if (!storageErr) {
      const publicUrlData = adminSupabase.storage.from("job-photos").getPublicUrl(filePath);
      photoUrl = publicUrlData.data.publicUrl;
    } else {
      console.warn("[uploadJobPhotoAction storage warning]", storageErr.message);
      // Fallback to Base64 data URL if storage bucket fails
      const mimeType = file.type || "image/jpeg";
      photoUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    // 2. Insert into photos table matching exact database schema
    const { error: insertErr } = await adminSupabase.from("photos").insert({
      booking_id: bookingId,
      uploaded_by: uploadedById,
      category: category,
      storage_path: photoUrl,
    });

    if (insertErr) {
      console.error("[uploadJobPhotoAction insert error]", insertErr.message);
      return { success: false, error: insertErr.message };
    }

    revalidatePath(`/cleaner/jobs/${jobId}`);
    revalidatePath(`/dashboard/jobs/${jobId}`);

    return { success: true, url: photoUrl };
  } catch (err: unknown) {
    console.error("[uploadJobPhotoAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to upload photo";
    return { success: false, error: errorMessage };
  }
}
