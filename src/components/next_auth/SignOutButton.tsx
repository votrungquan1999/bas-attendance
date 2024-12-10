"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface SignOutButtonProps {
	children: React.ReactNode;
	className?: string;
}

export default function SignOutButton({
	children,
	className,
}: SignOutButtonProps) {
	const pathName = usePathname();

	return (
		<button
			type="button"
			onClick={() => signOut({ callbackUrl: pathName })}
			className={className}
		>
			{children}
		</button>
	);
}
