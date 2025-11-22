import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
}

async function sendEmailViaSMTP(config: EmailRequest['smtpConfig'], email: EmailRequest): Promise<boolean> {
  if (!config) {
    throw new Error('SMTP configuration is required');
  }

  const boundary = `----=_Part_${Date.now()}`;
  const emailContent = [
    `From: ${email.from || config.user}`,
    `To: ${email.to}`,
    `Subject: ${email.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    '',
    email.text || email.html.replace(/<[^>]*>/g, ''),
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    '',
    email.html,
    '',
    `--${boundary}--`,
  ].join('\r\n');

  try {
    const encoder = new TextEncoder();
    const connection = await Deno.connect({
      hostname: config.host,
      port: config.port,
    });

    const writer = connection.writable.getWriter();
    const reader = connection.readable.getReader();

    const readResponse = async () => {
      const { value } = await reader.read();
      return new TextDecoder().decode(value);
    };

    const sendCommand = async (command: string) => {
      await writer.write(encoder.encode(command + '\r\n'));
      return await readResponse();
    };

    await readResponse();

    await sendCommand(`EHLO ${config.host}`);

    if (config.secure || config.port === 587) {
      await sendCommand('STARTTLS');
    }

    const authString = btoa(`\0${config.user}\0${config.password}`);
    await sendCommand('AUTH PLAIN ' + authString);

    await sendCommand(`MAIL FROM:<${email.from || config.user}>`);
    await sendCommand(`RCPT TO:<${email.to}>`);
    await sendCommand('DATA');

    await writer.write(encoder.encode(emailContent + '\r\n.\r\n'));
    const dataResponse = await readResponse();

    await sendCommand('QUIT');

    connection.close();

    return dataResponse.startsWith('250');
  } catch (error) {
    console.error('SMTP Error:', error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, subject, html, text, from, smtpConfig }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await sendEmailViaSMTP(smtpConfig, { to, subject, html, text, from });

    return new Response(
      JSON.stringify({
        success: result,
        messageId: Date.now().toString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send email'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});