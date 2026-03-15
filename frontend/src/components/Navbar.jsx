import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-blue-700 px-6 py-4 text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          StayEase
        </Link>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-blue-100">Hotels</Link>
          <Link to="/admin" className="hover:text-blue-100">Admin</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar