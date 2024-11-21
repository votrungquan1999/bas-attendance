import Link from "next/link";

export default function Footer() {
	return (
		<footer className="bg-gray-800 text-white py-2 text-sm md:text-base">
			<div className="container mx-auto flex flex-col md:flex-row justify-center items-center gap-1 md:gap-2 px-4">
				<p className="whitespace-nowrap">Made with ❤️ by Quan Vo</p>

				<span className="hidden md:inline">•</span>

				<Link
					href="/admin"
					className="hidden md:inline text-red-300 hover:text-red-200 font-semibold transition-colors"
				>
					⚡ Admin View
				</Link>
			</div>
		</footer>
	);
}
