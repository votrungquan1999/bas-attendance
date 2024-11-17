import { ActivityProvider } from "./ActivityContext";

export default function ActivityLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ActivityProvider>{children}</ActivityProvider>;
}
