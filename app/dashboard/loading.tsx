export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-100 p-4 rounded-lg h-32"></div>
            <div className="bg-gray-100 p-4 rounded-lg h-32"></div>
            <div className="bg-gray-100 p-4 rounded-lg h-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
