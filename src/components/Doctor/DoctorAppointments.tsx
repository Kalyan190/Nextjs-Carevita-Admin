import React, { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useDoctorContext } from '@/context/DoctorContext';
import { useAppContext } from '@/context/AppContext';
import { assets } from '@/assets/assets_admin/assets';

const DoctorAppointments = () => {
  const {
    dToken,
    getAppointments,
    appointments,
    completeAppointment,
    cancelAppointment,
    loading,
  } = useDoctorContext();

  const { calculateAge, slotDateFormat, currency } = useAppContext();

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  return (
    <>
      

      <div className={`w-full max-w-6xl m-5 ${loading ? 'opacity-45' : ''}`}>
        <p className="mb-3 text-lg font-medium">All Appointments</p>

        <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll min-h-[60vh]">
              {loading && (
                 <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-85 z-50">
                    <Loader className="animate-spin text-blue-600 w-16 h-16" />
                 </div>
              )}
          <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] py-3 px-6 border-b">
            <p>#</p>
            <p>Patient</p>
            <p>Payment</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p>Fees</p>
            <p>Actions</p>
          </div>

          {appointments.map((item:any, index) => (
            <div
              key={item._id || index}
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            >
              <p className="max-sm:hidden">{index + 1}</p>

              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full"
                  src={item.userData.image}
                  alt="profile_pic"
                />
                <p>{item.userData.name}</p>
              </div>

              <div>
                <p className="text-xs inline border border-primary px-2 rounded-full">
                  {item.payment ? 'Online' : 'CASH'}
                </p>
              </div>

              <p className="max-sm:hidden">
                {isNaN(calculateAge(item.userData.dob))
                  ? 18
                  : calculateAge(item.userData.dob)}
              </p>

              <p>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>

              <p>
                {currency} {item.amount}
              </p>

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
                    alt="cancel"
                  />
                  <img
                    onClick={() => completeAppointment(item._id)}
                    className="w-10 cursor-pointer"
                    src={assets.tick_icon}
                    alt="complete"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DoctorAppointments;
