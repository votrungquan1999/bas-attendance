import { cookies } from "next/headers";

export async function getRegisterTake() {
	const cookieStore = await cookies();
	const takerId = cookieStore.get("taker");

	return takerId?.value;
}
