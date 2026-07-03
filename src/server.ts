import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(1000),
});

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

async function handleContactApi(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  const requestBody = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(requestBody);

  if (!parsed.success) {
    return jsonResponse({ error: "Invalid request payload", issues: parsed.error.issues }, 400);
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return jsonResponse({ error: "Missing mail service access key." }, 500);
  }

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      access_key: accessKey,
      subject: parsed.data.subject,
      from_name: parsed.data.name,
      replyto: parsed.data.email,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || "Not provided",
      message: parsed.data.message,
    }),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    return jsonResponse({ error: json?.message ?? "Failed to send message." }, 502);
  }

  return jsonResponse({ success: true });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/send-contact-message") {
        return await handleContactApi(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
