import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "src/shadcn/components/ui/dialog";
import { action_saveAuthCode } from "./actions/auth";

export default function AuthModal({ invalidCode }: { invalidCode: boolean }) {
	return (
		<Dialog open={true} modal={true}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogTitle className="text-2xl font-bold">
					Enter Access Code
				</DialogTitle>

				<DialogDescription>
					Please enter the access code to continue.
				</DialogDescription>

				<form action={action_saveAuthCode}>
					<input
						type="password"
						className="w-full p-2 border rounded mb-4"
						placeholder="Enter code"
						id="code"
						name="code"
					/>
					<button
						type="submit"
						className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
					>
						Submit
					</button>
					{invalidCode && (
						<p className="text-red-500">
							Invalid! Please enter the correct code.
						</p>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}
