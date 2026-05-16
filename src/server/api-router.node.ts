import type { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";
import { handleApiRequest } from "./api-router.ts";
import type { SiteEnv } from "./site-env.ts";

dotenv.config({ path: ".env.local" });
dotenv.config();

/** Build Fetch Headers from Node raw headers so Cookie lines merge with "; " (spec-correct), not ",". */
function incomingMessageToHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  const raw = req.rawHeaders;
  for (let i = 0; i < raw.length; i += 2) {
    const name = raw[i];
    const value = raw[i + 1];
    if (value === undefined) continue;
    headers.append(name, value);
  }
  return headers;
}

function getSetCookieLines(response: Response): string[] {
  const h = response.headers;
  if (typeof h.getSetCookie === "function") {
    return h.getSetCookie();
  }
  const single = h.get("Set-Cookie");
  return single ? [single] : [];
}

function nodeEnv(): SiteEnv {
  return {
    ASSETS: null as unknown as Fetcher,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ?? "",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? "",
    JWT_SECRET:
      process.env.JWT_SECRET ?? "orange-ember-fallback-secret-for-dev",
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? "",
    RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
    NODE_ENV: process.env.NODE_ENV,
  };
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk as Buffer));
  }
  return Buffer.concat(chunks);
}

export async function handleApiRequestNode(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const host = req.headers.host ?? "localhost";
  const url = `http://${host}${req.url ?? "/"}`;
  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await readBody(req);

  const request = new Request(url, {
    method: req.method,
    headers: incomingMessageToHeaders(req),
    body: body && body.length ? body : undefined,
  });

  const env = nodeEnv();
  const response = await handleApiRequest(request, env);

  res.statusCode = response.status;
  const setCookies = getSetCookieLines(response);
  if (setCookies.length) {
    res.setHeader("Set-Cookie", setCookies);
  }
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
}
