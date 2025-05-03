"use client";

import { useAdminContext } from '@/context/AdminContext';
import { useAppContext } from '@/context/AppContext';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const router = useRouter();
    const { setAToken, backendUrl } = useAdminContext();
    const { loading, setLoading } = useAppContext();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmitHandler = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setLoading(true);
            const { data } = await axios.post(backendUrl + '/api/admin/login', {
                email,
                password
            });

            if (data.success) {
                setAToken(data.token);
                toast.success(data.message);
                router.push('/dashboard');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
                    <Loader className="animate-spin text-primary w-16 h-16" />
                </div>
            )}

            <div className={`flex mx-16 my-10 max-sm:mx-auto ${loading ? 'opacity-45' : ''}`}>
                <div className='flex w-full'>
                    <div className='hidden lg:flex h-[80vh] w-1/2 items-center justify-center relative'>
                        <DotLottieReact
                            src="https://lottie.host/298372bb-21da-4d35-afb2-e88e94606887/iMeptCpU8z.lottie"
                            loop
                            autoplay
                        />
                    </div>
                    <form onSubmit={onSubmitHandler} className='w-full flex items-center justify-center lg:w-1/2'>
                        <div className='w-11/12 max-w-[600px] px-10 py-3 max-sm:px-4 rounded-3xl bg-white border-2 border-gray-100 max-sm:text-center'>
                            <h1 className='text-4xl max-sm:text-3xl font-semibold'>
                                Welcome Back <span>Admin</span>
                            </h1>
                            <p className='font-medium text-lg text-gray-500 mt-4'>
                                Welcome back! Please enter your details.
                            </p>
                            <div className='mt-4 max-sm:text-left'>
                                <div className='flex flex-col'>
                                    <label className='text-lg font-medium' htmlFor='email'>
                                        Email
                                    </label>
                                    <input
                                        className='w-full border-2 border-gray-100 rounded-xl p-2 mt-1 bg-transparent'
                                        placeholder="Enter your email"
                                        type='email'
                                        id='email'
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                        required
                                    />
                                </div>
                                <div className='flex flex-col mt-4'>
                                    <label className='text-lg font-medium' htmlFor='password'>
                                        Password
                                    </label>
                                    <input
                                        className='w-full border-2 border-gray-100 rounded-xl p-2 mt-1 bg-transparent'
                                        placeholder="Enter your password"
                                        type='password'
                                        id='password'
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                        required
                                    />
                                </div>
                                <div className='mt-4 flex justify-between items-center max-sm:flex-col'>
                                    <div>
                                        <input type="checkbox" id='remember' />
                                        <label className='ml-2 font-medium text-base' htmlFor="remember">
                                            Remember for 30 days
                                        </label>
                                    </div>
                                    <button type="button" className='font-medium text-base text-violet-500'>
                                        Forgot password
                                    </button>
                                </div>
                                <div className='mt-4 flex flex-col gap-y-4'>
                                    <button
                                        type="submit"
                                        className='active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01] ease-in-out transform py-2 bg-violet-500 rounded-xl text-white font-bold text-lg'
                                    >
                                        Login
                                    </button>
                                </div>
                                <div className='mt-4 flex justify-center items-center'>
                                    <p className='font-medium text-base'>Doctor Account Login ?</p>
                                    <button
                                        type="button"
                                        className='ml-2 font-medium text-base text-violet-500 hover:text-violet-700'
                                        onClick={() => router.push('/')}
                                    >
                                        Click here
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
