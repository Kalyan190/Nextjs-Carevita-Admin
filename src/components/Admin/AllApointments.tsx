import React, { useEffect, useContext } from 'react';
import { assets } from '@/assets/assets_admin/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useAdminContext } from '@/context/AdminContext';

const AllAppointments = () => {
  const {
    aToken,
    appointments,
    getAllAppointments,
    cancelAppointment,
    loading,
  } = useAdminContext();

  const { calculateAge, slotDateFormat, currency } = useAppContext();

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
          <Loader className="animate-spin text-primary w-16 h-16" />
        </div>
      )}

      <div className={`w-full max-w-6xl m-5 ${loading ? 'opacity-45' : ''}`}>
        <p className="mb-3 text-lg font-medium">All Appointments</p>

        <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll min-h-[60vh]">
          <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b font-medium text-gray-700">
            <p>#</p>
            <p>Patient</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p>Doctor</p>
            <p>Fees</p>
            <p>Actions</p>
          </div>

          {appointments.map((item:any, index) => (
            <div
              key={item._id}
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50"
            >
              <p className="max-sm:hidden">{index + 1}</p>

              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full"
                  src={item.userData.image}
                  alt="User"
                />
                <p>{item.userData.name}</p>
              </div>

              <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>

              <p>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>

              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full bg-gray-200"
                  src={item.docData.image}
                  alt="Doctor"
                />
                <p>{item.docData.name}</p>
              </div>

              <p>
                {currency} {item.amount}
              </p>

              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isComplete ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel.src}
                  alt="Cancel"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AllAppointments;
