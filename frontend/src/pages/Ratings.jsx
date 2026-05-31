import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import useAuthStore from '../store/auth'
import RatingForm from '../components/RatingForm'

export default function Ratings() {
  const { user } = useAuthStore()
  const canRate = ['CAPTAIN', 'TL', 'SENIOR_TL'].includes(user?.role)
  const [viewUserId, setViewUserId] = useState(user?.id || '')
  const { data: ratings, isLoading, error } = useQuery({
    queryKey: ['ratings', viewUserId],
    queryFn: () => api.get(`/ratings/${viewUserId}`).then(res => res.data),
    enabled: !!viewUserId,
  })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ratings</h2>
      {canRate && <RatingForm />}
      <div className="mb-4">
        <input
          type="text"
          placeholder="User ID"
          value={viewUserId}
          onChange={e => setViewUserId(e.target.value)}
          className="border rounded p-2"
        />
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load ratings</p>}
      {ratings && (
        <div className="space-y-2">
          {ratings.map(r => (
            <div key={r.id} className="border p-2 rounded">
              <p><strong>Score:</strong> {r.score}/5</p>
              {r.remarks && <p><em>{r.remarks}</em></p>}
              <p className="text-sm text-gray-500">Given by {r.rated_by} on {new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
