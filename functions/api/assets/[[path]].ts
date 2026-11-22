import { Env } from '../../utils/auth';

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

export const onRequestGet = async ({
  params,
  env,
}: {
  params: { path?: string | string[] };
  env: Env;
}) => {
  try {
    let key = '';
    if (Array.isArray(params.path)) {
      key = params.path.join('/');
    } else if (typeof params.path === 'string') {
      key = params.path;
    }

    if (!key) {
      return new Response('Asset path required', { status: 400 });
    }

    const object = await env.BUCKET.get(key);
    if (!object) {
      return new Response('Asset not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Type', getMimeType(key));
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (err: any) {
    console.error('Assets CDN error:', err);
    return new Response('Internal error', { status: 500 });
  }
};
