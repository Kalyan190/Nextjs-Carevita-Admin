"use client"

import { assets } from "@/assets/assets_admin/assets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useDoctorContext } from "@/context/DoctorContext"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { Download, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { redirect, useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
// import { toast } from "@/components/ui/use-toast"

const Patient = () => {
  const params = useParams();
  const patientId = params?.patient as string;
  


  const { appointments, getAppointments, dToken, currentPatient, setPatientInfoForAppointment } = useDoctorContext()
  const [currentAppointment, setCurrentAppointment] = useState<any>(null)
  const pdfRef = useRef(null)

  const [medicines, setMedicines] = useState([{ name: "", quantity: "", price: "", dosage: "", duration: "", instructions: "" }])

  const [diagnosis, setDiagnosis] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  useEffect(() => {
    setCurrentAppointment(appointments.find((appointment: any) => appointment._id === patientId))
  }, [appointments, patientId])

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const updated = [...medicines]
    updated[index][field as keyof (typeof medicines)[number]] = value
    setMedicines(updated)
  }

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: "", quantity: "", price: "", dosage: "", duration: "", instructions: "" }])
  }

  const removeMedicineRow = (index: number) => {
    if (medicines.length > 1) {
      const updated = [...medicines]
      updated.splice(index, 1)
      setMedicines(updated)
    }
  }

  const calculateTotal = () => {
    return medicines.reduce((total, med) => {
      const price = Number(med.price) || 0
      const quantity = Number(med.quantity) || 0
      return total + price * quantity
    }, 0)
  }

  const generatePDF = async () => {
    if (!pdfRef.current) return

    setIsGenerating(true)
    try {
      const element = pdfRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")

      // A4 size: 210 x 297 mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add new pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Convert PDF to Blob
      const pdfBlob = pdf.output("blob")
      const formData = new FormData()
      // console.log(currentPatient)
      formData.append("file", pdfBlob, `prescription_${currentPatient.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`)
      formData.append("patientId", currentPatient._id)
      formData.append("doctorId", currentAppointment?.docData?._id)
      formData.append("diagnosis", diagnosis)
      formData.append("notes", notes)
      formData.append("medicines", JSON.stringify(medicines))
      console.log(formData)


      // Download the PDF locally
      pdf.save(`prescription_${currentPatient.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`)

      toast.success("Prescription PDF has been generated and saved successfully")
      // Save to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/doctor/prescription/create`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to save prescription")
      }

      // const result = await response.json()
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate or save PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!appointments || !currentPatient) {
    redirect("/dashboard/doctor-appointments")
  }

  return (
    !appointments || !currentPatient ? redirect("/dashboard/doctor-appointments") :
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Patient Prescription</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  placeholder="Patient diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Doctor's Notes</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="Additional notes for the patient"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Prescribed Medicines</Label>
                  <Button variant="outline" size="sm" onClick={addMedicineRow}>
                    <Plus className="h-4 w-4 mr-1" /> Add Medicine
                  </Button>
                </div>

                <div className="space-y-3">
                  {medicines.map((med, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <Input
                          placeholder="Medicine Name"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={med.quantity}
                          onChange={(e) => handleMedicineChange(index, "quantity", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Price ₹"
                          value={med.price}
                          onChange={(e) => handleMedicineChange(index, "price", e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMedicineRow(index)}
                          disabled={medicines.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={generatePDF} disabled={isGenerating}>
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating PDF..." : "Generate and save PDF"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div>
          <Card>
            <CardHeader className="flex flex-col justify-center items-center text-center">
                <Image src={assets.admin_logo} alt="Doctor Logo" width={120} height={40} className="mb-2" />
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-2 bg-white print-friendly">
                <div ref={pdfRef} className="w-full bg-white p-2">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      {currentAppointment?.docData?.logo ? (
                        <Image
                          src={currentAppointment.docData.logo || "/placeholder.svg"}
                          alt="Doctor Logo"
                          width={120}
                          height={40}
                        />
                      ) : (
                        <div className="text-xl font-bold text-gray-800">
                          {/* {currentAppointment?.docData?.name || "Doctor's Clinic"} */}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</div>
                      <div className="text-sm text-gray-600">
                        Prescription #:{" "}
                        {Math.floor(Math.random() * 10000)
                          .toString()
                          .padStart(4, "0")}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 pb-2 border-b-2 border-red-700">
                    <div className="pr-4 ">
                      <h3 className="font-semibold text-gray-700 mb-1">Patient Information</h3>
                      <div className="text-sm">
                        <p>
                          <span className="font-medium">Name:</span> {currentPatient.name}
                        </p>
                        <p>
                          <span className="font-medium">Contact:</span> {currentPatient.phone} | {currentPatient.email}
                        </p>
                        <p>
                          <span className="font-medium">Info:</span> {currentPatient.gender} | DOB:{currentPatient.dob}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Doctor Information</h3>
                      <div className="text-sm">
                        <p>
                          <span className="font-medium">Name:</span> {currentAppointment?.docData?.name}
                        </p>
                        <p>
                          <span className="font-medium">Qualifications:</span>{" "}
                          {appointments[0]?.docData?.educationDetails?.degree} at {appointments[0]?.docData?.educationDetails?.college}
                        </p>
                        <p>
                          <span className="font-medium">Experience:</span> {appointments[0]?.docData?.experience} years
                        </p>
                        <p>
                          <span className="font-medium"></span> {appointments[0]?.docData?.address?.street},{" "}
                          {appointments[0]?.docData?.address?.pincode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {diagnosis && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-700 mb-1">Diagnosis</h3>
                      <p className="text-sm border p-2 rounded bg-gray-50">{diagnosis}</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Prescribed Medicines</h3>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Medicine</th>
                          <th className="border p-2 text-center">Quantity</th>
                          <th className="border p-2 text-center">Price/Unit ₹</th>
                          <th className="border p-2 text-center">Total ₹</th>
                          <th className="border p-2 text-center">Dosage</th>
                          <th className="border p-2 text-center">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((med, index) => {
                          const netPrice = (Number(med.quantity) || 0) * (Number(med.price) || 0)
                          return med.name ? (
                            <tr key={index}>
                              <td className="border p-2">{med.name}</td>
                              <td className="border p-2 text-center">{med.quantity}</td>
                              <td className="border p-2 text-center">{med.price}</td>
                              <td className="border p-2 text-center">{netPrice.toFixed(2)}</td>
                              <td className="border p-2 text-center">{med.dosage}</td>
                              <td className="border p-2 text-center">{med.duration}</td>
                            </tr>
                          ) : null
                        })}
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="border p-2 text-right font-medium">
                            Total Amount:
                          </td>
                          <td className="border p-2 text-center font-medium">₹{calculateTotal().toFixed(2)}</td>
                          <td className="border p-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {notes && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-700 mb-1">Doctor's Notes</h3>
                      <p className="text-sm border p-2 rounded bg-gray-50">{notes}</p>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="mt-8 text-center text-xs text-gray-500">
                    <p>This is a computer-generated prescription created by the doctor after examining the patient.</p>
                    <p className="mt-1 font-medium">© {new Date().getFullYear()} All Rights Reserved.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Patient
