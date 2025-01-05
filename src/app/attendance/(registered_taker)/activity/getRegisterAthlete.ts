import { cookies } from "next/headers";

export async function getRegisterAthlete() {
	const cookieStore = await cookies();
	const takerId = cookieStore.get("taker");

	return takerId?.value;
}
