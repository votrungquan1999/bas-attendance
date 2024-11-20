import { Suspense } from "react";
import CodeAuthWrapper from "../components/CodeAuthWrapper";

export default function AttendanceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CodeAuthWrapper>{children}</CodeAuthWrapper>
		</Suspense>
	);
}
