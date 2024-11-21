import { MongoClient, type Db } from "mongodb";

const mongoUrl = process.env.MONGO_URL ?? "mongodb://localhost:27017";

// TODO: find out why async disposable is not working
export default async function getDB(): Promise<{
	db: Db;
	close: () => Promise<void>;
}> {
	const client = await MongoClient.connect(mongoUrl);
	const db = client.db("attendances");

	return { db: db, close: () => client.close() };
}
