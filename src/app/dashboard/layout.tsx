import Bottombar from "@/components/Bottombar";
import DashboardNavbar from "@/components/DashboardNavbar";
import LogoutModal from "@/components/modals/LogoutModal";
import MainModal from "@/components/modals/MainModal";
import PaymentModal from "@/components/modals/PaymentModal";
import Sidebar from "@/components/Sidebar";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <Bottombar />

      <main className="w-full md:ml-72 flex flex-1 flex-col overflow-hidden">
        <DashboardNavbar />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
      <LogoutModal />
      <MainModal />
      <PaymentModal />
    </div>
  );
};

export default DashboardLayout;
