"use client";

import AdminDashboard from "@/components/Admin/Dashboard";
import DoctorDashboard from "@/components/Doctor/DoctorDashboard";
import { useAdminContext } from "@/context/AdminContext";
import { useDoctorContext } from "@/context/DoctorContext";

export default function DashboardPage() {
    const adminContext = useAdminContext();
    const doctorContext = useDoctorContext();

    if (!adminContext || !doctorContext) {
        return null;
    }

    const { aToken } = adminContext;
    const { dToken } = doctorContext;

    if (aToken) {
        return <AdminDashboard />
    }

    if (dToken) {
        return <DoctorDashboard />
    }

    return null; // Will be redirected by middleware
} 