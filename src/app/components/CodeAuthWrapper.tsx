import { cookies } from "next/headers";
import CodeAuthModal from "./CodeAuthModal";

interface AuthWrapperProps {
	children: React.ReactNode;
}

const ACCESS_CODE = process.env.ACCESS_CODE;

export default async function CodeAuthWrapper({ children }: AuthWrapperProps) {
	const cookieStore = await cookies();
	const userCode = cookieStore.get("code");

	const isAuthenticated = userCode?.value === ACCESS_CODE;

	if (isAuthenticated) {
		return <>{children}</>;
	}

	const isInvalidCode = !!userCode?.value;

	return (
		<>
			<CodeAuthModal invalidCode={isInvalidCode} />
			<div className="opacity-50 pointer-events-none flex-1">{children}</div>
		</>
	);
}
