import CodeAuthWrapper from "../components/CodeAuthWrapper";

export default function AttendanceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <CodeAuthWrapper>{children}</CodeAuthWrapper>;
}
