import { Env, authenticateRequest, jsonResponse } from '../utils/auth';

export const onRequestOptions = async () => {
  return jsonResponse({}, 200);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const user = await authenticateRequest(request, env);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized. Please sign in to upload photos.' }, 401);
    }

    const contentType = request.headers.get('content-type') || '';
    let fileBuffer: ArrayBuffer | null = null;
    let mimeType = 'image/webp';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return jsonResponse({ error: 'No file provided in form data' }, 400);
      }
      fileBuffer = await file.arrayBuffer();
      if (file.type) mimeType = file.type;
    } else if (contentType.startsWith('image/')) {
      fileBuffer = await request.arrayBuffer();
      mimeType = contentType;
    } else {
      return jsonResponse({ error: 'Unsupported media type. Expected image file.' }, 415);
    }

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return jsonResponse({ error: 'Uploaded file is empty.' }, 400);
    }

    // Enforce 5MB limit
    if (fileBuffer.byteLength > 5 * 1024 * 1024) {
      return jsonResponse({ error: 'File size exceeds 5MB limit.' }, 413);
    }

    // Determine extension
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('jpeg') ? 'jpg' : 'webp';
    const key = `recipes/${user.id}/${crypto.randomUUID()}-${Date.now()}.${ext}`;

    await env.BUCKET.put(key, fileBuffer, {
      httpMetadata: {
        contentType: mimeType,
      },
    });

    const publicUrl = `/api/assets/${key}`;

    return jsonResponse({
      url: publicUrl,
      key,
      size: fileBuffer.byteLength,
    }, 201);
  } catch (err: any) {
    console.error('Upload error:', err);
    return jsonResponse({ error: err.message || 'Image upload failed' }, 500);
  }
};
