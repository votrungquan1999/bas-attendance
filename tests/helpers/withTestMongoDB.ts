import { MongoClient } from "mongodb";
import { nanoid } from "nanoid";
import { injectMongoDB } from "src/server/withMongoDB";

export default function withTestMongoDB(fn: () => void) {
	const dbName = `test-database-attendances-${nanoid()}`;

	const client = new MongoClient("mongodb://localhost:27017");
	const db = client.db(dbName);

	return injectMongoDB(db, fn);
}

export async function cleanUp() {
	const client = new MongoClient("mongodb://localhost:27017");

	// get all the databases with the prefix "test-databse-attendances-"
	const databases = await client.db().admin().listDatabases();

	// drop all the databases
	for (const database of databases.databases) {
		if (database.name.startsWith("test-database-attendances-")) {
			await client.db(database.name).dropDatabase();
		}
	}
}
