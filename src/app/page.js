"use client";
import AddOrderClient from "@/components/AddOrderClient";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'admin')) {
      router.push('/login'); // Redirect if not authenticated or not an admin
    }
  }, [status, session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  // if (!session || session.user.role !== "admin") {
  //   return null; // Prevent page from rendering if not an admin
  // }
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Add Order</h1>
        <AddOrderClient />
      </div>
    </div>
  );
}
