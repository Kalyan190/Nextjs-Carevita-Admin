'use client'

import React, { useState } from 'react'
import { assets } from '@/assets/assets_admin/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { Loader } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { useAdminContext } from '@/context/AdminContext'

const AddDoctors = () => {
  const [docImg, setDocImg] = useState<File | false>(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General Physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [addresss2, setAddress2] = useState('')

  const { loading, setLoading } = useAppContext()
  const { backendUrl, aToken } = useAdminContext()

  const onSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setLoading(true)
      if (!docImg) return toast.error('Image Not Selected')

      const formData = new FormData()
      formData.append('image', docImg)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', Number(fees).toString())
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('address', JSON.stringify({ line1: address1, line2: addresss2 }))

      const { data } = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
        headers: { aToken },
      })

      if (data.success) {
        toast.success(data.message)
        setDocImg(false)
        setName('')
        setEmail('')
        setPassword('')
        setFees('')
        setAbout('')
        setAddress1('')
        setAddress2('')
        setDegree('')
        setExperience('1 Year')
        setSpeciality('General Physician')
      } else {
        toast.error(data.message)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.')
      console.log(error.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <Loader className="animate-spin text-primary w-12 h-12" />
        </div>
      )}

      <form onSubmit={onSubmitHandler} className={`p-5 w-full  ${loading ? 'opacity-45' : ''}`}>
        <p className="mb-5 text-2xl font-semibold text-gray-700">Add Doctor</p>

        <div className="bg-white shadow-md max-h-[500px] overflow-y-auto rounded-lg p-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-5 mb-8">
            <label htmlFor="doctor-image" className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border cursor-pointer group">
              <img
                src={docImg ? URL.createObjectURL(docImg) : assets.upload_area.src}
                alt="Upload"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                Click to Upload
              </div>
            </label>
            <input onChange={(e) => setDocImg(e.target.files?.[0] || false)} type="file" id="doctor-image" hidden />
            <p className="text-gray-600">Upload doctor's picture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" required className="w-full px-3 py-2 border rounded" placeholder="Doctor Name" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full px-3 py-2 border rounded" placeholder="Doctor Email" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full px-3 py-2 border rounded" placeholder="Password" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full px-3 py-2 border rounded">
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1}>{i + 1} Year</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fees</label>
              <input value={fees} onChange={(e) => setFees(e.target.value)} type="number" required className="w-full px-3 py-2 border rounded" placeholder="Consultation Fees" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Speciality</label>
              <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="General Physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Education</label>
              <input value={degree} onChange={(e) => setDegree(e.target.value)} type="text" required className="w-full px-3 py-2 border rounded" placeholder="Degree or Education" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address Line 1</label>
              <input value={address1} onChange={(e) => setAddress1(e.target.value)} type="text" required className="w-full px-3 py-2 border rounded" placeholder="Address Line 1" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address Line 2</label>
              <input value={addresss2} onChange={(e) => setAddress2(e.target.value)} type="text" required className="w-full px-3 py-2 border rounded" placeholder="Address Line 2" />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-1">About Doctor</label>
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded" placeholder="Write about the doctor..." required />
          </div>

          <div className="mt-8">
            <button type="submit" className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition-all duration-200">
              Add Doctor
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default AddDoctors
