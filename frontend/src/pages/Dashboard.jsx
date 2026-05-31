import { Link, Routes, Route, useLocation } from 'react-router-dom'
import Home from './Home'
import Attendance from './Attendance'
import Ratings from './Ratings'
import Tasks from './Tasks'
const nav = [
  { path:'/', label:'Dashboard' },
  { path:'/attendance', label:'Attendance' },
  { path:'/ratings', label:'Ratings' },
  { path:'/tasks', label:'Tasks' }
]
export default function Dashboard() {
  const loc = useLocation()
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">InternOps</h2>
        <nav className="flex flex-col gap-2">
          {nav.map(n => (
            <Link key={n.path} to={n.path} className={`p-2 rounded hover:bg-gray-700 ${loc.pathname===n.path?'bg-gray-700':''}`}>{n.label}</Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route index element={<Home />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="ratings" element={<Ratings />} />
          <Route path="tasks" element={<Tasks />} />
        </Routes>
      </main>
    </div>
  )
}
