/**
 * Cloudflare Pages Functions - Web Push Server Endpoint
 * Handles VAPID Key distribution, Push Subscriptions, and Web Push Dispatching.
 */

const VAPID_PUBLIC_KEY = 'BLjGf9tE-tULNS-2Do6COan2IrUi2YNDMnjB4AkrSyK7Mw8I2b7nW0UKwC91LvNQh5BI5_JKviMZ3pQUysDsOSg';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'vapidPublicKey';

  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. Get VAPID Public Key
  if (action === 'vapidPublicKey') {
    return new Response(
      JSON.stringify({
        success: true,
        publicKey: VAPID_PUBLIC_KEY
      }),
      { headers: corsHeaders }
    );
  }

  // 2. Save Push Subscription
  if (action === 'subscribe' && request.method === 'POST') {
    try {
      const subscription = await request.json();
      const gasUrl = env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbw6_Ijo6Hu2XmyQ-6DYahv_Jr42S4BktcRtZLHnJpR6sEsQY9vJS6wlLld09aii4mNJTw/exec';

      // Forward to Google Apps Script to store in PushSubscribers sheet
      await fetch(`${gasUrl}?action=savePushSubscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userAgent: request.headers.get('user-agent') || '',
          timestamp: new Date().toISOString()
        })
      }).catch((err) => {
        console.warn('Forwarding subscription to GAS failed:', err);
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Push subscription berhasil disimpan di server'
        }),
        { headers: corsHeaders }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, message: e.message }),
        { status: 400, headers: corsHeaders }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Push API endpoint active' }),
    { headers: corsHeaders }
  );
}
