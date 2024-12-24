import { describe, expect, test } from "bun:test";
import { setup } from "../asyncLocal";

describe("asyncLocal", () => {
	test("should inject and retrieve value", async () => {
		type Context = { userId: string };
		const initializer = () => ({ userId: "123" });
		const { inject, get } = setup<Context>(initializer);

		const handler = async () => {
			const context = get();
			return context.userId;
		};

		const injectedHandler = inject(handler);
		const result = await injectedHandler();
		expect(result).toBe("123");
	});

	test("should inject custom value", async () => {
		type Context = { userId: string };
		const initializer = () => ({ userId: "default" });
		const { inject, get } = setup<Context>(initializer);

		const customContext = { userId: "custom-123" };
		const handler = async () => {
			const context = get();
			return context.userId;
		};

		const injectedHandler = inject(customContext, handler);
		const result = await injectedHandler();
		expect(result).toBe("custom-123");
	});

	test("should handle async initializer", async () => {
		type Context = { userId: string };
		const initializer = async () => {
			// Simulate async operation
			await new Promise((resolve) => setTimeout(resolve, 10));
			return { userId: "async-123" };
		};
		const { inject, get } = setup<Context>(initializer);

		const handler = async () => {
			const context = get();
			return context.userId;
		};

		const injectedHandler = inject(handler);
		const result = await injectedHandler();
		expect(result).toBe("async-123");
	});

	test("should maintain separate contexts", async () => {
		type Context = { userId: string };
		const initializer = () => ({ userId: "default" });
		const { inject, get } = setup<Context>(initializer);

		const handler1 = inject({ userId: "user1" }, async () => {
			return get().userId;
		});

		const handler2 = inject({ userId: "user2" }, async () => {
			return get().userId;
		});

		const [result1, result2] = await Promise.all([handler1(), handler2()]);
		expect(result1).toBe("user1");
		expect(result2).toBe("user2");
	});

	test("should replace context with new value", async () => {
		type Context = { userId: string };
		const initializer = () => ({ userId: "default" });
		const { inject, get } = setup<Context>(initializer);

		const handler = async () => {
			const context = get();
			return context.userId;
		};

		const injectedHandler = inject(async () => {
			const context = get();
			expect(context.userId).toBe("default");

			return inject({ userId: "new-value" }, handler)();
		});

		const result = await injectedHandler();
		expect(result).toBe("new-value");
	});
});
