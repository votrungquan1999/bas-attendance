import getDB from "../db";
import {
	SummerPracticesCollectionName,
	type SummerPracticesCollectionDocument,
} from "../collections";

export default async function query_getSummerPractices(): Promise<string[]> {
	const { db, close } = await getDB();

	try {
		const practicesCollection =
			db.collection<SummerPracticesCollectionDocument>(
				SummerPracticesCollectionName,
			);

		const practices = await practicesCollection
			.find({})
			.sort({ created_at: -1 }) // Most recent first
			.project({ id: 1 }) // Only return id field
			.toArray();

		await close();

		return practices.map((practice) => practice.id);
	} catch (error) {
		await close();
		throw error;
	}
}
