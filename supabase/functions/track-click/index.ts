import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    const recipientId = url.searchParams.get('recipient');
    const campaignId = url.searchParams.get('campaign');
    const sendId = url.searchParams.get('send');

    if (!targetUrl) {
      return new Response('Missing target URL', { 
        status: 400,
        headers: corsHeaders
      });
    }

    let decodedUrl: string;
    try {
      decodedUrl = decodeURIComponent(targetUrl);
    } catch {
      decodedUrl = targetUrl;
    }

    if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
      decodedUrl = 'https://' + decodedUrl;
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    if (sendId) {
      const { data: send } = await supabase
        .from('sends')
        .select('clicked_at')
        .eq('id', sendId)
        .single();

      if (!send?.clicked_at) {
        await supabase
          .from('sends')
          .update({ clicked_at: new Date().toISOString() })
          .eq('id', sendId);
      }

      await supabase
        .from('events')
        .insert({
          send_id: sendId,
          type: 'click',
          metadata: {
            targetUrl: decodedUrl,
            ipAddress,
            userAgent,
            timestamp: new Date().toISOString()
          }
        });
    }

    if (recipientId) {
      await supabase
        .from('events')
        .insert({
          send_id: recipientId,
          type: 'click',
          metadata: {
            targetUrl: decodedUrl,
            campaignId,
            ipAddress,
            userAgent,
            timestamp: new Date().toISOString()
          }
        });
    }

    return new Response(null, {
      status: 302,
      headers: {
        'Location': decodedUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Click tracking error:', error);
    
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    
    if (targetUrl) {
      let decodedUrl: string;
      try {
        decodedUrl = decodeURIComponent(targetUrl);
      } catch {
        decodedUrl = targetUrl;
      }
      
      if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
        decodedUrl = 'https://' + decodedUrl;
      }
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': decodedUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
    
    return new Response('Tracking failed', { 
      status: 500,
      headers: corsHeaders
    });
  }
});