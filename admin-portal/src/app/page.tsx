import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>Welcome to the ML Lab Generator</h1>
      <p>This is your platform for creating, reviewing, and managing interactive machine learning labs.</p>
      <Link href="/admin">
        <button style={{ marginTop: 32, padding: '14px 32px', fontSize: 18 }}>
          Go to Admin Portal
        </button>
      </Link>
    </div>
  );
}
