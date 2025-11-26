// auth.ts
import { betterAuth } from "better-auth";
import { sendEmail } from "@/lib/brevo"; // your email sending function

interface SendVerificationEmailParams {
  user: {
    email: string;
    name?: string;
  };
  url: string;
  token: string;
}

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }: SendVerificationEmailParams) => {
      await sendEmail({
        to: user.email,
        templateId: 1, // Your Brevo template ID
        params: {
          VERIFICATION_URL: url,          
          USERNAME: user.name || "User",  
        },
      });
    },
  },
});
