"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
              <h1 className="text-4xl md:text-5xl font-bold text-center">Welcome to <br />
                 <span className='font-bold text-5xl md:text-6xl'>
                    <span className='bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent'>Care</span>
                    <span className='text-foreground'>Vita</span>
                 </span>
              </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to continue
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center items-center">
            <Link href="/admin-login">
                    <Button className="md:text-base cursor-pointer" >Admin Login</Button>
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Link href="/doctor-login">
                    <Button variant={'outline'} className="md:text-base hover:text-blue-600 cursor-pointer">Doctor Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
