"use server";

import { cookies } from "next/headers";

export async function action_saveAuthCode(formData: FormData) {
	const cookieStore = await cookies();

	const code = formData.get("code") as string;

	if (!code) {
		return;
	}

	cookieStore.set("code", code, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});
}
