/**
 * Cloudflare Pages Function Proxy for Google Apps Script
 * Route: /api/gas
 * Eliminates CORS, ISP blocking, and connection timeouts by fetching from Cloudflare Edge
 */

const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbw6_Ijo6Hu2XmyQ-6DYahv_Jr42S4BktcRtZLHnJpR6sEsQY9vJS6wlLld09aii4mNJTw/exec';

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  const gasUrl = env.VITE_GAS_API_URL || DEFAULT_GAS_URL;
  const clientUrl = new URL(request.url);
  const targetUrl = new URL(gasUrl);

  // Copy query parameters
  clientUrl.searchParams.forEach((val, key) => {
    targetUrl.searchParams.set(key, val);
  });

  const headers = new Headers();
  headers.set('Accept', 'application/json');

  const fetchOptions = {
    method: request.method,
    headers: headers,
    redirect: 'follow'
  };

  if (request.method === 'POST' || request.method === 'PUT') {
    headers.set('Content-Type', 'text/plain;charset=utf-8');
    fetchOptions.body = await request.text();
  }

  try {
    const gasResponse = await fetch(targetUrl.toString(), fetchOptions);
    const bodyText = await gasResponse.text();

    return new Response(bodyText, {
      status: gasResponse.status,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Proxy Error: ' + error.message
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
