import type { Metadata } from "next";
import "./globals.css";
import { Satisfy, Inter } from "next/font/google";
import Footer from "../components/navigation/Footer";

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
			<body className="min-h-dvh flex flex-col font-inter">
				<div className="flex-1 flex flex-col">{children}</div>
				{/* footer placeholder so that it does not cover the content */}
				<div className="h-[36px] sm:h-[40px] w-full" />
				<div className="fixed bottom-0 w-full">
					<Footer />
				</div>
			</body>
		</html>
	);
}
