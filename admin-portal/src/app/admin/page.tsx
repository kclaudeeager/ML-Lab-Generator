import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="max-w-xl mx-auto mt-16 bg-white rounded-xl shadow p-10 text-center">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">ML Lab Generator Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome! Use the navigation to manage labs or start creating a new one.</p>
      <Link href="/admin/labs">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded transition">
          Go to Labs
        </button>
      </Link>
    </div>
  );
}
