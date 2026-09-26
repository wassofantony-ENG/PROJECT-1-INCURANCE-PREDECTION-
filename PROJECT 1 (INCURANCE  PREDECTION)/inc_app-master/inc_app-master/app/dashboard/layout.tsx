"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo } from "@/lib/getUserInfo";
import { UserInfo } from "@/types/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { AddClientForm } from "@/components/add-client-form";
import { UploadClientsForm } from "@/components/upload-clients-form";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  useEffect(() => {
    const token = window.localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    getUserInfo()
      .then(setUser)
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DashboardSidebar
        username={user.username}
        email={user.email}
        onAddClient={() => setShowAddClient(true)}
        onUploadClients={() => setShowUpload(true)}
      />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      {showAddClient && <AddClientForm onClose={() => setShowAddClient(false)} />}
      {showUpload && <UploadClientsForm onClose={() => setShowUpload(false)} />}
    </div>
  );
}
