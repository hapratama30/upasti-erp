import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
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
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // PAKAI URL PRODUKSI + history (tanpa #)
    const redirectTo = "https://upasti-erp.vercel.app/auth/callback";

    // BUAT LINK RESMI (bukan OTP 6 digit)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo,
        data: { name, company_id, employee_id }, // opsional metadata
      },
    });
    if (error) throw error;

    // Update employees.user_id jika tersedia
    if (data?.user?.id) {
      await supabase.from("employees")
        .update({ user_id: data.user.id })
        .eq("id", employee_id);
    }

    // KIRIM BALIK link untuk dites manual
    return new Response(
      JSON.stringify({
        ok: true,
        action_link: data.properties.action_link, // <-- INI yang harus kamu klik
        email: data.user?.email ?? email,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : "Internal error";
    return new Response(
      JSON.stringify({ error: errMsg }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
