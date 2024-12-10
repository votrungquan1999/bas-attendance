import getSession from "src/server/next-auth/getSession";
import SignInButton from "./SignInButton";

export default async function AuthRequired({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session) {
		return (
			<div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
				<div className="rounded-lg bg-red-50 p-8 dark:bg-red-950">
					<h2 className="mb-2 text-2xl font-semibold text-red-600 dark:text-red-400">
						Access Denied
					</h2>
					<p className="mb-6 text-gray-600 dark:text-gray-300">
						You are not authorized to access this page. Please sign in to
						continue.
					</p>
					<SignInButton className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
						Sign In
					</SignInButton>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
