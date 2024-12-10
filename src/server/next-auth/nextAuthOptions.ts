import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedEmails = ["votrungquan99@gmail.com"];

const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";

export const nextAuthOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId,
			clientSecret,
		}),
	],
	callbacks: {
		async signIn({ account, profile }) {
			if (account?.provider === "google" && profile?.email) {
				return allowedEmails.includes(profile.email);
			}

			return true;
		},

		async jwt({ token, account }) {
			// only assign value on the first time
			if (account) {
				token.role = "moderator";
				token.login = token.email ?? "";

				if (account.provider === "google") {
					token.role = "admin";
				}
			}

			return token;
		},

		async session({ token, session }) {
			session.user.login = token.login;
			session.user.email = token.email;
			session.user.name = token.name;
			session.user.role = token.role;

			return session;
		},
	},
};
