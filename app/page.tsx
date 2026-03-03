export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>SSO Demo (Auth0 → Multi Supabase Projects)</h1>
      <p>
        <a href="/api/auth/login">Login</a> |{" "}
        <a href="/dashboard">Dashboard</a> |{" "}
        <a href="/api/auth/logout">Logout</a>
      </p>
    </main>
  );
}