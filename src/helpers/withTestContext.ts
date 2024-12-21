import { mock } from "bun:test";
import withTestMongoDB from "./withTestMongoDB";
import { cleanUp as cleanUpMongoDB } from "./withTestMongoDB";

export default function withTestContext(fn: () => void): () => void {
	// Mock Next.js cache functions
	mock.module("next/cache", () => ({
		unstable_cacheLife: mock(() => {}),
		unstable_cacheTag: mock(() => {}),
	}));

	return withTestMongoDB(fn);
}

export async function cleanUp() {
	await cleanUpMongoDB();
}

export async function mockGetEligibleAthletes() {
	mock.module(
		"src/app/admin/attendance/by-week/query_getEligibleAthletes",
		() => ({
			default: async () => [
				{
					id: "athlete1",
					value: "Test Athlete 1",
				},
				{
					id: "athlete2",
					value: "Test Athlete 2",
				},
				{
					id: "athlete3",
					value: "Test Athlete 3",
				},
			],
		}),
	);
}
