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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

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

    // Verify user is delivery partner
    const { data: deliveryPartner } = await supabaseClient
      .from("delivery_partners")
      .select("id, allowed")
      .eq("user_id", user.id)
      .single();

    if (!deliveryPartner || !deliveryPartner.allowed) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Delivery partner access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { order_id } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify order is assigned to this delivery partner
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("delivery_partner_id", deliveryPartner.id)
      .single();

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found or not assigned to you" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update order status and request user confirmation
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        status: "out_for_delivery",
        delivery_confirmation_requested_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Send email to user requesting confirmation
    // This would be handled by a separate email service or database trigger

    return new Response(
      JSON.stringify({
        success: true,
        message: "Delivery marked. Waiting for customer confirmation.",
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

