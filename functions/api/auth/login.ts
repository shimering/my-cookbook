import { Env, jsonResponse } from '../../utils/auth';
import { verifyPassword, generateToken } from '../../utils/crypto';

export const onRequestOptions = async () => {
  return jsonResponse({}, 200);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required.' }, 400);
    }

    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, salt FROM users WHERE email = ? LIMIT 1'
    )
      .bind(email)
      .first<{ id: string; email: string; password_hash: string; salt: string }>();

    if (!user) {
      return jsonResponse({ error: 'Invalid email or password.' }, 401);
    }

    const isValid = await verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return jsonResponse({ error: 'Invalid email or password.' }, 401);
    }

    // Create new 30-day session
    const token = generateToken();
    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(sessionId, user.id, token, expiresAt, now)
      .run();

    return jsonResponse({
      user: { id: user.id, email: user.email },
      token,
      expiresAt,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return jsonResponse({ error: err.message || 'Login failed' }, 500);
  }
};
