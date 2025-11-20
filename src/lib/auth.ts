import {
    betterAuth
} from 'better-auth';
// import { Pool } from "pg";np
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from '../generated/prisma/client';
import { passkey } from "better-auth/plugins/passkey"
import { nextCookies } from "better-auth/next-js";


const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {provider: "postgresql"} ),
    emailAndPassword: {
        enabled: true,
        // async sendResetPassword(data, request) {
        //     // Send an email to the user with a link to reset their password
        // },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }
    },
    plugins: [
        nextCookies(),
        passkey(),

    ],
    debug: true,
    /** if no database is provided, the user data will be stored in memory.
     * Make sure to provide a database to persist user data **/
});

// function passkey(): any {
//     throw new Error('Function not implemented.');
// }
