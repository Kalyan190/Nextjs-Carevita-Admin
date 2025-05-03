"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAdminContext } from "@/context/AdminContext";
import { useDoctorContext } from "@/context/DoctorContext";
import { useContext } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const adminContext = useAdminContext();
    const doctorContext = useDoctorContext();

    if (!adminContext || !doctorContext) {
        return null;
    }

    const { aToken } = adminContext;
    const { dToken } = doctorContext;

    if (!aToken && !dToken) {
        return null; // Will be redirected by middleware
    }

    return (
        <div className="bg-[#F8F9FD] max-h-dvh">
            <Navbar />
            <div className="flex items-start h-[calc(100vh-60px)] overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-6 h-full w-[calc(100dvw-288px)] overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
} 