import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import useAuthStore from '../store/auth'

export default function Home() {
  const { user } = useAuthStore()
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: async () => {
      // For now we fetch a few things. In real app you'd have a dedicated endpoint.
      const att = await api.get(`/attendance/${user.id}/stats?month=${new Date().getMonth()+1}&year=${new Date().getFullYear()}`).catch(() => ({ data: [] }))
      const ratings = await api.get(`/ratings/${user.id}`).catch(() => ({ data: [] }))
      return { monthlyAtt: att.data, ratings: ratings.data }
    },
    enabled: !!user,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Welcome, {user?.fullName || user?.email}</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <h3 className="font-bold mb-2">Monthly Attendance</h3>
          {stats?.monthlyAtt?.map(s => (
            <p key={s.status}>{s.status}: {s.count} days</p>
          )) || <p>No data</p>}
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="font-bold mb-2">Your Ratings</h3>
          {stats?.ratings?.length > 0 ? (
            stats.ratings.map(r => <p key={r.id}>{r.score}/5 - {r.remarks || ''}</p>)
          ) : <p>No ratings yet</p>}
        </div>
      </div>
    </div>
  )
}
