import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
};

function isAntiBotChallenge(html: string): boolean {
  return (
    html.includes('window._cf_chl_opt') ||
    (html.includes('<title>Just a moment...</title>') && html.includes('challenges.cloudflare.com'))
  );
}

async function fetchWithCurlFallback(targetUrl: string): Promise<string | null> {
  try {
    const args = [
      '-s',
      '-L',
      '--max-time',
      '12',
      '-H',
      `User-Agent: ${BROWSER_HEADERS['User-Agent']}`,
      '-H',
      `Accept: ${BROWSER_HEADERS.Accept}`,
      '-H',
      `Accept-Language: ${BROWSER_HEADERS['Accept-Language']}`,
      targetUrl,
    ];
    const { stdout } = await execFileAsync('curl.exe', args, {
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf8',
    });
    if (stdout && stdout.length > 200 && !isAntiBotChallenge(stdout)) {
      return stdout;
    }
  } catch {
    // curl.exe unavailable or failed
  }
  return null;
}

function recipeExtractorDevPlugin(): Plugin {
  return {
    name: 'recipe-extractor-dev',
    configureServer(server) {
      server.middlewares.use('/api/extract-recipe', async (req, res, next) => {
        if (req.method === 'POST') {
          try {
            let bodyStr = '';
            for await (const chunk of req) {
              bodyStr += chunk;
            }
            const { url } = JSON.parse(bodyStr || '{}');
            if (!url || typeof url !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing url parameter' }));
              return;
            }

            let parsedUrl: URL;
            try {
              parsedUrl = new URL(url.trim());
              if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'URL must use HTTP or HTTPS' }));
                return;
              }
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid URL format' }));
              return;
            }

            const targetUrl = parsedUrl.toString();
            const response = await fetch(targetUrl, {
              headers: BROWSER_HEADERS,
              signal: AbortSignal.timeout(12000),
            });

            if (response.ok) {
              const html = await response.text();
              if (!isAntiBotChallenge(html)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, html }));
                return;
              }
            }

            // Fallback to native curl.exe (uses OS TLS stack, bypasses Node TLS fingerprint blocks on sites like AllRecipes)
            const curlHtml = await fetchWithCurlFallback(targetUrl);
            if (curlHtml) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, html: curlHtml }));
              return;
            }

            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: response.ok
                  ? 'Target website blocked automated extraction with a bot check.'
                  : `Target website returned status ${response.status}`,
              })
            );
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'Server error',
              })
            );
          }
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    recipeExtractorDevPlugin(),
  ],
});
