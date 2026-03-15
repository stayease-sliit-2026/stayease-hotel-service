import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import HotelDetailsPage from './pages/HotelDetailsPage'
import AdminPage from './pages/AdminPage'
import AdminHotelDetailsPage from './pages/AdminHotelDetailsPage'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50 to-slate-100 text-slate-900">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotels/:id" element={<HotelDetailsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/hotels/:id" element={<AdminHotelDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
