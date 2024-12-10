"use client";

import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SignInButton({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const pathName = usePathname();

	return (
		<button
			type="button"
			onClick={() => signIn(undefined, { callbackUrl: pathName })}
			className={className}
		>
			{children}
		</button>
	);
}
