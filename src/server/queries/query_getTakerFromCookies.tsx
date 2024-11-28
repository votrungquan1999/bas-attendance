import { redirect } from "next/navigation";
import { getTakers } from "../../app/attendance/taker/getTakers";
import { getRegisterTake } from "../../app/attendance/activity/getRegisterTake";
import action_resetTaker from "../actions/action_resetTaker";

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
