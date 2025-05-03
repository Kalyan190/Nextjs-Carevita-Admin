"use client"

import { AdminContextProvider } from "./AdminContext"
import { AppContextProvider } from "./AppContext"
import { DoctorContextProvider } from "./DoctorContext"


export default function ContextProvider({ children }: { children: React.ReactNode }) {
    return (
        <AppContextProvider>
            <AdminContextProvider>
                <DoctorContextProvider>{children}</DoctorContextProvider>
            </AdminContextProvider>
        </AppContextProvider>
    )
}