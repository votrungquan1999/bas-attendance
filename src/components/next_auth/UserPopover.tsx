import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/shadcn/components/ui/popover";
import SignOutButton from "./SignOutButton";
import getSession from "src/server/next-auth/getSession";

export default async function UserPopover() {
	const session = await getSession();

	const userInitial =
		session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "?";

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-lg font-semibold transition-colors hover:bg-gray-500"
				>
					{userInitial.toUpperCase()}
				</button>
			</PopoverTrigger>

			<PopoverContent className="w-64" align="end">
				<div className="space-y-4">
					<div className="space-y-2">
						{session?.user?.name && (
							<p className="font-medium text-slate-900">{session.user.name}</p>
						)}
						{session?.user?.email && (
							<p className="text-sm text-slate-500">{session.user.email}</p>
						)}
					</div>
					<hr className="border-slate-200" />
					<SignOutButton className="w-full rounded-md bg-red-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-red-700">
						Sign Out
					</SignOutButton>
				</div>
			</PopoverContent>
		</Popover>
	);
}
