import { MongoClient } from "mongodb";
import { setup } from "./asyncLocal";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME ?? "attendances";
const MONGO_URL = process.env.MONGO_URL ?? "mongodb://localhost:27017";

function initMongoDB() {
	const client = new MongoClient(MONGO_URL);
	const db = client.db(MONGO_DB_NAME);

	return db;
}

const { inject, get } = setup(initMongoDB);

export const injectMongoDB = inject;
export const getMongoDB = get;
