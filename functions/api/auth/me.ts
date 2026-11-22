import { Env, authenticateRequest, jsonResponse } from '../../utils/auth';

export const onRequestOptions = async () => {
  return jsonResponse({}, 200);
};

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const user = await authenticateRequest(request, env);
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  return jsonResponse({ user });
};
