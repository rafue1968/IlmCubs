import { redirect } from "next/navigation";
import { getAuthSession } from "../lib/auth-session";
import ConnectClient from "./ConnectClient";

export default async function ConnectPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return <ConnectClient />;
}