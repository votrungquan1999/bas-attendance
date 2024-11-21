import { Suspense } from "react";

export default function AdminLayout({
	children,
	header,
}: {
	children: React.ReactNode;
	header: React.ReactNode;
}) {
	return (
		<div className="flex-1 flex flex-col">
			{header}
			<Suspense fallback={<div>Loading...</div>}>
				<main className="flex-grow container mx-auto p-4">{children}</main>
			</Suspense>
		</div>
	);
}
