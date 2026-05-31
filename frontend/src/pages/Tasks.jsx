import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import useAuthStore from '../store/auth'
import CreateTaskForm from '../components/CreateTaskForm'

export default function Tasks() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedTask, setSelectedTask] = useState(null)

  const canCreateTask = ['ADMIN', 'SENIOR_TL'].includes(user?.role)

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(res => res.data),
  })

  const { data: proofs, refetch: refetchProofs } = useQuery({
    queryKey: ['proofs', selectedTask],
    queryFn: () => api.get(`/proofs/task/${selectedTask}`).then(res => res.data),
    enabled: !!selectedTask,
  })

  const submitMutation = useMutation({
    mutationFn: ({ taskId, file }) => {
      const form = new FormData()
      form.append('task_id', taskId)
      form.append('image', file)
      return api.post('/proofs/submit', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => { refetchProofs(); queryClient.invalidateQueries('proofs') }
  })

  const verifyMutation = useMutation({
    mutationFn: (proofId) => api.patch(`/proofs/${proofId}/verify`),
    onSuccess: () => refetchProofs()
  })

  const handleUpload = (e, taskId) => {
    const file = e.target.files[0]
    if (file) submitMutation.mutate({ taskId, file })
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Social Tasks</h2>
      {canCreateTask && <CreateTaskForm />}
      {isLoading && <p>Loading tasks...</p>}
      {tasks && (
        <div className="space-y-4">
          {tasks.map(t => (
            <div key={t.id} className="border p-3 rounded">
              <h3 className="font-bold">{t.title}</h3>
              <p>{t.description}</p>
              <p className="text-sm">Platform: {t.target_platform}</p>
              <a href={t.task_link} className="text-blue-500" target="_blank">Task Link</a>
              <p className="text-sm">Deadline: {new Date(t.deadline).toLocaleString()}</p>
              <button
                onClick={() => setSelectedTask(t.id === selectedTask ? null : t.id)}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
              >
                {selectedTask === t.id ? 'Hide Proofs' : 'View Proofs'}
              </button>
              {user?.role === 'INTERN' && (
                <div className="mt-2">
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, t.id)} className="text-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {selectedTask && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Proof Submissions</h3>
          {proofs?.map(p => (
            <div key={p.id} className="border p-2 my-2 flex items-center gap-4">
              <div>
                <p>Status: {p.status}</p>
                <p>Intern: {p.intern_id}</p>
                {p.image_path && <img src={p.image_path} alt="proof" className="max-w-xs max-h-40" />}
              </div>
              {(user?.role === 'CAPTAIN' || user?.role === 'TL' || user?.role === 'SENIOR_TL') && p.status === 'PENDING' && (
                <button
                  onClick={() => verifyMutation.mutate(p.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Verify
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
