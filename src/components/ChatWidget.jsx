import { useState, useRef, useEffect } from 'react'
import { askGroq } from '../utils/groqChat'
import { appConfig } from '../lib/config'

export function ChatWidget({ position = 'bottom-right' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const widgetRef = useRef(null)

  const positionClasses = {
    'bottom-right': 'bottom-24 right-4',
    'bottom-left': 'bottom-24 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        text: "Hi! I'm JalSetu's assistant for **Mira Bhayander**. I can help with water supply timings (7–9 AM & PM daily), MBMC contacts, known issue areas, or filing a complaint. What's your water concern?",
        timestamp: new Date(),
      }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await askGroq(currentInput, conversationHistory)

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMsg])
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: currentInput },
        { role: 'assistant', content: response },
      ])
    } catch (err) {
      console.error('Chat error:', err)
      setError(err.message || 'Failed to send message. Please try again.')
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I\'m having trouble connecting. Please try again in a moment.',
        timestamp: new Date(),
        error: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleChat = () => setIsOpen(!isOpen)

  const positionClass = positionClasses[position] || positionClasses['bottom-right']

  return (
    <div ref={widgetRef} className={`fixed z-50 ${positionClass} transition-all duration-300`}>
      <button
        onClick={toggleChat}
        className={`touch-target w-14 h-14 rounded-full bg-primary-600 text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:bg-primary-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isOpen ? 'rotate-45 bg-red-500' : ''}`}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {!isOpen && messages.some(m => m.role === 'assistant' && !m.read) && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            1
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 max-w-[calc(100vw-1rem)] h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-slide-up">
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">JalSetu Assistant</h3>
                <p className="text-xs opacity-80">AI-powered help for water issues</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="touch-target p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!appConfig.hasGroq && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
              <p className="text-xs text-amber-700 text-center">
                Set VITE_GROQ_API_KEY in your .env file to enable live AI chat.
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100% - 140px)' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  } ${msg.error ? 'bg-red-50 text-red-700 border border-red-200' : ''}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className={`flex items-end gap-1 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <time className="text-xs text-gray-400">
                      {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200">
              <div className="flex items-center justify-between text-sm text-red-700">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-500 hover:underline">Dismiss</button>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your water issue..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                disabled={loading}
                aria-label="Message"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="touch-target w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <p className="text-xs text-gray-400 text-center mt-2">
              Powered by AI • Your data helps improve water services
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
