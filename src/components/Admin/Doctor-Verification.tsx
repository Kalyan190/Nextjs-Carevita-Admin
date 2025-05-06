"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, AlertCircle, Search, FileText, UserCheck, Trash2, Ban, Loader2 } from "lucide-react"
import { useAdminContext } from "@/context/AdminContext"

// Types
interface Certificate {
   _id: string
   name: string
   url: string
   status: "pending" | "approved" | "rejected"
   rejectionReason?: string
}

interface Doctor {
   _id: string
   name: string
   email: string
   status: "pending" | "approved" | "rejected" | "cancelled"
   certificates: Certificate[]
   rejectionReason?: string
}

export default function CertificateVerificationPage() {
   const router = useRouter()

   // State for when context is not yet available
   const [isContextLoading, setIsContextLoading] = useState(true)
   const [contextError, setContextError] = useState<string | null>(null)

   // Context values with fallbacks
   const [aToken, setAToken] = useState<string | null>(null)
   const [doctors, setDoctors] = useState<Doctor[]>([])
   const [isLoading, setIsLoading] = useState(false)
   const [backendUrl, setBackendUrl] = useState(process.env.NEXT_PUBLIC_BACKEND_URL || "")
   const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
   const [searchTerm, setSearchTerm] = useState("")
   const [activeTab, setActiveTab] = useState("pending")
   const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
   const [selectedCertificate, setSelectedCertificate] = useState<{ certificate: Certificate; index: number } | null>(
      null,
   )
   const [isViewCertificateOpen, setIsViewCertificateOpen] = useState(false)
   const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
   const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
   const [rejectionReason, setRejectionReason] = useState("")
   const [successMessage, setSuccessMessage] = useState<string | null>(null)

   // Initialize adminContext outside of the try-catch
   const adminContext = useAdminContext()

   // Use useCallback for the filterDoctors function
   const filterDoctors = useCallback(
      (doctorsList: Doctor[], tab: string, search: string) => {
         let filtered = doctorsList

         // Filter by tab
         if (tab === "pending") {
            filtered = filtered.filter(
               (doctor) => doctor.status === "pending" || doctor.certificates.some((cert) => cert.status === "pending"),
            )
         } else if (tab === "approved") {
            filtered = filtered.filter((doctor) => doctor.status === "approved")
         } else if (tab === "rejected") {
            filtered = filtered.filter(
               (doctor) => doctor.status === "rejected" || doctor.certificates.some((cert) => cert.status === "rejected"),
            )
         } else if (tab === "cancelled") {
            filtered = filtered.filter((doctor) => doctor.status === "cancelled")
         }

         // Filter by search term
         if (search) {
            filtered = filtered.filter(
               (doctor) =>
                  doctor.name.toLowerCase().includes(search.toLowerCase()) ||
                  doctor.email.toLowerCase().includes(search.toLowerCase()),
            )
         }

         setFilteredDoctors(filtered)
      },
      [setFilteredDoctors],
   )

   // Update local state from context when available
   useEffect(() => {
      if (adminContext) {
         setAToken(adminContext.aToken)
         setDoctors(adminContext.doctors)
         setIsLoading(adminContext.loading)
         setBackendUrl(adminContext.backendUrl)
         setIsContextLoading(false) // Context is loaded
      }
   }, [adminContext])

   useEffect(() => {
      if (!adminContext) {
         setIsContextLoading(true)
         setContextError("Admin context is not available.")
      } else {
         setIsContextLoading(false)
         setContextError(null)
      }
   }, [adminContext])

   // Check for authentication
   useEffect(() => {
      if (adminContext && !adminContext.aToken) {
         router.push("/admin/login")
      }
   }, [adminContext, router])

   // Fetch doctors data
   useEffect(() => {
      if (aToken) {
         adminContext.getAllDoctors()
      }
   }, [aToken])

   // Filter doctors when doctors array or filter criteria change
   useEffect(() => {
      filterDoctors(doctors, activeTab, searchTerm)
   }, [doctors, activeTab, searchTerm, filterDoctors])

   // Handle tab change
   const handleTabChange = (value: string) => {
      setActiveTab(value)
   }

   // Handle search
   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchTerm(value)
   }

   // View certificate
   const handleViewCertificate = (doctor: Doctor, certificate: Certificate, index: number) => {
      setSelectedDoctor(doctor)
      setSelectedCertificate({ certificate, index })
      setIsViewCertificateOpen(true)
   }

   // Approve certificate
   const handleApproveCertificate = async () => {
      if (!selectedDoctor || !selectedCertificate || !adminContext) return

      adminContext.setLoading(true)
      try {
         const response = await fetch(`${backendUrl}/api/admin/approve-certificates`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               aToken: adminContext.aToken || "",
            },
            body: JSON.stringify({
               docId: selectedDoctor._id,
               certificates: [
                  {
                     index: selectedCertificate.index,
                     status: "approved",
                  },
               ],
            }),
         })

         const data = await response.json()

         if (data.success) {
            // Refresh the doctors list
            await adminContext.getAllDoctors()
            setSuccessMessage(`Certificate "${selectedCertificate.certificate.name}" has been approved`)
            setTimeout(() => setSuccessMessage(null), 3000)
            setIsViewCertificateOpen(false)
         }
      } catch (error) {
         console.error("Failed to approve certificate:", error)
      } finally {
         adminContext.setLoading(false)
      }
   }

   // Reject certificate
   const handleRejectCertificate = async () => {
      if (!selectedDoctor || !selectedCertificate || !rejectionReason || !adminContext) return

      adminContext.setLoading(true)
      try {
         const response = await fetch(`${backendUrl}/api/admin/approve-certificates`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               aToken: adminContext.aToken || "",
            },
            body: JSON.stringify({
               docId: selectedDoctor._id,
               certificates: [
                  {
                     index: selectedCertificate.index,
                     status: "rejected",
                     rejectionReason,
                  },
               ],
            }),
         })

         const data = await response.json()

         if (data.success) {
            // Refresh the doctors list
            await adminContext.getAllDoctors()
            setSuccessMessage(`Certificate "${selectedCertificate.certificate.name}" has been rejected`)
            setTimeout(() => setSuccessMessage(null), 3000)
            setIsRejectDialogOpen(false)
            setIsViewCertificateOpen(false)
            setRejectionReason("")
         }
      } catch (error) {
         console.error("Failed to reject certificate:", error)
      } finally {
         adminContext.setLoading(false)
      }
   }

   // Approve doctor
   const handleApproveDoctor = async (doctor: Doctor) => {
      if (!adminContext) return

      adminContext.setLoading(true)
      try {
         await adminContext.approveDoctor(doctor._id)
         setSuccessMessage(`Doctor ${doctor.name} has been approved`)
         setTimeout(() => setSuccessMessage(null), 3000)
      } catch (error) {
         console.error("Failed to approve doctor:", error)
      }
   }

   // Cancel doctor account
   const handleCancelDoctor = async () => {
      if (!selectedDoctor || !rejectionReason || !adminContext) return

      adminContext.setLoading(true)
      try {
         const response = await fetch(`${backendUrl}/api/admin/doctor-cancelled`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               aToken: adminContext.aToken || "",
            },
            body: JSON.stringify({
               doctorId: selectedDoctor._id,
               reason: rejectionReason,
            }),
         })

         const data = await response.json()

         if (data.success) {
            // Refresh the doctors list
            await adminContext.getAllDoctors()
            setSuccessMessage(`Doctor ${selectedDoctor.name} has been cancelled`)
            setTimeout(() => setSuccessMessage(null), 3000)
            setIsCancelDialogOpen(false)
            setRejectionReason("")
         }
      } catch (error) {
         console.error("Failed to cancel doctor account:", error)
      } finally {
         adminContext.setLoading(false)
      }
   }

   // Delete doctor account
   const handleDeleteDoctor = async () => {
      if (!selectedDoctor || !adminContext) return

      adminContext.setLoading(true)
      try {
         await adminContext.deleteDoctorAccount(selectedDoctor._id)
         setSuccessMessage(`Doctor ${selectedDoctor.name} has been deleted`)
         setTimeout(() => setSuccessMessage(null), 3000)
         setIsDeleteDialogOpen(false)
      } catch (error) {
         console.error("Failed to delete doctor account:", error)
      }
   }

   // Get status badge
   const getStatusBadge = (status: string) => {
      switch (status) {
         case "approved":
            return (
               <Badge className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" /> Approved
               </Badge>
            )
         case "rejected":
            return (
               <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" /> Rejected
               </Badge>
            )
         case "cancelled":
            return (
               <Badge variant="destructive">
                  <Ban className="w-3 h-3 mr-1" /> Cancelled
               </Badge>
            )
         default:
            return (
               <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  <AlertCircle className="w-3 h-3 mr-1" /> Pending
               </Badge>
            )
      }
   }

   // If context is still loading or has an error, show a loading state
   if (isContextLoading || contextError) {
      return (
         <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[50vh]">
            {isContextLoading ? (
               <>
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Loading Admin Context...</h2>
                  <p className="text-muted-foreground">Please wait while we initialize the admin dashboard.</p>
               </>
            ) : (
               <>
                  <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Context Error</h2>
                  <p className="text-muted-foreground">{contextError}</p>
                  <Button className="mt-4" onClick={() => router.push("/admin-login")}>
                     Go to Login
                  </Button>
               </>
            )}
         </div>
      )
   }

   // If no token, redirect to login
   if (!aToken) {
      return (
         <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[50vh]">
            <AlertCircle className="h-8 w-8 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access the certificate verification page.</p>
            <Button className="mt-4" onClick={() => router.push("/admin-login")}>
               Go to Login
            </Button>
         </div>
      )
   }

   return (
      <div className="container mx-auto py-6">
         <h1 className="text-3xl font-bold mb-6">Doctor Certificate Verification</h1>
         {successMessage && (
            <div
               className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
               role="alert"
            >
               <span className="block sm:inline">{successMessage}</span>
            </div>
         )}

         <div className="flex items-center mb-6">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                  type="search"
                  placeholder="Search doctors by name or email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
               />
            </div>
            <Button variant="outline" className="ml-2" onClick={() => adminContext?.getAllDoctors()} disabled={isLoading}>
               {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
         </div>

         <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
               <TabsTrigger value="pending">
                  Pending
                  {doctors.filter((d) => d.status === "pending" || d.certificates.some((c) => c.status === "pending"))
                     .length > 0 &&
                     `(${doctors.filter((d) => d.status === "pending" || d.certificates.some((c) => c.status === "pending")).length})`}
               </TabsTrigger>
               <TabsTrigger value="approved">
                  Approved
                  {doctors.filter((d) => d.status === "approved").length > 0 &&
                     `(${doctors.filter((d) => d.status === "approved").length})`}
               </TabsTrigger>
               <TabsTrigger value="rejected">
                  Rejected
                  {doctors.filter((d) => d.status === "rejected" || d.certificates.some((c) => c.status === "rejected"))
                     .length > 0 &&
                     `(${doctors.filter((d) => d.status === "rejected" || d.certificates.some((c) => c.status === "rejected")).length})`}
               </TabsTrigger>
               <TabsTrigger value="cancelled">
                  Cancelled
                  {doctors.filter((d) => d.status === "cancelled").length > 0 &&
                     `(${doctors.filter((d) => d.status === "cancelled").length})`}
               </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
               <Card>
                  <CardHeader>
                     <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Doctors</CardTitle>
                     <CardDescription>
                        {activeTab === "pending" && "Doctors with pending certificates that need verification."}
                        {activeTab === "approved" && "Doctors with approved certificates and verified accounts."}
                        {activeTab === "rejected" && "Doctors with rejected certificates."}
                        {activeTab === "cancelled" && "Doctors with cancelled accounts."}
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     {isLoading ? (
                        <div className="text-center py-8">
                           <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                           <p>Loading doctors data...</p>
                        </div>
                     ) : filteredDoctors.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No doctors found in this category.</div>
                     ) : (
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Doctor Name</TableHead>
                                 <TableHead>Email</TableHead>
                                 <TableHead>Status</TableHead>
                                 <TableHead>Certificates</TableHead>
                                 <TableHead className="w-full flex items-center justify-center">Actions</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {filteredDoctors.map((doctor) => (
                                 <TableRow key={doctor._id}>
                                    <TableCell className="font-medium">{doctor.name}</TableCell>
                                    <TableCell>{doctor.email}</TableCell>
                                    <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                                    <TableCell>
                                       <div className="flex flex-wrap gap-2">
                                          {doctor.certificates.map((cert, index) => (
                                             <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1"
                                                onClick={() => handleViewCertificate(doctor, cert, index)}
                                             >
                                                <FileText className="h-3.5 w-3.5" />

                                                {cert.status === "approved" && <CheckCircle className="h-3 w-3 text-green-500" />}
                                                {cert.status === "rejected" && (
                                                   <div className="group relative">
                                                      <XCircle className="h-3 w-3 text-red-500" />
                                                      {cert.rejectionReason && (
                                                         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                                            {cert.rejectionReason}
                                                         </div>
                                                      )}
                                                   </div>
                                                )}
                                                {cert.status === "pending" && <AlertCircle className="h-3 w-3 text-yellow-500" />}
                                             </Button>
                                          ))}
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       <div className="flex gap-2">
                                          {doctor.status !== "approved" &&
                                             doctor.certificates.every((cert) => cert.status === "approved") && (
                                                <Button
                                                   size="sm"
                                                   className="bg-green-500 hover:bg-green-600"
                                                   onClick={() => handleApproveDoctor(doctor)}
                                                   disabled={isLoading}
                                                >
                                                   <UserCheck className="h-4 w-4 mr-1" />
                                                   Approve
                                                   {isLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                                                </Button>
                                             )}
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                             onClick={() => {
                                                setSelectedDoctor(doctor)
                                                setIsCancelDialogOpen(true)
                                             }}
                                             disabled={isLoading || doctor.status === "cancelled"}
                                          >
                                             <Ban className="h-4 w-4 mr-1" />
                                             Cancel
                                             {isLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                                          </Button>
                                          <Button
                                             size="sm"
                                             variant="destructive"
                                             onClick={() => {
                                                setSelectedDoctor(doctor)
                                                setIsDeleteDialogOpen(true)
                                             }}
                                             disabled={isLoading}
                                          >
                                             <Trash2 className="h-4 w-4 mr-1" />
                                             Delete
                                             {isLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                                          </Button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>

         {/* View Certificate Dialog */}
         <Dialog open={isViewCertificateOpen} onOpenChange={setIsViewCertificateOpen}>
            <DialogContent className="max-w-3xl">
               <DialogHeader>
                  <DialogTitle>Certificate Details</DialogTitle>
                  <DialogDescription>{selectedCertificate?.certificate.name}</DialogDescription>
               </DialogHeader>

               <div className="grid gap-4">
                  <div className="border rounded-lg overflow-hidden">
                     {selectedCertificate && (
                        <iframe
                           src={selectedCertificate.certificate.url}
                           className="w-full h-[500px]"
                           title={selectedCertificate.certificate.name}
                        />
                     )}
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="font-medium">Status:</span>
                     {selectedCertificate && getStatusBadge(selectedCertificate.certificate.status)}
                  </div>

                  {selectedCertificate?.certificate.status === "rejected" && (
                     <div>
                        <span className="font-medium">Rejection Reason:</span>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedCertificate.certificate.rejectionReason}</p>
                     </div>
                  )}
               </div>

               <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsViewCertificateOpen(false)}>
                     Close
                  </Button>

                  {selectedCertificate?.certificate.status === "pending" && (
                     <>
                        <Button
                           variant="destructive"
                           onClick={() => {
                              setIsRejectDialogOpen(true)
                           }}
                           disabled={isLoading}
                        >
                           Reject
                           {isLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                        </Button>
                        <Button
                           className="bg-green-500 hover:bg-green-600"
                           onClick={handleApproveCertificate}
                           disabled={isLoading}
                        >
                           Approve
                           {isLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                        </Button>
                     </>
                  )}
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Reject Certificate Dialog */}
         <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Reject Certificate</AlertDialogTitle>
                  <AlertDialogDescription>Please provide a reason for rejecting this certificate.</AlertDialogDescription>
               </AlertDialogHeader>

               <Textarea
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
               />

               <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setRejectionReason("")}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     onClick={handleRejectCertificate}
                     disabled={!rejectionReason || isLoading}
                  >
                     Reject
                     {isLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         {/* Cancel Doctor Dialog */}
         <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Doctor Account</AlertDialogTitle>
                  <AlertDialogDescription>
                     This will cancel the doctor&apos;s account. Please provide a reason.
                  </AlertDialogDescription>
               </AlertDialogHeader>

               <Textarea
                  placeholder="Enter reason for cancellation..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
               />

               <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setRejectionReason("")}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     onClick={handleCancelDoctor}
                     disabled={!rejectionReason || isLoading}
                  >
                     Cancel Account
                     {isLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         {/* Delete Doctor Dialog */}
         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete Doctor Account</AlertDialogTitle>
                  <AlertDialogDescription>
                     This action cannot be undone. This will permanently delete the doctor&apos;s account and all associated
                     data.
                  </AlertDialogDescription>
               </AlertDialogHeader>

               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     onClick={handleDeleteDoctor}
                     disabled={isLoading}
                  >
                     Delete
                     {isLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   )
}
