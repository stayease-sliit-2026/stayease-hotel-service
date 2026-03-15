import { useEffect, useMemo, useState } from 'react'
import { FiLayers, FiMapPin, FiPlus, FiSearch, FiX } from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'
import HotelCard from '../components/HotelCard'
import HotelForm from '../components/HotelForm'
import { createHotel, deleteHotel, listHotels } from '../api/hotelApi'

function AdminPage() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deletingHotelId, setDeletingHotelId] = useState('')
  const [authPopupMessage, setAuthPopupMessage] = useState('')
  const [searchName, setSearchName] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function isAdminValidationError(msg = '') {
    const text = msg.toLowerCase()
    return (
      text.includes('admin access required') ||
      text.includes('missing or invalid authorization header') ||
      text.includes('token verification failed') ||
      text.includes('invalid token')
    )
  }

  function handlePageError(err) {
    const msg = err?.message || 'Request failed'
    if (isAdminValidationError(msg)) {
      setError('')
      setAuthPopupMessage(msg)
      return
    }
    setError(msg)
  }

  const hasFilters = useMemo(
    () => Boolean(searchName.trim() || searchLocation.trim()),
    [searchLocation, searchName],
  )

  const filteredHotels = useMemo(() => {
    const nameFilter = searchName.trim().toLowerCase()
    const locationFilter = searchLocation.trim().toLowerCase()

    return hotels.filter((hotel) => {
      const hotelName = (hotel.name || '').toLowerCase()
      const hotelLocation = (hotel.location || '').toLowerCase()

      const matchesName = !nameFilter || hotelName.includes(nameFilter)
      const matchesLocation = !locationFilter || hotelLocation.includes(locationFilter)

      return matchesName && matchesLocation
    })
  }, [hotels, searchLocation, searchName])

  async function loadHotels() {
    try {
      setLoading(true)
      setError('')
      const data = await listHotels()
      setHotels(data)
    } catch (err) {
      handlePageError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHotels()
  }, [])

  async function handleCreateHotel(payload) {
    try {
      setError('')
      setMessage('')
      await createHotel(payload)
      setMessage('Hotel created successfully.')
      setShowCreateForm(false)
      await loadHotels()
    } catch (err) {
      handlePageError(err)
    }
  }

  function handleDeleteHotel(hotelId) {
    setDeletingHotelId(hotelId)
  }

  async function confirmDeleteHotel() {
    if (!deletingHotelId) return

    try {
      setError('')
      setMessage('')
      await deleteHotel(deletingHotelId)
      setDeletingHotelId('')
      setMessage('Hotel deleted.')
      await loadHotels()
    } catch (err) {
      handlePageError(err)
    }
  }

  function clearSearch() {
    setSearchName('')
    setSearchLocation('')
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Header banner */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-6 py-7 text-white shadow-xl shadow-blue-950/20 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-3">
            <MdHotel size={36} className="mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Management</p>
              <h1 className="mt-1 text-2xl font-bold md:text-3xl">Admin Panel</h1>
              <p className="mt-1 text-sm text-blue-100">
                Create hotels, search quickly, and open each hotel to manage rooms.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs md:text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              Total Hotels: <strong className="text-white">{loading ? '...' : hotels.length}</strong>
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              Showing: <strong className="text-white">{loading ? '...' : filteredHotels.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Toast messages */}
      {message && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-700">{message}</p>
          <button type="button" onClick={() => setMessage('')}>
            <FiX size={16} className="text-green-500" />
          </button>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm font-medium text-rose-700">{error}</p>
          <button type="button" onClick={() => setError('')}>
            <FiX size={16} className="text-rose-500" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-blue-900">
          Hotels
          {hotels.length > 0 ? ` (${filteredHotels.length}/${hotels.length})` : ''}
        </h2>
        <button
          type="button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-900"
        >
          {showCreateForm ? <FiX size={15} /> : <FiPlus size={15} />}
          {showCreateForm ? 'Cancel' : 'New Hotel'}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl border border-blue-950/10 bg-white p-4 shadow-lg shadow-blue-950/5 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
            <FiLayers size={15} />
            Search Hotels
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearSearch}
              className="flex items-center gap-1 rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-50"
            >
              <FiX size={13} />
              Clear Search
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="relative block">
            <FiSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
              placeholder="Search by hotel name"
              className="w-full rounded-lg border border-blue-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-900 focus:outline-none"
            />
          </label>
          <label className="relative block">
            <FiMapPin size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              value={searchLocation}
              onChange={(event) => setSearchLocation(event.target.value)}
              placeholder="Search by location"
              className="w-full rounded-lg border border-blue-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-900 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Hotels grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="animate-pulse overflow-hidden rounded-2xl border border-blue-100 bg-white"
            >
              <div className="h-44 bg-blue-100" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 rounded bg-blue-100" />
                <div className="h-3 w-1/2 rounded bg-blue-100" />
                <div className="h-3 w-full rounded bg-blue-100" />
              </div>
            </div>
          ))}

        {!loading && filteredHotels.map((hotel) => (
          <HotelCard key={hotel._id} hotel={hotel} isAdmin onDelete={handleDeleteHotel} />
        ))}

        {!loading && hotels.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-10 text-center">
            <MdHotel size={36} className="mx-auto mb-3 text-blue-300" />
            <p className="text-sm text-slate-500">
              No hotels yet. Click <strong>New Hotel</strong> to get started.
            </p>
          </div>
        )}

        {!loading && hotels.length > 0 && filteredHotels.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-10 text-center">
            <FiSearch size={32} className="mx-auto mb-3 text-blue-300" />
            <p className="text-sm text-slate-500">
              No hotels found for this search.
            </p>
          </div>
        )}
      </div>

      {/* Create hotel modal */}
      {showCreateForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setShowCreateForm(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-1 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <h3 className="text-base font-semibold text-blue-900">Create New Hotel</h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close create hotel form"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-4 pt-3">
              <HotelForm
                onSubmit={handleCreateHotel}
                onCancel={() => setShowCreateForm(false)}
                formTitle="Create New Hotel"
                submitLabel="Create Hotel"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete hotel modal */}
      {deletingHotelId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setDeletingHotelId('')}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">Delete Hotel</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this hotel and all its rooms? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingHotelId('')}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteHotel}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                Delete Hotel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin auth error modal */}
      {authPopupMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setAuthPopupMessage('')}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-rose-700">Admin Validation Failed</h3>
            <p className="mt-2 text-sm text-slate-600">{authPopupMessage}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setAuthPopupMessage('')}
                className="rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminPage
