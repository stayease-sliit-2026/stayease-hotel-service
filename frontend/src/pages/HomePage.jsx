import { useEffect, useMemo, useState } from 'react'
import { FiMapPin, FiSearch, FiSliders, FiStar, FiX } from 'react-icons/fi'
import HotelCard from '../components/HotelCard'
import { listHotels } from '../api/hotelApi'

function HomePage() {
  const [hotels, setHotels] = useState([])
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [minRating, setMinRating] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const hasFilters = useMemo(
    () => Boolean(query.trim() || location.trim() || minRating),
    [location, minRating, query],
  )

  useEffect(() => {
    async function loadHotels() {
      try {
        setLoading(true)
        setError('')

        const data = await listHotels({
          q: query || undefined,
          location: location || undefined,
          minRating: minRating || undefined,
        })

        setHotels(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadHotels()
  }, [query, location, minRating])

  function clearFilters() {
    setQuery('')
    setLocation('')
    setMinRating('')
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-6 py-8 text-white shadow-xl shadow-blue-950/20 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">StayEase</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">Find Your Perfect Stay</h1>
        <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
          Explore hotels by name, location, and rating. Pick a place that fits your travel plan.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <div className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">
            Hotels available: <span className="font-semibold text-white">{loading ? '...' : hotels.length}</span>
          </div>
          <div className="rounded-full bg-white/15 px-4 py-1.5 backdrop-blur">Quick and simple search</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-blue-950/10 bg-white p-4 shadow-lg shadow-blue-950/5 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
            <FiSliders size={16} />
            Filter Hotels
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-50"
            >
              <FiX size={13} />
              Clear
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="relative block">
            <FiSearch size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hotel name"
              className="w-full rounded-lg border border-blue-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </label>

          <label className="relative block">
            <FiMapPin size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full rounded-lg border border-blue-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </label>

          <label className="relative block">
            <FiStar size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="Minimum rating"
              className="w-full rounded-lg border border-blue-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {loading && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-2xl border border-blue-100 bg-white"
            >
              <div className="h-44 bg-blue-100" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 rounded bg-blue-100" />
                <div className="h-3 w-1/2 rounded bg-blue-100" />
                <div className="h-3 w-full rounded bg-blue-100" />
                <div className="h-3 w-4/5 rounded bg-blue-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4 mt-6 text-sm text-slate-600">
            Showing <span className="font-semibold text-blue-900">{hotels.length}</span> hotel{hotels.length === 1 ? '' : 's'}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}

            {hotels.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-10 text-center">
                <FiSearch size={32} className="mx-auto mb-3 text-blue-300" />
                <p className="text-sm text-slate-600">No hotels found for these filters.</p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default HomePage
