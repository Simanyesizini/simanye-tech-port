import { z } from "zod";

const schema = z.object({
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

export async function POST(request: Request) {
  const requestBody = await request.json().catch(() => null);
  const parsed = schema.safeParse(requestBody);

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
