import { MongoClient } from "mongodb";
import { injectMongoDB } from "src/server/withMongoDB";

export default function withTestMongoDB(fn: () => void) {
	const client = new MongoClient("mongodb://localhost:27017");
	const db = client.db("attendances");

	return injectMongoDB(db, fn);
}
