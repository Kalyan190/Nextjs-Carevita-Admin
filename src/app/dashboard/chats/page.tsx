'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import io from 'socket.io-client'

const socket = io('http://localhost:4000') // Update for prod

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const doctorId = localStorage.getItem('DId') // or userId

  useEffect(() => {
    if (doctorId) {
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/conversations?userId=${doctorId}&role=doctor`)
        .then(res => { setConversations(res.data); setSelectedConversation(res.data[0]) })
        .catch(console.error)
    }
  }, [doctorId])


  useEffect(() => {
    if (!selectedConversation) return

    // Register doctor/user socket
    socket.emit('register', { userId: doctorId })

    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/messages/${selectedConversation._id}`).then(res => setMessages(res.data.messages))

    socket.on('receiveMessage', msg => {
      if (msg.conversationId === selectedConversation._id) {
        setMessages(prev => [...prev, msg])
      }
    })
    return () => {
      socket.off('receiveMessage')
    }
  }, [selectedConversation])

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) { console.log('no message or conversation'); return }
    socket.emit('sendMessage', {
      conversationId: selectedConversation._id,
      senderId: doctorId,
      receiverId: selectedConversation.user,
      senderType: 'doctor',
      text: newMessage
    })

    setNewMessage('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex max-w-5xl mx-auto p-4 h-[80vh]">
      {/* Conversation List */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Conversations</h2>
        {conversations && conversations.map(conv => (
          <div
            key={conv._id}
            className={`p-2 border-b cursor-pointer hover:bg-gray-100 ${selectedConversation?._id === conv._id ? 'bg-gray-200' : ''}`}
            onClick={() => setSelectedConversation(conv)}
          >
            <div className='flex items-center gap-2'>
              <img src={conv.other.image} alt={conv.other.name} className='w-10 h-10 rounded-full' />
              <p>{conv.other.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col ml-4">
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-y-auto border p-4 rounded-md">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-2 p-2 rounded-md max-w-xs ${msg.senderId === doctorId ? 'bg-blue-100 ml-auto' : 'bg-gray-200'}`}
                >
                  <p>{msg.text}</p>
                  <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex gap-2">
              <input
                className="flex-1 border p-2 rounded-md"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a conversation to view messages</p>
        )}
      </div>
    </div>
  )
}
