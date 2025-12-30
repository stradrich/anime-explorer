import { Outlet, Link } from "react-router-dom"

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="w-full bg-white shadow-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto flex justify-between items-center p-4 md:px-6">
          <Link to="/" className="text-2xl font-medium text-gray-500 hover:text-black transition-colors">Anime Explorer</Link>
          <Link to="/favorites" className="px-4 py-2 rounded-lg text-gray-500 font-medium hover:text-black transition-colors">Your Favorites</Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
          <Outlet />
      </main>
    </div>
  )
}
