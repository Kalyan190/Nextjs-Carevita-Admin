"use client"
import axios from "axios";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

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

interface ProfileData {
   // Add appropriate profile data interface properties
   // Add properties as needed
   [key: string]: any;
}

interface DoctorContextType {
   dToken: string | null;
   setDtoken: (token: string | null) => void;
   backendUrl: string;
   getAppointments: () => Promise<void>;
   appointments: Appointment[];
   setAppointments: (appointments: Appointment[]) => void;
   completeAppointment: (appointmentId: string) => Promise<void>;
   cancelAppointment: (appointmentId: string) => Promise<void>;
   setDashData: (data: DashData | undefined) => void;
   dashData: DashData | undefined;
   doctorDashboard: () => Promise<void>;
   profileData: ProfileData | undefined;
   setProfileData: (data: ProfileData | undefined) => void;
   getProfileData: () => Promise<void>;
   loading: boolean;
   setLoading: (loading: boolean) => void;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

interface DoctorContextProviderProps {
   children: ReactNode;
}

export const DoctorContextProvider = ({ children }: DoctorContextProviderProps) => {
   const [dToken, setDtoken] = useState<string | null>(null);
   const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
   const [appointments, setAppointments] = useState<Appointment[]>([]);
   const [dashData, setDashData] = useState<DashData | undefined>(undefined);
   const [profileData, setProfileData] = useState<ProfileData | undefined>(undefined);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      // Only access localStorage after component mounts (client-side)
      const token = localStorage.getItem('DToken');
      if (token) {
         setDtoken(token);
      }
   }, []);

   const handleSetToken = (token: string | null) => {
      setDtoken(token);
      if (token) {
         localStorage.setItem('DToken', token);
      } else {
         localStorage.removeItem('DToken');
      }
   };

   const getAppointments = async () => {
      try {
         setLoading(true);
         const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } });

         if (data.success) {
            setAppointments(data.appointments.reverse());
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

   const completeAppointment = async (appointmentId: string) => {
      try {
         setLoading(true);
         const { data } = await axios.post(
            backendUrl + '/api/doctor/appointment-complete',
            { appointmentId },
            { headers: { dToken } }
         );

         if (data.success) {
            toast.success(data.message);
            getAppointments();
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
            backendUrl + '/api/doctor/appointment-cancelled',
            { appointmentId },
            { headers: { dToken } }
         );

         if (data.success) {
            toast.success(data.message);
            getAppointments();
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

   const doctorDashboard = async () => {
      try {
         setLoading(true);
         const { data } = await axios.get(backendUrl + '/api/doctor/doctor-dashboard', { headers: { dToken } });

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

   const getProfileData = async () => {
      try {
         setLoading(true);
         const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } });

         if (data.success) {
            setProfileData(data.profileData);
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
      dToken,
      setDtoken: handleSetToken,
      backendUrl,
      getAppointments,
      appointments,
      setAppointments,
      completeAppointment,
      cancelAppointment,
      setDashData,
      dashData,
      doctorDashboard,
      profileData,
      setProfileData,
      getProfileData,
      loading,
      setLoading
   };

   return (
      <DoctorContext.Provider value={value}>
         {children}
      </DoctorContext.Provider>
   );
};

export const useDoctorContext = () => {
   const context = useContext(DoctorContext);
   if (context === undefined) {
      throw new Error('useDoctorContext must be used within a DoctorContextProvider');
   }
   return context;
};
