/* eslint-disable @typescript-eslint/no-explicit-any */

import { AsyncLocalStorage } from "node:async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage();

type Initializer<T> = () => T | Promise<T>;

type SetupFn<T> = {
	inject: Inject<T>;
	get: () => Awaited<T>;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AsyncFunction = (...args: any[]) => Promise<any>;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type SyncFunction = (...args: any[]) => any;
type AnyFunction = AsyncFunction | SyncFunction;

type Inject<T> = {
	// Overload 1: For direct value injection
	<FnType extends AnyFunction>(value: T, fn: FnType): FnType;
	// Overload 2: For function injection
	<FnType extends AnyFunction>(fn: FnType): FnType;
};

export function setup<T>(initializer: Initializer<T>): SetupFn<T> {
	return {
		inject: <FnType extends AnyFunction>(
			valueOrFn: T | FnType,
			maybeFn?: FnType,
		) => {
			// Direct value injection case
			if (maybeFn) {
				return (...args: Parameters<FnType>) =>
					asyncLocalStorage.run(valueOrFn as T, () => maybeFn(...args));
			}

			// Implicit function injection case
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			return async (...args: any[]) => {
				const injectedValue = asyncLocalStorage.getStore();

				if (injectedValue) {
					return asyncLocalStorage.run(injectedValue, () =>
						(valueOrFn as AnyFunction)(...args),
					);
				}

				const initValue = await initializer();
				return asyncLocalStorage.run(initValue, () =>
					(valueOrFn as AnyFunction)(...args),
				);
			};
		},

		get: () => asyncLocalStorage.getStore() as Awaited<T>,
	};
}
