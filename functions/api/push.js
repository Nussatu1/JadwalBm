/**
 * Cloudflare Pages Functions - Full Web Push Server Endpoint (RFC 8292 VAPID)
 * Handles VAPID Key distribution, Push Subscriptions, and Direct Web Push Dispatching.
 */

const VAPID_PUBLIC_KEY = 'BLjGf9tE-tULNS-2Do6COan2IrUi2YNDMnjB4AkrSyK7Mw8I2b7nW0UKwC91LvNQh5BI5_JKviMZ3pQUysDsOSg';
const VAPID_PRIVATE_KEY = 'epz8Ss6_J0tSEZnxjZP9t4_bknYqIuvCzcRX6DAA7Jo';
const VAPID_SUBJECT = 'mailto:multimedia@miftahululum.org';

function base64UrlToUint8Array(b64url) {
  let base64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function stringToBase64Url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function createVapidJwt(audience) {
  const rawPub = base64UrlToUint8Array(VAPID_PUBLIC_KEY);
  const rawPriv = base64UrlToUint8Array(VAPID_PRIVATE_KEY);

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: uint8ArrayToBase64Url(rawPub.slice(1, 33)),
    y: uint8ArrayToBase64Url(rawPub.slice(33, 65)),
    d: uint8ArrayToBase64Url(rawPriv)
  };

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const header = stringToBase64Url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const payload = stringToBase64Url(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 43200,
    sub: VAPID_SUBJECT
  }));

  const unsignedToken = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  return `${unsignedToken}.${uint8ArrayToBase64Url(new Uint8Array(signature))}`;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'vapidPublicKey';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const gasUrl = env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbw6_Ijo6Hu2XmyQ-6DYahv_Jr42S4BktcRtZLHnJpR6sEsQY9vJS6wlLld09aii4mNJTw/exec';

  // 1. Get VAPID Public Key
  if (action === 'vapidPublicKey') {
    return new Response(
      JSON.stringify({ success: true, publicKey: VAPID_PUBLIC_KEY }),
      { headers: corsHeaders }
    );
  }

  // 2. Save Push Subscription
  if (action === 'subscribe' && request.method === 'POST') {
    try {
      const subscription = await request.json();

      await fetch(`${gasUrl}?action=savePushSubscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userAgent: request.headers.get('user-agent') || '',
          timestamp: new Date().toISOString()
        })
      }).catch((err) => console.warn('GAS subscribe error:', err));

      return new Response(
        JSON.stringify({ success: true, message: 'Push subscription tersimpan.' }),
        { headers: corsHeaders }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, message: e.message }),
        { status: 400, headers: corsHeaders }
      );
    }
  }

  // 3. Broadcast Web Push to All Subscribed Devices
  if (action === 'broadcast' && request.method === 'POST') {
    try {
      const payload = await request.json().catch(() => ({}));
      const title = payload.title || '📢 Tes Broadcast: Jadwal Bakid Multimedia';
      const body = payload.body || 'Uji coba transmisi notifikasi serentak ke seluruh tim multimedia.';

      // Get subscribers from Google Sheets
      const gasRes = await fetch(`${gasUrl}?action=getPushSubscribers`);
      const gasData = await gasRes.json().catch(() => ({ data: [] }));
      const subscribers = Array.isArray(gasData.data) ? gasData.data : [];

      let successCount = 0;
      let failCount = 0;

      // Dispatch Web Push to each subscriber endpoint
      const pushPromises = subscribers.map(async (sub) => {
        if (!sub.endpoint) return;
        try {
          const endpointUrl = new URL(sub.endpoint);
          const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;
          const jwt = await createVapidJwt(audience);

          const pushRes = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'TTL': '86400',
              'Urgency': 'high',
              'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
              'Content-Type': 'text/plain;charset=UTF-8'
            },
            body: JSON.stringify({
              title,
              body,
              tag: 'broadcast-' + Date.now()
            })
          });

          if (pushRes.status === 201 || pushRes.status === 200) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
      });

      await Promise.all(pushPromises);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Sinyal notifikasi berhasil dikirimkan ke ${successCount} perangkat terdaftar! (${failCount} gagal/offline)`,
          stats: { total: subscribers.length, success: successCount, failed: failCount }
        }),
        { headers: corsHeaders }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, message: e.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Push API active' }),
    { headers: corsHeaders }
  );
}
