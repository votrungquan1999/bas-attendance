import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "BasAttendance",
	description: "Take attendance now or get punished",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
