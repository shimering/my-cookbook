import { Env, jsonResponse } from '../../utils/auth';
import { hashPassword, generateToken } from '../../utils/crypto';

export const onRequestOptions = async () => {
  return jsonResponse({}, 200);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !email.includes('@') || !password || password.length < 6) {
      return jsonResponse(
        { error: 'Valid email and a password of at least 6 characters are required.' },
        400
      );
    }

    // Check if user already exists
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ? LIMIT 1')
      .bind(email)
      .first();

    if (existing) {
      return jsonResponse({ error: 'An account with this email already exists.' }, 409);
    }

    const userId = crypto.randomUUID();
    const now = Date.now();
    const { hash, salt } = await hashPassword(password);

    // Insert user
    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(userId, email, hash, salt, now, now)
      .run();

    // Create 30-day session
    const token = generateToken();
    const sessionId = crypto.randomUUID();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(sessionId, userId, token, expiresAt, now)
      .run();

    return jsonResponse({
      user: { id: userId, email },
      token,
      expiresAt,
    }, 201);
  } catch (err: any) {
    console.error('Register error:', err);
    return jsonResponse({ error: err.message || 'Registration failed' }, 500);
  }
};
