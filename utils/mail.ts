import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config({ path: "../.env" });
const url = "http://localhost:5173";

if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM) {
  throw new Error("Missing SendGrid credentials in environment variables");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
export const sendMail = async (token: string, email: string) => {
  const verifyUrl = `${url}/verify?token=${token}`;

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM!, // must be verified in SendGrid
      name: "Scholargeng",
    },
    subject: "Welcome to Scholargeng! Verify Your Email 🎓",
    text: `
Welcome to Scholargeng!

We're excited to have you onboard. Scholargeng is your one-stop hub for course materials, study resources, and academic support — built for students, by students.

Please verify your email address to activate your account and gain full access.

Click the link below (or copy and paste it into your browser):

${verifyUrl}

If you didn’t create an account, please ignore this email.

Scholargeng — making academics easier for everybody.
"Na smallz, if e choke, we go still run am."

Thanks,
The Scholargeng Team
  `,
    html: `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Welcome to Scholargeng 🎓</h2>

    <p>Hi there,</p>

    <p>
      We're excited to have you onboard! Scholargeng is your one-stop academic
      companion — helping you access course materials, share knowledge, stay organized,
      and level up your studies.
    </p>

    <p>Please verify your email address to activate your account:</p>

    <p>
      <a href="${verifyUrl}"
        style="
          display:inline-block;
          padding:10px 20px;
          background-color:#2563eb;
          color:#fff;
          text-decoration:none;
          border-radius:6px;
          font-weight:bold;
        "
      >
        Verify Email
      </a>
    </p>

    <p>If the button doesn’t work, copy and paste this link into your browser:</p>

    <p style="word-break: break-all;">
      <a href="${verifyUrl}">${verifyUrl}</a>
    </p>

    <hr>

    <p style="font-size: 12px; color: #777;">
      Scholargeng — making academics easier for everybody.<br/>
      <strong>“Na smallz, if e choke, we go still run am.”</strong><br/><br/>
      If you didn’t create an account, kindly ignore this email.
    </p>
  </div>
  `,
  };

  try {
    const response = await sgMail.send(msg);
    console.log("✅ Email sent:", response[0].statusCode);
  } catch (err: any) {
    console.error("❌ SendGrid error:", err.response?.body || err.message);
    throw new Error("Error sending mail to user");
  }

}