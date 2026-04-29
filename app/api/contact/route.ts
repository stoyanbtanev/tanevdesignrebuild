import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactPayload = {
  name: string;
  email: string;
  service: string;
  budget: string;
  message: string;
};

const fieldLimit = {
  name: 120,
  email: 160,
  service: 120,
  budget: 120,
  message: 4000
} as const;

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getRecipient() {
  return process.env.CONTACT_TO_EMAIL || ["stoyanbtanev", "gmail.com"].join("@");
}

function buildPayload(input: Record<string, unknown>): ContactPayload {
  return {
    name: clean(input.name, fieldLimit.name),
    email: clean(input.email, fieldLimit.email).toLowerCase(),
    service: clean(input.service, fieldLimit.service),
    budget: clean(input.budget, fieldLimit.budget),
    message: clean(input.message, fieldLimit.message)
  };
}

async function sendWithResend(payload: ContactPayload, recipient: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.CONTACT_FROM_EMAIL || "Tanev Design <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: recipient,
      reply_to: payload.email,
      subject: `New project inquiry from ${payload.name}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Service: ${payload.service || "Not selected"}`,
        `Budget: ${payload.budget || "Not provided"}`,
        "",
        payload.message
      ].join("\n")
    })
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with ${response.status}`);
  }

  return true;
}

async function sendWithFormRelay(payload: ContactPayload, recipient: string) {
  const form = new URLSearchParams({
    name: payload.name,
    email: payload.email,
    service: payload.service || "Not selected",
    budget: payload.budget || "Not provided",
    message: payload.message,
    _subject: `New project inquiry from ${payload.name}`,
    _template: "table",
    _captcha: "false"
  });

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form
  });

  if (!response.ok) {
    throw new Error(`Form relay request failed with ${response.status}`);
  }
}

export async function POST(request: Request) {
  let input: Record<string, unknown>;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (clean(input.company, 120)) {
    return NextResponse.json({ ok: true });
  }

  const payload = buildPayload(input);

  if (!payload.name || !isEmail(payload.email) || payload.message.length < 10) {
    return NextResponse.json({ ok: false, message: "Please complete the required fields." }, { status: 400 });
  }

  try {
    const recipient = getRecipient();
    const sentWithResend = await sendWithResend(payload, recipient);
    if (!sentWithResend) {
      await sendWithFormRelay(payload, recipient);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form send failed", error);
    return NextResponse.json(
      { ok: false, message: "Message could not be sent right now." },
      { status: 502 }
    );
  }
}
