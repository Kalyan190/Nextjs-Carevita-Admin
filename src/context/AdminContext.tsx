"use client"
import axios from "axios";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Doctor {
   // Add appropriate doctor interface properties
   [key: string]: any;
   // Add other doctor properties as needed
}

interface Appointment {
   // Add appropriate appointment interface properties
   [key: string]: any;
   // Add other appointment properties as needed
}

interface DashData {
   [key: string]: any;
   // Add appropriate dashboard data interface properties
   // Add properties as needed
}

interface AdminContextType {
   aToken: string | null;
   setAToken: (token: string | null) => void;
   backendUrl: string;
   doctors: Doctor[];
   getAllDoctors: () => Promise<void>;
   changeAvailability: (docId: string) => Promise<void>;
   appointments: Appointment[];
   setAppointments: (appointments: Appointment[]) => void;
   getAllAppointments: () => Promise<void>;
   cancelAppointment: (appointmentId: string) => Promise<void>;
   dashData: DashData | any;
   getDashData: () => Promise<void>;
   loading: boolean;
   setLoading: (loading: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminContextProviderProps {
   children: ReactNode;
}

export const AdminContextProvider = ({ children }: AdminContextProviderProps) => {
   const [aToken, setAToken] = useState<string | null>(null);
   const [doctors, setDoctors] = useState<Doctor[]>([]);
   const [appointments, setAppointments] = useState<Appointment[]>([]);
   const [dashData, setDashData] = useState<DashData | false>(false);
   const [loading, setLoading] = useState(false);

   const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

   useEffect(() => {
      // Only access localStorage after component mounts (client-side)
      const token = localStorage.getItem('AToken');
      if (token) {
         setAToken(token);
      }
   }, []);

   const handleSetToken = (token: string | null) => {
      setAToken(token);
      if (token) {
         localStorage.setItem('AToken', token);
      } else {
         localStorage.removeItem('AToken');
      }
   };

   const getAllDoctors = async () => {
      try {
         setLoading(true);
         const { data } = await axios.post(backendUrl + '/api/admin/all-doctors', {}, { headers: { aToken } });

         if (data.success) {
            setDoctors(data.doctors);
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || error.message);
         } else {
            toast.error('An unexpected error occurred');
         }
      } finally {
         setLoading(false);
      }
   };

   const changeAvailability = async (docId: string) => {
      try {
         setLoading(true);
         const { data } = await axios.post(
            backendUrl + '/api/admin/change-availability',
            { docId },
            { headers: { aToken } }
         );

         if (data.success) {
            toast.success(data.message);
            getAllDoctors();
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || error.message);
         } else {
            toast.error('An unexpected error occurred');
         }
      } finally {
         setLoading(false);
      }
   };

   const getAllAppointments = async () => {
      try {
         setLoading(true);
         const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } });

         if (data.success) {
            setAppointments(data.appointment);
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || error.message);
         } else {
            toast.error('An unexpected error occurred');
         }
      } finally {
         setLoading(false);
      }
   };

   const cancelAppointment = async (appointmentId: string) => {
      try {
         setLoading(true);
         const { data } = await axios.post(
            backendUrl + '/api/admin/cancel-appointment',
            { appointmentId },
            { headers: { aToken } }
         );

         if (data.success) {
            toast.success(data.message);
            getAllAppointments();
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || error.message);
         } else {
            toast.error('An unexpected error occurred');
         }
      } finally {
         setLoading(false);
      }
   };

   const getDashData = async () => {
      try {
         setLoading(true);
         const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } });

         if (data.success) {
            setDashData(data.dashData);
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || error.message);
         } else {
            toast.error('An unexpected error occurred');
         }
      } finally {
         setLoading(false);
      }
   };

   const value = {
      aToken,
      setAToken: handleSetToken,
      backendUrl,
      doctors,
      getAllDoctors,
      changeAvailability,
      appointments,
      setAppointments,
      getAllAppointments,
      cancelAppointment,
      dashData,
      getDashData,
      loading,
      setLoading
   };

   return (
      <AdminContext.Provider value={value}>
         {children}
      </AdminContext.Provider>
   );
};

export const useAdminContext = () => {
   const context = useContext(AdminContext);
   if (context === undefined) {
      throw new Error('useAdminContext must be used within an AdminContextProvider');
   }
   return context;
};

export default AdminContextProvider;
