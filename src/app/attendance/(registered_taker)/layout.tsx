import { Suspense } from "react";
import CodeAuthWrapper from "src/components/CodeAuthWrapper";
import NavFooter from "src/components/navigation/NavFooter";

export default function RegisteredTakerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="bg-gray-50 flex-1 flex flex-col">
			<NavFooter />

			<main className="flex-1 sm:pl-[72px]">
				<Suspense fallback={<div>Loading...</div>}>
					<CodeAuthWrapper>{children}</CodeAuthWrapper>
				</Suspense>
			</main>

			{/* Navigation Placeholder for Mobile */}
			<div className="sm:hidden h-[52px]" aria-hidden="true" />
		</div>
	);
}
