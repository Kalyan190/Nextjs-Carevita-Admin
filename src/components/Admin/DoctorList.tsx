import React, { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useAdminContext } from '@/context/AdminContext';

const DoctorList = () => {
  const {
    doctors,
    aToken,
    getAllDoctors,
    changeAvailability,
    loading,
  } = useAdminContext();

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
          <Loader className="animate-spin text-primary w-16 h-16" />
        </div>
      )}

      <div className={`p-5 w-full ${loading ? 'opacity-45' : ''}`}>
        <h1 className="text-lg font-medium">All Doctors</h1>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-5 gap-y-6">
          {doctors && doctors.map((item:any, index:number) => (
            <div
              key={item._id || index}
              className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            >
              <img
                className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
                src={item.image}
                alt={`${item.name}_profile`}
              />
              <div className="p-4">
                <p className="text-neutral-800 text-lg font-medium">{item.name}</p>
                <p className="text-zinc-600 text-sm">{item.speciality}</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <input
                    onChange={() => changeAvailability(item._id)}
                    type="checkbox"
                    checked={item.availability}
                  />
                  <p>Available</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DoctorList;
