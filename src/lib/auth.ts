import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";

export interface SessionData {
  userId?: string;
  role?: string;
  isLoggedIn: boolean;
}

if (!process.env.SECRET_COOKIE_PASSWORD) {
  throw new Error("SECRET_COOKIE_PASSWORD environment variable is required");
}

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieName: "lokalmart_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  },
};

export async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCurrentUser() {
    try {
        const session = await getSession();
        
        if (!session.userId) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        return user;
    } catch (error) {
        console.error("Gagal membaca session", error);
        return null;
    }
}
