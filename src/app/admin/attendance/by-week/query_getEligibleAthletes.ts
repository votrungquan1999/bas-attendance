import { getTakers } from "src/app/attendance/taker/getTakers";

export default async function query_getEligibleAthletes() {
	const allAthletes = await getTakers();

	const eligibleAthletes = allAthletes.filter(
		(athlete) => athlete.id !== "test_user",
		// use this when need to show test user
		// () => true,
	);

	return eligibleAthletes;
}
