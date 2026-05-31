import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export default function AttendanceMarkForm() {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [status, setStatus] = useState('PRESENT')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')

  // Fetch direct reports so the manager can pick from a list
  const { data: reports, isLoading: loadingReports } = useQuery({
    queryKey: ['directReports'],
    queryFn: () => api.get('/hierarchy/my/direct-reports').then(res => res.data),
  })

  const markMutation = useMutation({
    mutationFn: (data) => api.post('/attendance/mark', data),
    onSuccess: () => {
      queryClient.invalidateQueries('attendance')
      setError('')
      alert('Attendance marked')
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    markMutation.mutate({ user_id: userId, date, status, remarks })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-2">Mark Attendance</h3>
      {error && <p className="text-red-500">{error}</p>}
      <select value={userId} onChange={e => setUserId(e.target.value)} className="border p-2 w-full mb-2" required>
        <option value="">Select Intern/Captain</option>
        {reports?.map(user => (
          <option key={user.id} value={user.id}>{user.full_name || user.email} ({user.role})</option>
        ))}
      </select>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 w-full mb-2" required />
      <select value={status} onChange={e => setStatus(e.target.value)} className="border p-2 w-full mb-2">
        <option value="PRESENT">Present</option>
        <option value="ABSENT">Absent</option>
        <option value="HALF_DAY">Half Day</option>
      </select>
      <input type="text" placeholder="Remarks (optional)" value={remarks} onChange={e => setRemarks(e.target.value)} className="border p-2 w-full mb-2" />
      <button type="submit" disabled={markMutation.isLoading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {markMutation.isLoading ? 'Submitting...' : 'Mark'}
      </button>
    </form>
  )
}
