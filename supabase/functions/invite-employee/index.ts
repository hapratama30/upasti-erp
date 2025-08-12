import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { email, name, company_id, employee_id } = await req.json();

    if (!email || !name || !company_id || !employee_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 400,
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("Mencoba mengirim undangan ke email:", email);

    // ===== PENTING =====
    // Gunakan URL produksi + history route (TANPA '#')
    // Pastikan URL ini juga ada di Auth Settings -> Redirect URLs
    const redirectTo = "https://upasti-erp.vercel.app/auth/callback";

    // Kirim undangan resmi Supabase (Supabase yang kirim emailnya)
    const { data, error: inviteError } = await supabase.auth.admin
      .inviteUserByEmail(email, {
        redirectTo,
      });

    if (inviteError) {
      console.error("Error saat mengirim undangan:", inviteError);
      throw new Error(inviteError.message);
    }

    // Update kolom user_id karyawan bila user baru dibuat
    if (data?.user?.id) {
      console.log(
        "Undangan terkirim. Update employees.user_id =",
        data.user.id,
      );
      const { error: employeeError } = await supabase
        .from("employees")
        .update({ user_id: data.user.id })
        .eq("id", employee_id);

      if (employeeError) {
        console.error("Error saat update karyawan:", employeeError);
        throw new Error(employeeError.message);
      }
    } else {
      console.log("Undangan terkirim. User kemungkinan sudah ada.");
    }

    return new Response(
      JSON.stringify({ message: "Invitation sent successfully" }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred";
    console.error("Final Catch Error:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
