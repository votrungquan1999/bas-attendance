import { mock } from "bun:test";
import withTestMongoDB from "./withTestMongoDB";

export default function withTestContext(fn: () => void): () => void {
	// Mock Next.js cache functions
	mock.module("next/cache", () => ({
		unstable_cacheLife: mock(() => {}),
		unstable_cacheTag: mock(() => {}),
	}));

	// Mock query_getEligibleAthletes
	mock.module(
		"src/app/admin/attendance/by-week/query_getEligibleAthletes",
		() => ({
			default: async () => [
				{
					id: "athlete1",
					value: "Test Athlete",
				},
			],
		}),
	);

	return withTestMongoDB(fn);
}
