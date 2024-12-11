import { Suspense } from "react";
import AuthRequired from "src/components/next_auth/AuthRequired";
import AdminSidebar from "src/components/navigation/AdminSidebar";
import {
	SidebarProvider,
	AdminSidebarRoot,
} from "src/components/navigation/AdminSidebarContainer";
import { MainAdminContent } from "src/components/navigation/MainAdminContent";

export default function AdminLayout({
	children,
	header,
}: {
	children: React.ReactNode;
	header: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<div className="flex-1 flex flex-col bg-gray-50">
				<AdminSidebarRoot>
					<AdminSidebar />
				</AdminSidebarRoot>
				<MainAdminContent>
					<div className="sticky top-0 z-10">{header}</div>

					<Suspense fallback={<div>Loading...</div>}>
						<AuthRequired>{children}</AuthRequired>
					</Suspense>
				</MainAdminContent>
			</div>
		</SidebarProvider>
	);
}
