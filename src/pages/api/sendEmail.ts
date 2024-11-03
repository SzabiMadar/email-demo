/* import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { from, to, subject, html, text } = body;

    if (!from || !to || !subject || !html || !text) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const send = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (send.data) {
      return new Response(
        JSON.stringify({ message: "Email sent successfully!" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          statusText: "OK",
        }
      );
    } else {
      return new Response(
        JSON.stringify({ message: send.error || "Failed to send email." }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
          statusText: "Internal Server Error",
        }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
 */

import type { APIRoute } from "astro";
import { Resend } from "resend";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Név megadása kötelező"),
  email: z.string().email("Érvénytelen e-mail cím"),
  subject: z.string().min(1, "Tárgy megadása kötelező"),
  message: z.string().min(1, "Üzenet megadása kötelező"),
});

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const receiverEmails = import.meta.env.RECEIVER_EMAIL;
const senderEmail = import.meta.env.RESEND_EMAIL_CIM;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validatedData = formSchema.parse(body);

    const { name, email, subject, message } = validatedData;

    const emailResponse = await resend.emails.send({
      from: `${name} <${senderEmail}>`,
      to: receiverEmails,
      replyTo: email, // Javított változat
      subject: `Új kapcsolatfelvételi űrlap: ${subject}`,
      html: `
        <h2>Új üzenet érkezett a weboldalról</h2>
        <p><strong>Küldő neve:</strong> ${name}</p>
        <p><strong>Küldő E-mail:</strong> ${email}</p>
        <p><strong>Tárgy:</strong> ${subject}</p>
        <p><strong>Üzenet:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    if (emailResponse.error) {
      throw new Error("Hiba történt az e-mail küldése közben.");
    }

    return new Response(
      JSON.stringify({
        message: "Az üzenet sikeresen elküldve!",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ismeretlen hiba történt.";

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
