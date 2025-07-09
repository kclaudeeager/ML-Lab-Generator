import Link from 'next/link';

export default function AdminNav() {
  return (
    <nav>
      <ul className="space-y-4">
        <li>
          <Link href="/admin" className="block px-3 py-2 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/admin/labs" className="block px-3 py-2 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium transition">
            Labs
          </Link>
        </li>
      </ul>
    </nav>
  );
}
