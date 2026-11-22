export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
}

export interface AuthUser {
  id: string;
  email: string;
}

export function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      ...extraHeaders,
    },
  });
}

export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<AuthUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  try {
    const now = Date.now();
    const result = await env.DB.prepare(
      `SELECT u.id, u.email 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.token = ? AND s.expires_at > ? 
       LIMIT 1`
    )
      .bind(token, now)
      .first<{ id: string; email: string }>();

    if (!result) return null;
    return {
      id: result.id,
      email: result.email,
    };
  } catch (err) {
    console.error('authenticateRequest error:', err);
    return null;
  }
}
