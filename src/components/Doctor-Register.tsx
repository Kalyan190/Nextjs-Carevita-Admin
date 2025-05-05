"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Upload, CheckCircle2, AlertCircle } from "lucide-react"
import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectLabel,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useDoctorContext } from '@/context/DoctorContext';
import { useAppContext } from "@/context/AppContext"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader } from 'lucide-react'
import Link from "next/link"

type Address = {
   street: string
   city: string
   state: string
   pincode: string
}

type FormErrors = {
   [key: string]: string
}

export default function DoctorRegisterForm() {
   const router = useRouter();
   const doctorContext = useDoctorContext();
   const appContext = useAppContext();
   if (!doctorContext || !appContext) {
      return null;
   }
   const { backendUrl } = doctorContext;
   const { loading, setLoading } = appContext;

   const [step, setStep] = useState(1)
   const [progress, setProgress] = useState(20)
   const [showPassword, setShowPassword] = useState(false)
   const [errors, setErrors] = useState<FormErrors>({})

   const togglePassword = () => setShowPassword((prev) => !prev)

   const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      speciality: "",
      degree: "",
      college: "",
      passingYear: "",
      experience: "",
      about: "",
      fees: "",
      address: {
         street: "",
         city: "",
         state: "",
         pincode: "",
      } as Address,
      image: null as File | null,
      certificates: [] as File[],
   })

   useEffect(() => {
      setProgress(step * 20)
   }, [step])

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      if (name.startsWith("address.")) {
         const field = name.split(".")[1]
         setFormData((prev) => ({
            ...prev,
            address: {
               ...prev.address,
               [field]: value,
            },
         }))
      } else {
         setFormData((prev) => ({
            ...prev,
            [name]: value,
         }))
      }

      // Clear error when field is updated
      if (errors[name]) {
         setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[name]
            return newErrors
         })
      }
   }

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, files } = e.target
      if (name === "image" && files?.[0]) {
         setFormData((prev) => ({ ...prev, image: files[0] }))
      } else if (name === "certificates" && files) {
         setFormData((prev) => ({ ...prev, certificates: Array.from(files) }))
      }
   }

   const validateStep = (currentStep: number): boolean => {
      const newErrors: FormErrors = {}

      if (currentStep === 1) {
         if (!formData.name.trim()) newErrors.name = "Name is required"
         if (!formData.email.trim()) {
            newErrors.email = "Email is required"
         } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Invalid email format"
         }
         if (!formData.password) {
            newErrors.password = "Password is required"
         } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters"
         }
      } else if (currentStep === 2) {
         if (!formData.degree.trim()) newErrors.degree = "Degree is required"
         if (!formData.college.trim()) newErrors.college = "College is required"
         if (!formData.passingYear.trim()) newErrors.passingYear = "Passing year is required"
      } else if (currentStep === 3) {
         if (!formData.speciality) newErrors.speciality = "Speciality is required"
         if (!formData.experience.trim()) newErrors.experience = "Experience is required"
         if (!formData.about.trim()) newErrors.about = "About is required"
         if (!formData.fees.trim()) newErrors.fees = "Fees is required"
      } else if (currentStep === 4) {
         if (!formData.address.street.trim()) newErrors["address.street"] = "Street is required"
         if (!formData.address.city.trim()) newErrors["address.city"] = "City is required"
         if (!formData.address.state.trim()) newErrors["address.state"] = "State is required"
         if (!formData.address.pincode.trim()) newErrors["address.pincode"] = "Pincode is required"
      } else if (currentStep === 5) {
         if (!formData.image) newErrors.image = "Profile image is required"
         if (formData.certificates.length === 0) newErrors.certificates = "At least one certificate is required"
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
   }

   const nextStep = () => {
      if (validateStep(step)) {
         setStep((prev) => prev + 1)
      }
   }

   const prevStep = () => setStep((prev) => prev - 1)

   const handleSubmit = async () => {
      if (!validateStep(step)) return

      const form = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
         if (key === "address") {
            form.append("address", JSON.stringify(value))
         } else if (key === "certificates") {
            ; (value as File[]).forEach((file) => form.append("certificates", file))
         } else if (key === "image" && value instanceof File) {
            form.append("image", value)
         } else {
            form.append(key, value as string)
         }
      })
      
      try {
        
         setLoading(true)
         const {data } = await axios.post(backendUrl + '/api/doctor/register',
             form , 
            {
               headers: {
                  "Content-Type": "multipart/form-data"
               }
            }
         );

         
         if (data.success) {
            toast.success(data.message)
            router.push('/doctor-login')
         } else {
            toast.error(data.message)
         }
      } catch (error : any) {
         console.error("Error in form submission:", error)
         const errorMessage = error?.response?.data?.message || "Something went wrong. Please try again."
         toast.error(errorMessage)
      } finally {
         setLoading(false)
      }
   }

   const renderStepIndicator = () => {
      return (
         <div className="mb-8">
            {loading && (
               <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
                  <Loader className="animate-spin text-violet-600 w-12 h-12" />
               </div>
            )}
            <div className="flex justify-between mb-2">
               {[1, 2, 3, 4, 5].map((stepNumber) => (
                  <div
                     key={stepNumber}
                     className={`flex flex-col items-center ${stepNumber <= step ? "text-primary" : "text-muted-foreground"}`}
                  >
                     <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                  ${stepNumber < step
                              ? "bg-primary text-white"
                              : stepNumber === step
                                 ? "border-2 border-primary"
                                 : "border-2 border-muted"
                           }`}
                     >
                        {stepNumber < step ? <CheckCircle2 size={16} /> : stepNumber}
                     </div>
                     <span className="text-xs hidden sm:block">
                        {stepNumber === 1
                           ? "Personal"
                           : stepNumber === 2
                              ? "Education"
                              : stepNumber === 3
                                 ? "Professional"
                                 : stepNumber === 4
                                    ? "Address"
                                    : "Documents"}
                     </span>
                  </div>
               ))}
            </div>
            <Progress value={progress} className="h-2" />
         </div>
      )
   }

   const renderFormField = (
      label: string,
      name: string,
      type = "text",
      placeholder = "",
      value = "",
      isRequired = true,
   ) => {
      const errorKey = name
      return (
         <div className="space-y-1.5">
            <Label htmlFor={name}>
               {label} {isRequired && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
               <Input
                  id={name}
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={handleChange}
                  className={errors[errorKey] ? "border-destructive" : ""}
               />
            </div>
            {errors[errorKey] && (
               <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                  <AlertCircle size={14} /> {errors[errorKey]}
               </p>
            )}
         </div>
      )
   }

   return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
         <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center mb-8">
               <a href="/" className="flex items-center text-2xl font-semibold text-gray-900">
                  <span className="font-bold text-4xl md:text-5xl">
                     <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Care</span>
                     <span className="text-foreground">Vita</span>
                  </span>
               </a>
               <h2 className="text-2xl font-bold text-center mt-4">Doctor Registration</h2>
               <p className="text-muted-foreground mt-2">Complete all steps to submit your application</p>
            </div>

            <Card className="shadow-lg border-0">
               <CardContent className="p-6 sm:p-8">
                  {renderStepIndicator()}

                  {step === 1 && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Personal Information</h3>
                        <p className="text-muted-foreground text-sm mb-4">Please provide your basic information</p>

                        {renderFormField("Full Name", "name", "text", "Dr. John Doe", formData.name)}
                        {renderFormField("Email Address", "email", "email", "doctor@example.com", formData.email)}

                        <div className="space-y-1.5">
                           <Label htmlFor="password">
                              Password <span className="text-destructive">*</span>
                           </Label>
                           <div className="relative">
                              <Input
                                 id="password"
                                 name="password"
                                 type={showPassword ? "text" : "password"}
                                 placeholder="••••••••"
                                 value={formData.password}
                                 onChange={handleChange}
                                 className={errors.password ? "border-destructive" : ""}
                              />
                              <button
                                 type="button"
                                 className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                                 onClick={togglePassword}
                              >
                                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                           </div>
                           {errors.password && (
                              <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                                 <AlertCircle size={14} /> {errors.password}
                              </p>
                           )}
                        </div>
                     </div>
                  )}

                  {step === 2 && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Education Details</h3>
                        <p className="text-muted-foreground text-sm mb-4">Tell us about your educational background</p>

                        {renderFormField("Degree", "degree", "text", "MBBS, MD, etc.", formData.degree)}
                        {renderFormField("College/University", "college", "text", "Medical College Name", formData.college)}
                        {renderFormField("Passing Year", "passingYear", "number", "2020", formData.passingYear)}
                     </div>
                  )}

                  {step === 3 && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Professional Information</h3>
                        <p className="text-muted-foreground text-sm mb-4">Share your professional expertise</p>

                        <div className="space-y-1.5">
                           <Label htmlFor="speciality">
                              Speciality <span className="text-destructive">*</span>
                           </Label>
                           <Select
                              value={formData.speciality}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, speciality: value }))}
                           >
                              <SelectTrigger className={`w-full ${errors.speciality ? "border-destructive" : ""}`}>
                                 <SelectValue placeholder="Select your speciality" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectGroup>
                                    <SelectLabel>Medical Specialities</SelectLabel>
                                    <SelectItem value="General Physician">General Physician</SelectItem>
                                    <SelectItem value="Gynecologist">Gynecologist</SelectItem>
                                    <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                                    <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                                    <SelectItem value="Neurologist">Neurologist</SelectItem>
                                    <SelectItem value="Gastroenterologist">Gastroenterologist</SelectItem>
                                    <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                                    <SelectItem value="Orthopedist">Orthopedist</SelectItem>
                                    <SelectItem value="ENT Specialist">ENT Specialist</SelectItem>
                                    <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                                 </SelectGroup>
                              </SelectContent>
                           </Select>
                           {errors.speciality && (
                              <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                                 <AlertCircle size={14} /> {errors.speciality}
                              </p>
                           )}
                        </div>

                        {renderFormField("Years of Experience", "experience", "text", "5+ years", formData.experience)}

                        <div className="space-y-1.5">
                           <Label htmlFor="about">
                              About <span className="text-destructive">*</span>
                           </Label>
                           <Textarea
                              id="about"
                              name="about"
                              placeholder="Share your professional background, expertise, and approach to patient care..."
                              value={formData.about}
                              onChange={handleChange}
                              className={`min-h-[120px] ${errors.about ? "border-destructive" : ""}`}
                           />
                           {errors.about && (
                              <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                                 <AlertCircle size={14} /> {errors.about}
                              </p>
                           )}
                        </div>

                        {renderFormField("Consultation Fees (₹)", "fees", "number", "500", formData.fees)}
                     </div>
                  )}

                  {step === 4 && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Address Information</h3>
                        <p className="text-muted-foreground text-sm mb-4">Where are you located?</p>

                        {renderFormField(
                           "Street Address",
                           "address.street",
                           "text",
                           "123 Medical Plaza",
                           formData.address.street,
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {renderFormField("City", "address.city", "text", "Mumbai", formData.address.city)}
                           {renderFormField("State", "address.state", "text", "Maharashtra", formData.address.state)}
                        </div>

                        {renderFormField("Pincode", "address.pincode", "text", "400001", formData.address.pincode)}
                     </div>
                  )}

                  {step === 5 && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Documents & Verification</h3>
                        <p className="text-muted-foreground text-sm mb-4">Upload your profile photo and certificates</p>

                        <div className="space-y-1.5">
                           <Label htmlFor="image">
                              Profile Photo <span className="text-destructive">*</span>
                           </Label>
                           <div className="flex items-center gap-4">
                              <div
                                 className={`border-2 border-dashed rounded-lg p-4 cursor-pointer ${errors.image ? "border-destructive" : "border-muted-foreground/25"}`}
                                 onClick={() => document.getElementById("image")?.click()}
                              >
                                 <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Click to upload</span>
                                 </div>
                                 <Input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                 />
                              </div>

                              {formData.image && (
                                 <div className="flex-1">
                                    <Badge variant="outline" className="bg-primary/10 text-primary">
                                       {formData.image.name}
                                    </Badge>
                                    <div className="mt-2">
                                       <img
                                          src={URL.createObjectURL(formData.image) || "/placeholder.svg"}
                                          alt="Profile Preview"
                                          className="w-20 h-20 object-cover rounded-md border"
                                       />
                                    </div>
                                 </div>
                              )}
                           </div>
                           {errors.image && (
                              <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                                 <AlertCircle size={14} /> {errors.image}
                              </p>
                           )}
                        </div>

                        <div className="space-y-1.5">
                           <Label htmlFor="certificates">
                              Medical Certificates <span className="text-destructive">*</span>
                           </Label>
                           <div
                              className={`border-2 border-dashed rounded-lg p-4 cursor-pointer ${errors.certificates ? "border-destructive" : "border-muted-foreground/25"}`}
                              onClick={() => document.getElementById("certificates")?.click()}
                           >
                              <div className="flex flex-col items-center gap-2">
                                 <Upload className="h-8 w-8 text-muted-foreground" />
                                 <span className="text-sm text-muted-foreground">Upload degree, license & other certificates</span>
                                 <span className="text-xs text-muted-foreground">(PDF or Image files)</span>
                              </div>
                              <Input
                                 id="certificates"
                                 name="certificates"
                                 type="file"
                                 accept=".pdf,image/*"
                                 multiple
                                 onChange={handleFileChange}
                                 className="hidden"
                              />
                           </div>

                           {formData.certificates.length > 0 && (
                              <div className="mt-2 space-y-2">
                                 <p className="text-sm font-medium">Selected files:</p>
                                 <div className="flex flex-wrap gap-2">
                                    {formData.certificates.map((file, index) => (
                                       <Badge key={index} variant="outline" className="bg-primary/10 text-primary">
                                          {file.name}
                                       </Badge>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {errors.certificates && (
                              <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                                 <AlertCircle size={14} /> {errors.certificates}
                              </p>
                           )}
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
                           <p className="text-amber-800 text-sm">
                              <strong>Note:</strong> Your application will be reviewed by our admin team. You'll be notified once
                              your profile is approved.
                           </p>
                        </div>
                     </div>
                  )}

                  <div className="flex justify-between mt-8">
                     {step > 1 && (
                        <Button variant="outline" onClick={prevStep}>
                           Back
                        </Button>
                     )}
                     {step < 5 ? (
                        <Button onClick={nextStep} className={step === 1 ? "ml-auto" : ""}>
                           Continue
                        </Button>
                     ) : (
                        <Button onClick={handleSubmit}>Submit Application</Button>
                     )}
                  </div>
                
               </CardContent>
              
            </Card>
            <div className='mt-4 flex justify-center items-center'>
               <p className='font-medium text-base'>Already have Doctor Account ?</p>
               <Link href='/doctor-login'
                  className='ml-2 font-medium text-base text-violet-500 hover:text-violet-700'
                  
               >
                  Click here
               </Link>
            </div>
         </div>
      </div>
   )
}
