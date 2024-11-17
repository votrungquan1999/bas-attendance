import type { Metadata } from "next";
import "./globals.css";
import { Satisfy, Inter } from "next/font/google";
import AuthWrapper from "./components/AuthWrapper";

const satisfy = Satisfy({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-satisfy",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

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
		<html lang="en" className={`${satisfy.variable} ${inter.variable}`}>
			<body className="min-h-dvh flex font-inter">
				<AuthWrapper>{children}</AuthWrapper>
			</body>
		</html>
	);
}
