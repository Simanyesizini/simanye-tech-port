import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(1000),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!RESEND_API_KEY || !LOVABLE_API_KEY) {
      throw new Error("Email service is not configured");
    }

    const now = new Date().toISOString();
    const html = `
      <h2>New Portfolio Contact Message</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>
      <hr />
      <p><small>Sent: ${now}</small></p>
    `;

    const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: ["Simanyetevin@gmail.com"],
        reply_to: data.email,
        subject: "New Portfolio Contact Message",
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[contact] resend error", res.status, text);
      throw new Error(`Send failed: ${res.status}`);
    }
    return { ok: true };
  });

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
