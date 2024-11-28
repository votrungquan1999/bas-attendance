import { redirect } from "next/navigation";
import { getTakers } from "../taker/getTakers";
import { getRegisterTake } from "./getRegisterTake";
import action_resetTaker from "../../../server/actions/action_resetTaker";

export default async function query_getTakerFromCookies(): Promise<{
	id: string;
	name: string;
}> {
	const takerId = await getRegisterTake();

	if (!takerId) {
		redirect("/attendance");
	}

	const takers = await getTakers();
	const athlete = takers.find((taker) => taker.id === takerId);

	if (!athlete) {
		return action_resetTaker();
	}

	return {
		id: athlete.id,
		name: athlete.value,
	};
}
