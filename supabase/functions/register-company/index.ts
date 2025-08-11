import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Mendapatkan variabel environment dari Deno
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "";

serve(async (req) => {
  // --- KONFIGURASI AWAL & CORS ---
  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const headers = {
    "Access-Control-Allow-Origin": "http://localhost:9000",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  // --- LOGIKA UTAMA ---
  try {
    const { companyName, userName, email, password } = await req.json();

    console.log("Received data:", { companyName, userName, email, password });

    // 1. Pastikan modul 'employees' ada, jika tidak, buatlah
    console.log("Attempting to get or create 'employees' module...");
    let { data: employeeModuleData, error: moduleDataError } = await supabase
      .from("modules")
      .select("id")
      .eq("name", "employees")
      .maybeSingle(); // Menggunakan maybeSingle() untuk menghindari error jika data tidak ditemukan

    if (moduleDataError) {
      console.error("Module Data Error:", moduleDataError.message);
      throw moduleDataError;
    }

    if (!employeeModuleData) {
      // Modul tidak ditemukan, buat entri baru
      console.log("'employees' module not found, creating a new one.");
      const { data: newModuleData, error: newModuleError } = await supabase
        .from("modules")
        .insert({
          name: "employees",
          route: "/dashboard/employees",
          icon: "groups",
        })
        .select("id")
        .single();
      if (newModuleError) {
        console.error("New Module Insert Error:", newModuleError.message);
        throw newModuleError;
      }
      employeeModuleData = newModuleData;
      console.log("New module created with ID:", employeeModuleData.id);
    }
    const employeeModuleId = employeeModuleData.id;
    console.log("'employees' module found with ID:", employeeModuleId);

    // 2. Buat entri perusahaan baru
    console.log("Attempting to create company...");
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .insert({ name: companyName })
      .select("id")
      .single();
    if (companyError) {
      console.error("Company Insert Error:", companyError.message);
      throw companyError;
    }
    const companyId = companyData.id;
    console.log("Company created:", companyId);

    // 3. Buat pengguna baru di Supabase Auth
    console.log("Attempting to create user with metadata...");
    const { data: userData, error: authError } = await supabase.auth.admin
      .createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          company_id: companyId,
          role: "admin",
        },
      });
    if (authError) {
      console.error("Auth Sign Up Error:", authError.message);
      throw authError;
    }
    const userId = userData.user.id;
    console.log("User created:", userId);

    // 4. Buat jabatan 'Admin'
    console.log("Attempting to create admin position...");
    const { data: positionData, error: positionError } = await supabase
      .from("positions")
      .insert({ name: "Admin", company_id: companyId })
      .select("id")
      .single();
    if (positionError) {
      console.error("Position Insert Error:", positionError.message);
      throw positionError;
    }
    const positionId = positionData.id;
    console.log("Admin position created:", positionId);

    // 5. Berikan izin penuh untuk modul 'employees' saja
    console.log("Attempting to assign permissions...");
    const permissionsPayload = [{
      position_id: positionId,
      module_id: employeeModuleId,
      can_view: true,
      can_edit: true,
    }];

    const { error: permissionsError } = await supabase
      .from("position_permissions")
      .insert(permissionsPayload);
    if (permissionsError) {
      console.error("Permissions Insert Error:", permissionsError.message);
      throw permissionsError;
    }
    console.log("Permissions assigned.");

    // 6. Buat entri profil pengguna admin
    console.log("Attempting to create user profile...");
    const { error: profilesError } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        company_id: companyId,
        email: email,
        role: "admin",
      });
    if (profilesError) {
      console.error("Profile Insert Error:", profilesError.message);
      throw profilesError;
    }
    console.log("Profile created.");

    // 7. Buat entri karyawan untuk pendaftar
    console.log("Attempting to create employee entry...");
    const { error: employeeError } = await supabase
      .from("employees")
      .insert({
        user_id: userId,
        company_id: companyId,
        position_id: positionId,
        email: email,
        name: userName,
      });
    if (employeeError) {
      console.error("Employee Insert Error:", employeeError.message);
      throw employeeError;
    }
    console.log("Employee entry created.");

    // 8. Aktifkan modul 'employees' untuk perusahaan di tabel company_modules
    console.log("Attempting to enable company module...");
    const { error: companyModuleError } = await supabase
      .from("company_modules")
      .insert({
        company_id: companyId,
        module_id: employeeModuleId,
      });
    if (companyModuleError) {
      console.error("Company Module Insert Error:", companyModuleError.message);
      throw companyModuleError;
    }
    console.log("Company module enabled.");

    return new Response(
      JSON.stringify({
        message: "Pendaftaran berhasil! Silakan cek email Anda.",
      }),
      {
        status: 200,
        headers,
      },
    );
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Final Catch Error:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers,
    });
  }
});
