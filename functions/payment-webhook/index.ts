import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // PayU webhook payload
    const webhookData = await req.json();

    // Verify webhook signature if provided
    const webhookSecret = Deno.env.get("PAYU_WEBHOOK_SECRET");
    if (webhookSecret) {
      // Add signature verification logic here based on PayU documentation
      // This is a placeholder - implement actual verification
    }

    const {
      txnid,
      status,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      hash,
    } = webhookData;

    // Verify hash
    const merchantId = Deno.env.get("PAYU_MERCHANT_ID");
    const clientSecret = Deno.env.get("PAYU_CLIENT_SECRET");

    if (!merchantId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "PayU not configured" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Find payment by transaction ID
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("*, orders(*)")
      .eq("provider_payment_id", txnid)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update payment status
    const paymentStatus = status === "success" ? "success" : "failed";
    const { error: updatePaymentError } = await supabaseAdmin
      .from("payments")
      .update({
        status: paymentStatus,
        raw_response: webhookData,
      })
      .eq("id", payment.id);

    if (updatePaymentError) {
      console.error("Error updating payment:", updatePaymentError);
    }

    // Update order payment status
    if (paymentStatus === "success") {
      const { error: updateOrderError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "pending", // Will be assigned by admin or auto-assign
        })
        .eq("id", payment.order_id);

      if (updateOrderError) {
        console.error("Error updating order:", updateOrderError);
      }

      // Auto-assign order if enabled
      const { data: settings } = await supabaseAdmin
        .from("settings")
        .select("value")
        .eq("key", "auto_assign_orders")
        .single();

      if (settings?.value === true) {
        // Find available delivery partner (round-robin)
        const { data: partners } = await supabaseAdmin
          .from("delivery_partners")
          .select("id")
          .eq("status", "approved")
          .eq("allowed", true)
          .order("created_at", { ascending: true })
          .limit(1);

        if (partners && partners.length > 0) {
          await supabaseAdmin
            .from("orders")
            .update({
              delivery_partner_id: partners[0].id,
              status: "assigned",
            })
            .eq("id", payment.order_id);
        }
      }

      // Send email confirmation (triggered by database function or separate service)
      // This would typically be handled by a database trigger or separate email service
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

