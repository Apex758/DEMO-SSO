async function fetchJSON(path: string) {
  const res = await fetch(`http://localhost:3000${path}`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function Dashboard() {
  const lessonsResp = await fetchJSON("/api/data/lessons");
  const progressResp = await fetchJSON("/api/data/progress");

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>

      <h2>Project A: Lessons</h2>
      <pre>{JSON.stringify(lessonsResp, null, 2)}</pre>

      <h2>Project B: Progress</h2>
      <pre>{JSON.stringify(progressResp, null, 2)}</pre>

      <p>
        <a href="/">Home</a>
      </p>
    </main>
  );
}