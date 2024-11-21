import { MongoClient, type Db } from "mongodb";

const mongoUrl = process.env.MONGO_URL ?? "mongodb://localhost:27017";

export default async function getDB(): Promise<Db & AsyncDisposable> {
	const client = await MongoClient.connect(mongoUrl);
	const db = client.db("attendances");

	const disposable = Object.assign(db, {
		[Symbol.asyncDispose]: () => client.close(),
	});

	return disposable;
}
