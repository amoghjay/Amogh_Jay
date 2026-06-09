import { EmailMessage } from "cloudflare:email";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const MAX_JSON_BYTES = 10_000;

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init.headers || {})
    }
  });
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanMessage(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 3000);
}

function cleanHeader(value, fallback) {
  const cleaned = cleanText(value, 160).replace(/[\r\n<>"]/g, "");
  return cleaned || fallback;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

async function parseContactRequest(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_JSON_BYTES) {
    return { error: "That message is a little too large. Please shorten it and try again." };
  }

  let payload;
  try {
    const body = await request.text();
    if (body.length > MAX_JSON_BYTES) {
      return { error: "That message is a little too large. Please shorten it and try again." };
    }
    payload = JSON.parse(body);
  } catch {
    return { error: "Please send the form again." };
  }

  const name = cleanText(payload.name, 100);
  const email = cleanText(payload.email, 254);
  const subject = cleanText(payload.subject, 140);
  const message = cleanMessage(payload.message);
  const website = cleanText(payload.website, 200);

  if (website) {
    return { silent: true };
  }

  if (!name || !email || !message) {
    return { error: "Please add your name, email, and message." };
  }

  if (!isValidEmail(email)) {
    return { error: "Please use a valid email address." };
  }

  return {
    data: {
      name,
      email,
      subject: subject || "Portfolio contact form",
      message
    }
  };
}

function buildRawEmail({ from, to, submission }) {
  const safeSubject = cleanHeader(submission.subject, "Portfolio contact form");
  const subject = `Portfolio contact: ${safeSubject}`;
  const submittedAt = new Date().toISOString();

  const text = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Subject: ${submission.subject}`,
    `Submitted: ${submittedAt}`,
    "",
    submission.message
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#14273b">
      <h2 style="margin:0 0 16px">New portfolio contact</h2>
      <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(submission.subject)}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
      <hr style="border:0;border-top:1px solid #d8e0e4;margin:18px 0" />
      <p style="white-space:pre-wrap">${escapeHtml(submission.message)}</p>
    </div>
  `.trim();

  const boundary = `contact-${crypto.randomUUID()}`;
  const headers = [
    `From: Portfolio Contact <${from}>`,
    `To: Amogh Jayasimha <${to}>`,
    `Reply-To: ${submission.email}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ];

  const body = [
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    `--${boundary}--`
  ];

  return [...headers, "", ...body].join("\r\n");
}

async function handleContact(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, { status: 405 });
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ ok: false, error: "Please send JSON." }, { status: 415 });
  }

  const parsed = await parseContactRequest(request);
  if (parsed.silent) return jsonResponse({ ok: true });
  if (parsed.error) return jsonResponse({ ok: false, error: parsed.error }, { status: 400 });

  if (!env.CONTACT_EMAIL || !env.CONTACT_FROM || !env.CONTACT_TO) {
    return jsonResponse({ ok: false, error: "Contact email is not configured yet." }, { status: 500 });
  }

  const raw = buildRawEmail({
    from: env.CONTACT_FROM,
    to: env.CONTACT_TO,
    submission: parsed.data
  });

  try {
    const email = new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw);
    await env.CONTACT_EMAIL.send(email);
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("contact_email_send_failed", {
      message: error instanceof Error ? error.message : String(error)
    });
    return jsonResponse({ ok: false, error: "The message could not be sent. Please email me directly." }, { status: 502 });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
