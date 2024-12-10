import type {} from "next-auth";

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			login: string;
			email: string;
			name: string;
			role: "admin" | "moderator";
		};
	}
}

declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT {
		role: "admin" | "moderator";
		login: string;
		email: string;
		name: string;
	}
}
