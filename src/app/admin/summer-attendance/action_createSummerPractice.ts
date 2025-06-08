"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import getDB from "../../../server/db";
import {
	SummerPracticesCollectionName,
	type SummerPracticesCollectionDocument,
} from "../../../server/collections";

export async function action_createSummerPractice(formData: FormData) {
	// Practice date comes as ISO date string in format: "YYYY-MM-DD" (e.g., "2024-07-15")
	// This is the standard HTML date input format from date pickers
	const practiceDate = formData.get("practiceDate") as string;

	if (!practiceDate) {
		throw new Error("Practice date is required");
	}

	const date = new Date(practiceDate);

	if (Number.isNaN(date.getTime())) {
		throw new Error("Invalid practice date");
	}

	const { db, close } = await getDB();

	try {
		const practiceId = nanoid();
		const now = Date.now();

		await db
			.collection<SummerPracticesCollectionDocument>(
				SummerPracticesCollectionName,
			)
			.insertOne({
				id: practiceId,
				date: practiceDate,
				attendance_data: {
					athletes: [],
				},
				created_at: now,
				updated_at: now,
			});

		await close();

		// Revalidate the summer attendance page to show the new practice
		revalidatePath("/admin/summer-attendance");

		// Redirect to the practice detail page
		redirect(`/admin/summer-attendance/${practiceId}`);
	} catch (error) {
		await close();
		throw error;
	}
}
