import React, { useEffect } from 'react';
import { assets } from '@/assets/assets_admin/assets';
import { Loader } from 'lucide-react';
import { useAdminContext } from '@/context/AdminContext';
import { useAppContext } from '@/context/AppContext';

const AdminDashboard = () => {
  const {
    aToken,
    getDashData,
    cancelAppointment,
    dashData,
    loading,
  } = useAdminContext();

  const { slotDateFormat } = useAppContext();

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
          <Loader className="animate-spin text-primary w-16 h-16" />
        </div>
      )}

      {dashData && (
        <div className={`m-5 ${loading ? 'opacity-45' : ''}`}>
          <div className="flex flex-wrap gap-3">
            {/* Doctors */}
            <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
              <img className="w-14" src={assets.doctor_icon.src} alt="doctor" />
              <div>
                <p className="text-xl font-semibold text-gray-600">{dashData.doctors}</p>
                <p className="text-gray-400">Doctors</p>
              </div>
            </div>

            {/* Appointments */}
            <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
              <img className="w-14" src={assets.appointments_icon.src} alt="appointments" />
              <div>
                <p className="text-xl font-semibold text-gray-600">{dashData.appointments}</p>
                <p className="text-gray-400">Appointments</p>
              </div>
            </div>

            {/* Patients */}
            <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
              <img className="w-14" src={assets.patients_icon.src} alt="patients" />
              <div>
                <p className="text-xl font-semibold text-gray-600">{dashData.patient}</p>
                <p className="text-gray-400">Patients</p>
              </div>
            </div>
          </div>

          {/* Latest Bookings */}
          <div className="bg-white">
            <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
              <img src={assets.list_icon.src} alt="list" />
              <p className="font-semibold">Latest Bookings</p>
            </div>

            <div className="pt-4 border border-t-0">
              {dashData &&dashData.latestAppointments.map((item:any, index:number) => (
                <div
                  className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
                  key={item._id}
                >
                  <p className="max-sm:hidden">{index + 1}</p>
                  <img
                    className="w-10 h-10 rounded-full bg-gray-200"
                    src={item.docData.image}
                    alt="profile_pic"
                  />
                  <div className="flex-1 text-sm">
                    <p className="text-gray-800 font-medium">{item.docData.name}</p>
                    <p className="text-gray-600">{slotDateFormat(item.slotDate)}</p>
                  </div>

                  {item.cancelled ? (
                    <p className="text-red-400 text-xs font-medium">Cancelled</p>
                  ) : item.isComplete ? (
                    <p className="text-green-500 text-xs font-medium">Completed</p>
                  ) : (
                    <img
                      onClick={() => cancelAppointment(item._id)}
                      className="w-10 cursor-pointer"
                      src={assets.cancel.src}
                      alt="cancel"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
