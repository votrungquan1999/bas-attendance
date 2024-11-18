import AuthWrapper from "../components/AuthWrapper";

export default function AttendanceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AuthWrapper>{children}</AuthWrapper>;
}
