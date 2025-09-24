export default function TestUIPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          UI Test Page
        </h1>
        <p className="text-gray-600">
          If you can see this, the basic UI is working!
        </p>
        <div className="mt-4 p-4 bg-emerald-100 rounded">
          <p className="text-emerald-800">Emerald background test</p>
        </div>
      </div>
    </div>
  )
}

