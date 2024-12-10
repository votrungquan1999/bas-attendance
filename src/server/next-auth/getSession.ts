import { nextAuthOptions } from "./nextAuthOptions";
import { getServerSession } from "next-auth";

export default async function getSession() {
	return getServerSession(nextAuthOptions);
}
