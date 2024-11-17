import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function action_handleSelectTaker(value: string) {
	"use server";

	const cookieStore = await cookies();

	const [id] = value.split("-");

	if (!id) return;

	cookieStore.set("taker", id);

	revalidatePath("/");
}
