"use client";

import { useAdminContext } from '@/context/AdminContext';
import { useDoctorContext } from '@/context/DoctorContext';
import { assets } from '@/assets/assets_admin/assets';
import Link from 'next/link';
import { usePathname } from 'next/navigation'

const Sidebar = () => {
    const pathname = usePathname();
    const adminContext = useAdminContext();
    const doctorContext = useDoctorContext();

    if (!adminContext || !doctorContext) {
        return null;
    }

    const { aToken } = adminContext;
    const { dToken } = doctorContext;

    const isActive = (path: string) => pathname === path;

    return (
        <div className='min-h-screen bg-white border-r'>
            {aToken && (
                <ul className='text-[#515151] mt-5'>
                    <Link 
                        href='/dashboard' 
                        className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive('/dashboard') ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    >
                        <img src={assets.home_icon.src} alt="" />
                        <p className='hidden md:block'>Dashboard</p>
                    </Link>
                    <Link 
                        href='/dashboard/all-appointments'
                        className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive('/dashboard/all-appointments') ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    >
                        <img src={assets.appointment_icon.src} alt="" />
                        <p className='hidden md:block'>Appointments</p>
                    </Link>
                    <Link 
                        href='/dashboard/add-doctor'
                        className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive('/dashboard/add-doctor') ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    >
                        <img src={assets.add_icon.src} alt="error" />
                        <p className='hidden md:block'>Add Doctor</p>
                    </Link>
                    <Link 
                        href='/dashboard/doctor-list'
                        className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive('/dashboard/doctor-list') ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    >
                        <img src={assets.people_icon.src} alt="" />
                        <p className='hidden md:block'>Doctors List</p>
                    </Link>
                </ul>
            )}
            {dToken && (
                <ul className='text-[#515151] mt-5'>
                    <Link 
                        href='/dashboard'
                        className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive('/dashboard') ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    >
                        <img src={assets.home_icon.src} alt="" />
                        <p className='hidden md:block'>Dashboard</p>
                    </Link>
                    <Link 
                        href='/dashboard/doctor-appointments'
                        className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive('/dashboard/doctor-appointments') ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    >
                        <img src={assets.appointment_icon.src} alt="" />
                        <p className='hidden md:block'>Appointments</p>
                    </Link>
                    <Link 
                        href='/dashboard/doctor-profile'
                        className={`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive('/dashboard/doctor-profile') ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    >
                        <img src={assets.people_icon.src} alt="error" />
                        <p className='hidden md:block'>Profile</p>
                    </Link>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;
