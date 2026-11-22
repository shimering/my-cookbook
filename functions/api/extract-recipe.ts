import { jsonResponse } from '../utils/auth';

export const onRequestOptions = async () => {
  return jsonResponse({}, 200);
};

export const onRequestPost = async ({ request }: { request: Request }) => {
  try {
    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const targetUrl = (body.url || '').trim();

    if (!targetUrl) {
      return jsonResponse({ error: 'Missing or empty url' }, 400);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return jsonResponse({ error: 'URL must use HTTP or HTTPS protocol' }, 400);
      }
    } catch {
      return jsonResponse({ error: 'Invalid URL format' }, 400);
    }

    // Fetch the target webpage with standard browser headers
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      return jsonResponse(
        { error: `Target website returned status ${response.status} (${response.statusText})` },
        502
      );
    }

    const html = await response.text();
    return jsonResponse({ success: true, html });
  } catch (err: any) {
    return jsonResponse({ error: err?.message || 'Failed to fetch recipe URL' }, 500);
  }
};
