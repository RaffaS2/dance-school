'use client'

import { useState, useEffect } from 'react'
import NovaDisponibilidadeForm from "./NovaDisponibilidadeForm";
import Link from "next/link";
import { getApiBase } from '../../lib/apiBase';

interface Professor {
  id_professor: number
  id_user: number
  name: string
  specialty: string | null
  active: boolean
}

export default function Page() {
  const [professores, setProfessores] = useState<Professor[]>([])

  useEffect(() => {
    fetch(`${getApiBase()}/professors`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar professores')
        return res.json()
      })
      .then((data) => setProfessores(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Conteúdo */}
      <div className="flex justify-center p-6">
        <NovaDisponibilidadeForm professores={professores} />
      </div>
    </div>
  );
}
