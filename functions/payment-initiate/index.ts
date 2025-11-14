import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  order_id: string;
  amount: number;
  customer_email: string;
  customer_phone: string;
  customer_name: string;
  product_info: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const paymentData: PaymentRequest = await req.json();

    // Check if PayU credentials are configured
    const merchantId = Deno.env.get("PAYU_MERCHANT_ID");
    const clientId = Deno.env.get("PAYU_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYU_CLIENT_SECRET");

    if (!merchantId || !clientId || !clientSecret) {
      return new Response(
        JSON.stringify({
          error: "PayU credentials not configured",
          prototype: true,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify order belongs to user
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", paymentData.order_id)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate transaction ID
    const txnid = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const amount = paymentData.amount.toString();
    const productinfo = paymentData.product_info || "Order Payment";
    const firstname = paymentData.customer_name.split(" ")[0];
    const email = paymentData.customer_email;
    const phone = paymentData.customer_phone;

    // PayU payment hash generation
    const hashString = `${merchantId}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${clientSecret}`;
    const hash = await crypto.subtle.digest(
      "SHA-512",
      new TextEncoder().encode(hashString)
    );
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: paymentData.order_id,
        provider: "payu",
        provider_payment_id: txnid,
        amount: parseFloat(amount),
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      return new Response(
        JSON.stringify({ error: "Failed to create payment record" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // PayU API endpoint (sandbox for testing, production URL will be different)
    const payuUrl = Deno.env.get("PAYU_BASE_URL") || "https://secure.payu.in/_payment";

    const payuFormData = {
      key: merchantId,
      txnid: txnid,
      amount: amount,
      productinfo: productinfo,
      firstname: firstname,
      email: email,
      phone: phone,
      surl: `${Deno.env.get("APP_URL")}/payment/success`,
      furl: `${Deno.env.get("APP_URL")}/payment/failure`,
      hash: hashHex,
      service_provider: "payu_paisa",
    };

    return new Response(
      JSON.stringify({
        payment_id: payment.id,
        txnid: txnid,
        payu_form_data: payuFormData,
        payu_url: payuUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

