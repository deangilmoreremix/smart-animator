import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TRANSPARENT_PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
  0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
  0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3B
]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const recipientId = url.searchParams.get('recipient');
    const campaignId = url.searchParams.get('campaign');
    const sendId = url.searchParams.get('send');

    if (!recipientId && !sendId) {
      return new Response(TRANSPARENT_PIXEL, {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || '';

    if (sendId) {
      const { data: send } = await supabase
        .from('sends')
        .select('opened_at')
        .eq('id', sendId)
        .single();

      if (!send?.opened_at) {
        await supabase
          .from('sends')
          .update({ opened_at: new Date().toISOString() })
          .eq('id', sendId);
      }

      await supabase
        .from('events')
        .insert({
          send_id: sendId,
          type: 'open',
          metadata: {
            userAgent,
            ipAddress,
            timestamp: new Date().toISOString()
          }
        });
    }

    if (recipientId && campaignId) {
      const { data: recipient } = await supabase
        .from('campaign_recipients')
        .select('viewed_at, view_count')
        .eq('id', recipientId)
        .single();

      if (!recipient?.viewed_at) {
        await supabase
          .from('campaign_recipients')
          .update({
            viewed_at: new Date().toISOString(),
            view_count: 1
          })
          .eq('id', recipientId);

        await supabase.rpc('increment_campaign_views', {
          campaign_id: campaignId,
          unique_view: true
        });
      } else {
        await supabase
          .from('campaign_recipients')
          .update({
            view_count: (recipient.view_count || 0) + 1
          })
          .eq('id', recipientId);

        await supabase.rpc('increment_campaign_views', {
          campaign_id: campaignId,
          unique_view: false
        });
      }
    }

    return new Response(TRANSPARENT_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Tracking error:', error);
    
    return new Response(TRANSPARENT_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
});