'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ApproveTeacher() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token em falta.')
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/approve-teacher?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus('error')
          setMessage(data.error)
        } else {
          setStatus('success')
          setMessage(data.message)
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Erro de ligação ao servidor.')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="text-5xl mb-4">🔄</div>
            <p className="text-gray-500">A processar aprovação...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Aprovado!</h1>
            <p className="text-gray-500">{message}</p>
            <p className="text-gray-400 mt-2 text-sm">O professor recebeu um email de confirmação.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Erro</h1>
            <p className="text-gray-500">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}
