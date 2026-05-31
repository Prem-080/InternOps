import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export default function RatingForm() {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState('')
  const [score, setScore] = useState(5)
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')

  const { data: reports } = useQuery({
    queryKey: ['directReports'],
    queryFn: () => api.get('/hierarchy/my/direct-reports').then(res => res.data),
  })

  const rateMutation = useMutation({
    mutationFn: (data) => api.post('/ratings', data),
    onSuccess: () => {
      queryClient.invalidateQueries('ratings')
      setError('')
      alert('Rating submitted')
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    rateMutation.mutate({ rated_user_id: userId, score, remarks })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-2">Rate a Team Member</h3>
      {error && <p className="text-red-500">{error}</p>}
      <select value={userId} onChange={e => setUserId(e.target.value)} className="border p-2 w-full mb-2" required>
        <option value="">Select user</option>
        {reports?.map(u => (
          <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
        ))}
      </select>
      <input type="number" min="1" max="5" value={score} onChange={e => setScore(parseInt(e.target.value))} className="border p-2 w-full mb-2" required />
      <textarea placeholder="Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} className="border p-2 w-full mb-2" />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Submit Rating</button>
    </form>
  )
}
