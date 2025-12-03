import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function HistoryLayout({ children }: any) {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Sidebar />
      <Header session={session} />
      <main className="ml-64 pt-20">{children}</main>
    </>
  );
}
