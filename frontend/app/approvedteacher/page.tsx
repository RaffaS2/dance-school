import { Suspense } from 'react'
import ApproveTeacher from './approvedTeacher'

export default function ApprovedTeacherPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-md max-w-md text-center">
          <div className="text-5xl mb-4">:arrows_counterclockwise:</div>
          <p className="text-gray-500">A processar aprovação...</p>
        </div>
      </div>
    }>
      <ApproveTeacher />
    </Suspense>
  )
}