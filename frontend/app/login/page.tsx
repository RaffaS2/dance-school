import { Suspense } from 'react'
import Image from 'next/image'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-['Jost',sans-serif] bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#f7f3f9_100%)]">

      {/* Círculos decorativos */}
      <div className="absolute rounded-full border border-[rgba(212,83,126,0.08)] pointer-events-none"
        style={{ width: 600, height: 600, top: -200, left: -200, background: 'rgba(212, 83, 126, 0.03)' }} />
      <div className="absolute rounded-full border border-[rgba(212,83,126,0.08)] pointer-events-none"
        style={{ width: 400, height: 400, bottom: -150, right: -150, background: 'rgba(127, 119, 221, 0.03)' }} />

      {/* Logo */}
      <div className="text-center -mt-16 mb-0.5 relative z-10">
        <Image
          src="/Logo.png"
          className="mx-auto block drop-shadow-[0px_4px_10px_rgba(0,0,0,0.05)]"
          width={380}
          height={380}
          alt="EntArtes Logo"
        />
      </div>

      <Suspense fallback={<div className="text-sm text-gray-400">A carregar...</div>}>
        <LoginForm />
      </Suspense>

    </div>
  )
}
