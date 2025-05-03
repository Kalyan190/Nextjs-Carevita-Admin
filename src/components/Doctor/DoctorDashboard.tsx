'use client';

import React, { useEffect } from 'react';
import { useDoctorContext } from '@/context/DoctorContext';
import { assets } from '@/assets/assets_admin/assets';
import { useAppContext } from '@/context/AppContext';
import { Loader } from 'lucide-react';

const DoctorDashboard = () => {
  const {
    dashData,
    doctorDashboard,
    dToken,
    completeAppointment,
    cancelAppointment,
    loading,
   } = useDoctorContext();
  const { currency, slotDateFormat } = useAppContext();

  useEffect(() => {
    if (dToken) {
      doctorDashboard();
    }
  }, [dToken]);

  if (!dashData) {
    return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-85 z-50">
              <Loader className="animate-spin text-blue-600 w-16 h-16" />
            </div>
          )
  }

  return (
    <>
      

      <div className={`m-5 ${loading ? 'opacity-45' : ''}`}>
           {loading && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-85 z-50">
                 <Loader className="animate-spin text-blue-600 w-16 h-16" />
              </div>
           )}
        <div className="flex flex-wrap gap-3">
          {/* Earnings */}
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.earning_icon.src} alt="Earnings" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {currency} {dashData.earning}
              </p>
              <p className="text-gray-400">Earnings</p>
            </div>
          </div>

          {/* Appointments */}
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.appointments_icon.src} alt="Appointments" />
            <div>
              <p className="text-xl font-semibold text-gray-600">{dashData.appointments}</p>
              <p className="text-gray-400">Appointments</p>
            </div>
          </div>

          {/* Patients */}
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.patients_icon.src} alt="Patients" />
            <div>
              <p className="text-xl font-semibold text-gray-600">{dashData.patients}</p>
              <p className="text-gray-400">Patients</p>
            </div>
          </div>
        </div>

        {/* Latest Bookings */}
        <div className="bg-white mt-10 rounded border">
          <div className="flex items-center gap-2.5 px-4 py-4 rounded-t border-b">
            <img src={assets.list_icon.src} alt="Bookings List" />
            <p className="font-semibold">Latest Bookings</p>
          </div>
          <div className="pt-4">
            {dashData.latestAppointments?.length > 0 ? (
              dashData.latestAppointments.map((item: any, index: number) => (
                <div className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100" key={index}>
                  <p className="max-sm:hidden">{index + 1}</p>
                  <img
                    className="w-10 h-10 rounded-full bg-gray-200"
                    src={item.userData.image || 'default-image-url'}
                    alt="Profile"
                  />
                  <div className="flex-1 text-sm">
                    <p className="text-gray-800 font-medium">{item.userData.name}</p>
                    <p className="text-gray-600">{slotDateFormat(item.slotDate)}</p>
                  </div>
                  {item.cancelled ? (
                    <p className="text-red-400 text-xs font-medium">Cancelled</p>
                  ) : item.isComplete ? (
                    <p className="text-green-500 text-xs font-medium">Completed</p>
                  ) : (
                    <div className="flex">
                      <img
                        onClick={() => cancelAppointment(item._id)}
                        className="w-10 cursor-pointer"
                        src={assets.cancel.src}
                        alt="Cancel"
                      />
                      <img
                        onClick={() => completeAppointment(item._id)}
                        className="w-10 cursor-pointer"
                        src={assets.tick_icon.src}
                        alt="Complete"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No bookings available.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
