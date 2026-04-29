"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Send, X } from "lucide-react";

type SubmitState = "idle" | "sending" | "sent" | "error";

const services = [
  "Website design",
  "UI/UX design",
  "SEO optimization",
  "Landing page",
  "Performance optimization",
  "Responsive design"
];

export function ContactModal() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest<HTMLElement>("[data-contact-trigger], a[href='#contact']");
      if (!trigger) return;

      event.preventDefault();
      setState("idle");
      setMessage("");
      setOpen(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => panelRef.current?.querySelector<HTMLInputElement>("input[name='name']")?.focus(), 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Message could not be sent.");
      }

      form.reset();
      setState("sent");
      setMessage("Message sent. I will reply soon.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Message could not be sent right now.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="contact-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div className="contact-modal__panel" ref={panelRef}>
        <button className="contact-modal__close" type="button" aria-label="Close contact form" onClick={() => setOpen(false)}>
          <X size={18} aria-hidden="true" />
        </button>

        <div className="contact-modal__head">
          <p className="elite-kicker">Contact</p>
          <h2 id="contact-modal-title">Tell me what you want to build.</h2>
        </div>

        <form className="contact-modal__form" onSubmit={onSubmit}>
          <label>
            <span>Name</span>
            <input name="name" placeholder="Your name" autoComplete="name" required />
          </label>

          <label>
            <span>Your email</span>
            <input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </label>

          <div className="contact-modal__split">
            <label>
              <span>Service</span>
              <select name="service" defaultValue="">
                <option value="">Select one</option>
                {services.map((service) => (
                  <option value={service} key={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Budget</span>
              <input name="budget" placeholder="Optional" />
            </label>
          </div>

          <label>
            <span>Message</span>
            <textarea name="message" rows={6} placeholder="What are we building?" required />
          </label>

          <label className="contact-modal__trap" aria-hidden="true">
            <span>Company</span>
            <input name="company" tabIndex={-1} autoComplete="off" />
          </label>

          <button className="elite-pill elite-pill--light contact-modal__submit" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "Sending" : "Send message"}
            {state === "sending" ? <Send size={16} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />}
          </button>

          {message ? (
            <p className={`contact-modal__status contact-modal__status--${state}`} role="status">
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
