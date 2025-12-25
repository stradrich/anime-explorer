import { Outlet, Link } from "react-router-dom"

export default function Layout() {
  return (
    <>
      <header style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link to="/">Anime Explorer</Link>
          <Link to="/favorites">Favorites</Link>
        </nav>
      </header>

      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  )
}
