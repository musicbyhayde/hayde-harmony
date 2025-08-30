import CreateEventForm from '@/components/CreateEventForm'

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">אירוע חדש</h1>
        <p className="text-gray-600 mt-2">צור אירוע חדש במערכת</p>
      </div>

      <div className="card max-w-2xl">
        <CreateEventForm />
      </div>
    </div>
  )
}