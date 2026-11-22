import { Env, jsonResponse } from '../../utils/auth';

export const onRequestOptions = async () => {
  return jsonResponse({}, 200);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  return jsonResponse({ success: true });
};
