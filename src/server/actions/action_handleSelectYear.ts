"use server";

import { DateTime } from "luxon";
import { cookies } from "next/headers";

export async function action_handleSelectYear(year: number) {
	const cookieStore = await cookies();
	cookieStore.set("selected_year", year.toString());
}

export async function query_getSelectedYear(): Promise<number> {
	const cookieStore = await cookies();
	const selectedYear = cookieStore.get("selected_year");

	if (!selectedYear?.value) {
		return DateTime.fromJSDate(new Date(), { zone: "Asia/Saigon" }).year;
	}

	return Number.parseInt(selectedYear.value);
}
