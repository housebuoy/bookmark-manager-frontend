// auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { passkey } from "better-auth/plugins/passkey";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "@/lib/brevo"; // Brevo email sending function

// const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql"}),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    signUp: {
      autoSignIn: false,
    },
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        templateId: 2, // Brevo template ID
        params: {
          RESET_PASSWORD_URL: url,
          USERNAME: user.name || "User",
        },
      });
    },
    onPasswordReset: async ({ user }) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        templateId: 1, // Brevo template ID
        params: {
          VERIFICATION_URL: url,
          USERNAME: user.name || "User",
        },
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [nextCookies(), passkey()],
  debug: true,
});
