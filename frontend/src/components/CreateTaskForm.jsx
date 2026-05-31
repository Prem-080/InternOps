import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

export default function CreateTaskForm() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetPlatform, setTargetPlatform] = useState('')
  const [taskLink, setTaskLink] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries('tasks')
      setError('')
      alert('Task created')
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate({ title, description, targetPlatform, taskLink, deadline })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-2">Create Social Task</h3>
      {error && <p className="text-red-500">{error}</p>}
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 w-full mb-2" required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 w-full mb-2" />
      <input type="text" placeholder="Target Platform" value={targetPlatform} onChange={e => setTargetPlatform(e.target.value)} className="border p-2 w-full mb-2" />
      <input type="url" placeholder="Task Link" value={taskLink} onChange={e => setTaskLink(e.target.value)} className="border p-2 w-full mb-2" />
      <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="border p-2 w-full mb-2" required />
      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Create Task</button>
    </form>
  )
}
