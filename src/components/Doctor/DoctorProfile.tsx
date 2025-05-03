'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useDoctorContext } from '@/context/DoctorContext';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Loader } from 'lucide-react';

const DoctorProfilePage = () => {
  const {
    profileData,
    setProfileData,
    dToken,
    getProfileData,
    backendUrl,
    loading,
    setLoading,
  } = useDoctorContext();

  const { currency } = useAppContext();
  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () => {
    try {
      setLoading(true);
      const updateData = {
        address: profileData?.address,
        fees: profileData?.fees,
        availability: profileData?.availability,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        updateData,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  if (!profileData) return null;

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
          <Loader className="animate-spin text-primary w-16 h-16" />
        </div>
      )}

      <div className={`${loading ? 'opacity-45' : ''}`}>
        <div className="flex flex-col gap-4 m-5">
          <div>
            <img
              className="bg-primary/80 w-full sm:max-w-64 sm:max-h-64 rounded-lg"
              src={profileData.image}
              alt="Doctor"
            />
          </div>

          <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
            <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
              {profileData.name}
            </p>

            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {profileData.degree} - {profileData.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {profileData.experience}
              </button>
            </div>

            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3">
                About:
              </p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">
                {profileData.about}
              </p>
            </div>

            <p className="text-gray-600 font-medium mt-4">
              Appointment fee: <span className="text-gray-800">{currency}</span>{' '}
              {isEdit ? (
                <input
                  type="number"
                  onChange={(e) =>
                    setProfileData((prev: any) => ({
                      ...prev,
                      fees: e.target.value,
                    }))
                  }
                  value={profileData.fees}
                />
              ) : (
                profileData.fees
              )}
            </p>

            <div className="flex gap-2 py-2">
              <p>Address:</p>
              <p className="text-sm">
                {isEdit ? (
                  <>
                    <input
                      type="text"
                      onChange={(e) =>
                        setProfileData((prev: any) => ({
                          ...prev,
                          address: { ...prev.address, line1: e.target.value },
                        }))
                      }
                      value={profileData.address.line1}
                    />
                    <br />
                    <input
                      type="text"
                      onChange={(e) =>
                        setProfileData((prev: any) => ({
                          ...prev,
                          address: { ...prev.address, line2: e.target.value },
                        }))
                      }
                      value={profileData.address.line2}
                    />
                  </>
                ) : (
                  <>
                    {profileData.address.line1}
                    <br />
                    {profileData.address.line2}
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-1 pt-2">
              <input
                onChange={() =>
                  isEdit &&
                  setProfileData((prev: any) => ({
                    ...prev,
                    availability: !prev.availability,
                  }))
                }
                checked={profileData.availability}
                type="checkbox"
                id="check"
              />
              <label htmlFor="check">Available</label>
            </div>

            {isEdit ? (
              <button
                onClick={updateProfile}
                className="px-4 py-1 border-primary border text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="px-4 py-1 border-primary border text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorProfilePage;
