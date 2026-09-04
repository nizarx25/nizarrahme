export default function AdminPingPage() {
  return (
    <div style={{ padding: 40, fontFamily: 'monospace' }}>
      <h1>OK - admin-ping rendered</h1>
      <p>This page is OUTSIDE the /admin tree, so no admin layout runs.</p>
    </div>
  )
}