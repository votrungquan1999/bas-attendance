"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function action_resetTaker() {
	const cookieStore = await cookies();
	cookieStore.delete("taker");
	return redirect("/attendance");
}
