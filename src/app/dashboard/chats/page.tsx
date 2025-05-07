// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import axios from 'axios'
// import io from 'socket.io-client'

// const socket = io(`${ process.env.NEXT_PUBLIC_BACKEND_URL }`) // Update for prod

// export default function ChatPage() {
//   const [conversations, setConversations] = useState<any[]>([])
//   const [selectedConversation, setSelectedConversation] = useState<any>(null)
//   const [messages, setMessages] = useState<any[]>([])
//   const [newMessage, setNewMessage] = useState('')
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const [doctorId, setDoctorId] = useState<string | null>(null)
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const doctorId = localStorage.getItem('DId') // or userId
//       setDoctorId(doctorId)
//     }
//   }, []);

//   useEffect(() => {
    
//     if (doctorId) {
//       axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/conversations?userId=${doctorId}&role=doctor`)
//         .then(res => { setConversations(res.data); setSelectedConversation(res.data[0]) })
//         .catch(console.error)
//     }
//   }, [doctorId])


//   useEffect(() => {
//     if (!selectedConversation) return

//     // Register doctor/user socket
//     socket.emit('register', { userId: doctorId })

//     axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/messages/${selectedConversation._id}`).then(res => setMessages(res.data.messages))

//     socket.on('receiveMessage', msg => {
//       if (msg.conversationId === selectedConversation._id) {
//         setMessages(prev => [...prev, msg])
//       }
//     })
//     return () => {
//       socket.off('receiveMessage')
//     }
//   }, [selectedConversation])

//   const sendMessage = () => {
//     if (!newMessage.trim() || !selectedConversation) { console.log('no message or conversation'); return }
//     socket.emit('sendMessage', {
//       conversationId: selectedConversation._id,
//       senderId: doctorId,
//       receiverId: selectedConversation.user,
//       senderType: 'doctor',
//       text: newMessage
//     })

//     setNewMessage('')
//   }

//   // useEffect(() => {
//   //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   // }, [messages])

//   return (
//    <div className=''>
//     <div className="flex max-w-5xl mx-auto p-4 h-[80vh] w-full">
//       {/* Conversation List */}
//         <div className="w-1/3 border-r overflow-y-auto">
//         <h2 className="text-lg font-semibold mb-2">Conversations</h2>
//         {conversations && conversations.map(conv => (
//           <div
//             key={conv._id}
//             className={`p-2 border-b cursor-pointer hover:bg-gray-100 ${selectedConversation?._id === conv._id ? 'bg-gray-200' : ''}`}
//             onClick={() => setSelectedConversation(conv)}
//           >
//             <div className='flex items-center gap-2'>
//               <img src={conv.other.image} alt={conv.other.name} className='w-10 h-10 rounded-full' />
//               <p>{conv.other.name}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Chat Window */}
//         <div className="flex-1 flex flex-col ml-4">
//            {selectedConversation ? (
//               <>
//                  <div className="flex-1 overflow-y-auto border p-4 rounded-md">
//                     {messages.map((msg) => (
//                        <div
//                           key={msg._id}
//                           className={`mb-2 p-2 rounded-md max-w-xs ${msg.senderId === doctorId ? 'bg-blue-100 ml-auto' : 'bg-gray-200'}`}
//                        >
//                           <p>{msg.text}</p>
//                           <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</span>
//                        </div>
//                     ))}
//                     <div ref={messagesEndRef} />
//                  </div>

//                  <div className="mt-4 flex gap-2">
//                     <input
//                        className="flex-1 border p-2 rounded-md"
//                        value={newMessage}
//                        onChange={(e) => setNewMessage(e.target.value)}
//                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//                        placeholder="Type a message..."
//                     />
//                     <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-md">
//                        Send
//                     </button>
//                  </div>
//               </>
//            ) : (
//               <p className="text-gray-500">Select a conversation to view messages</p>
//            )}
//         </div>
//     </div>
//      </div>
//   )
// }

"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import io from "socket.io-client"
import { Send, User, Search, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

// Initialize socket connection
const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`) // Update for prod

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [doctorId, setDoctorId] = useState<string | null>(null)

  // Get doctor ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const doctorId = localStorage.getItem("DId") // or userId
      setDoctorId(doctorId)
    }
  }, [])

  // Fetch conversations when doctorId is available
  useEffect(() => {
    if (doctorId) {
      setLoading(true)
      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/conversations?userId=${doctorId}&role=doctor`)
        .then((res) => {
          setConversations(res.data)
          if (res.data.length > 0) {
            setSelectedConversation(res.data[0])
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [doctorId])

  // Handle socket connection and message fetching
  useEffect(() => {
    if (!selectedConversation) return

    // Register doctor/user socket
    socket.emit("register", { userId: doctorId })

    // Fetch messages for selected conversation
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/messages/${selectedConversation._id}`)
      .then((res) => setMessages(res.data.messages))
      .catch((err) => console.error("Error fetching messages:", err))

    // Listen for new messages
    socket.on("receiveMessage", (msg) => {
      if (msg.conversationId === selectedConversation._id) {
        setMessages((prev) => [...prev, msg])
      }
    })

    return () => {
      socket.off("receiveMessage")
    }
  }, [selectedConversation, doctorId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send message function
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) {
      console.log("no message or conversation")
      return
    }

    socket.emit("sendMessage", {
      conversationId: selectedConversation._id,
      senderId: doctorId,
      receiverId: selectedConversation.user,
      senderType: "doctor",
      text: newMessage,
    })

    setNewMessage("")
  }

  // Format time for messages
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex h-screen w-full bg-white">
      <div className="flex max-w-6xl w-full mx-auto p-4">
        {/* Conversation List */}
        <Card className="w-1/3 max-w-xs mr-4 border shadow-sm h-[calc(100vh-2rem)] flex flex-col">
          <CardHeader className="px-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800">Patients</CardTitle>
              <div className="bg-gray-100 text-xs font-medium px-2 py-1 rounded-full text-gray-600">
                {conversations.length}
              </div>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search conversations..." className="pl-9 bg-gray-50" />
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 overflow-y-auto">
            <CardContent className="p-2">
              {loading ? (
                // Loading skeletons
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 my-2">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
              ) : conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    className={`p-3 my-1 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?._id === conv._id ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={conv.other.image || "/placeholder.svg"} alt={conv.other.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {conv.other.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{conv.other.name}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Last active: 2h ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No conversations yet</p>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="flex-1 flex flex-col border shadow-sm h-[calc(100vh-2rem)]">
          {selectedConversation ? (
            <>
              <CardHeader className="px-6 py-4 border-b flex items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage
                      src={selectedConversation.other.image || "/placeholder.svg"}
                      alt={selectedConversation.other.name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {selectedConversation.other.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-medium">{selectedConversation.other.name}</CardTitle>
                    <p className="text-xs text-gray-500">Patient ID: {selectedConversation.user}</p>
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.senderId === doctorId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-2xl ${
                            msg.senderId === doctorId
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${msg.senderId === doctorId ? "text-blue-100" : "text-gray-400"}`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <CardFooter className="p-4 border-t">
                <div className="flex items-center gap-3 w-full">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">No conversation selected</p>
                <p className="text-sm">Select a patient from the list to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
