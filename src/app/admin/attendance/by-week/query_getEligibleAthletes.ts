import { getTakers } from "src/app/attendance/taker/getTakers";

export default async function query_getEligibleAthletes() {
	const allAthletes = await getTakers();

	const eligibleAthletes = allAthletes.filter(
		(athlete) => athlete.id !== "test_user",
	);
	return eligibleAthletes;
}
