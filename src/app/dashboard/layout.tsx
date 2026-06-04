import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { ReactNode } from "react";

export const metadata = {
    title: 'Seller Dashboard - Belio',
    description: 'Kelola toko Anda di Belio',
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans flex text-[#333333]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <main className="flex-1 p-8 overflow-x-hidden overflow-y-auto">
                    <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
