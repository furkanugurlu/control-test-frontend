export function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="mb-4">
        <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
      <div className="h-20 bg-gray-100 rounded mb-4"></div>
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
    </div>
  );
}

