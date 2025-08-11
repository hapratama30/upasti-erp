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

    // Langsung kirim undangan. Supabase akan otomatis menangani apakah user sudah ada atau belum.
    const { data, error: inviteError } = await supabase.auth.admin
      .inviteUserByEmail(
        email,
        {
          redirectTo: "http://localhost:9000/#/auth/callback",
        },
      );

    if (inviteError) {
      console.error("Error saat mengirim undangan:", inviteError);
      throw new Error(inviteError.message);
    }

    // Perbarui data karyawan dengan user_id yang baru jika user berhasil dibuat
    if (data?.user?.id) {
      console.log("Undangan berhasil terkirim. Mencoba update data karyawan.");
      const { error: employeeError } = await supabase.from("employees").update({
        user_id: data.user.id,
      }).eq("id", employee_id);

      if (employeeError) {
        console.error("Error saat update karyawan:", employeeError);
        throw new Error(employeeError.message);
      }
    } else {
      console.log("Undangan berhasil dikirim. User sudah ada.");
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
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
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
