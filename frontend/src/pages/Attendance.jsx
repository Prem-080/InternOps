import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import useAuthStore from '../store/auth'
import AttendanceMarkForm from '../components/AttendanceMarkForm'

export default function Attendance() {
  const { user } = useAuthStore()
  const canMark = ['CAPTAIN', 'TL', 'SENIOR_TL'].includes(user?.role)
  const [viewUserId, setViewUserId] = useState(user?.id || '')
  const { data: records, isLoading, error } = useQuery({
    queryKey: ['attendance', viewUserId],
    queryFn: () => api.get(`/attendance/${viewUserId}`).then(res => res.data),
    enabled: !!viewUserId,
  })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Attendance</h2>
      {canMark && <AttendanceMarkForm />}
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="User ID"
          value={viewUserId}
          onChange={e => setViewUserId(e.target.value)}
          className="border rounded p-2"
        />
        <span className="text-sm text-gray-600">(defaults to your own)</span>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load attendance</p>}
      {records && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Remarks</th>
              <th className="p-2 border">Marked By</th>
            </tr>
          </thead>
          <tbody>
            {records.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="p-2 border">{a.date}</td>
                <td className="p-2 border">{a.status}</td>
                <td className="p-2 border">{a.remarks || '-'}</td>
                <td className="p-2 border">{a.marked_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
