export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <div className="text-xl font-semibold text-blue-600 mb-2">היידה</div>
        <div className="text-gray-600">טוען...</div>
      </div>
    </div>
  )
}