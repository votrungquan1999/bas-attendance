import getDB from "../db";
import {
	SummerPracticesCollectionName,
	type SummerPracticesCollectionDocument,
} from "../collections";
import { cache } from "react";

export default cache(async function query_getSummerPracticeById(
	practiceId: string,
): Promise<SummerPracticesCollectionDocument | null> {
	const { db, close } = await getDB();

	try {
		const practicesCollection =
			db.collection<SummerPracticesCollectionDocument>(
				SummerPracticesCollectionName,
			);

		const practice = await practicesCollection.findOne({ id: practiceId });

		await close();

		return practice;
	} catch (error) {
		await close();
		throw error;
	}
});
