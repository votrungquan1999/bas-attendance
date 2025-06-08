"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "src/shadcn/lib/utils";
import type { ReactNode } from "react";

interface SubmitButtonRootProps {
	children: ReactNode;
	className?: string;
	disabled?: boolean;
}

export function Root({ children, className, disabled }: SubmitButtonRootProps) {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={disabled || pending}
			className={cn(
				"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
				pending && "animate-pulse",
				className,
			)}
		>
			{children}
			{pending && <Loader2 className="w-4 h-4 animate-spin" />}
		</button>
	);
}

interface SubmitMessageProps {
	children: ReactNode;
}

export function SubmitMessage({ children }: SubmitMessageProps) {
	const { pending } = useFormStatus();

	if (pending) return null;

	return <>{children}</>;
}

interface PendingMessageProps {
	children: ReactNode;
}

export function PendingMessage({ children }: PendingMessageProps) {
	const { pending } = useFormStatus();

	if (!pending) return null;

	return <>{children}</>;
}
