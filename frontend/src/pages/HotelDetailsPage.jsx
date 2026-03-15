import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheckCircle, FiEye, FiMapPin, FiSearch, FiStar, FiUsers, FiX } from 'react-icons/fi'
import { TbCurrencyDollar } from 'react-icons/tb'
import { getHotelById, listHotelRooms } from '../api/hotelApi'
import BackButton from '../components/BackButton'

function HotelDetailsPage() {
  const { id } = useParams()
  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedGalleryImage, setSelectedGalleryImage] = useState('')
  const [roomSearch, setRoomSearch] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filteredRooms = useMemo(() => {
    const search = roomSearch.trim().toLowerCase()

    return rooms.filter((room) => {
      const typeMatch = !search || (room.type || '').toLowerCase().includes(search)

      const availabilityMatch =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && room.isAvailable) ||
        (availabilityFilter === 'unavailable' && !room.isAvailable)

      return typeMatch && availabilityMatch
    })
  }, [availabilityFilter, roomSearch, rooms])

  useEffect(() => {
    async function loadHotelData() {
      try {
        setLoading(true)
        setError('')

        const [hotelData, roomData] = await Promise.all([
          getHotelById(id),
          listHotelRooms(id),
        ])

        setHotel(hotelData)
        setRooms(roomData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadHotelData()
  }, [id])

  useEffect(() => {
    setSelectedGalleryImage(hotel?.images?.[0] || '')
  }, [hotel])

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-slate-600">
        <BackButton />
        <p className="mt-4">Loading details...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-rose-600">
        <BackButton />
        <p className="mt-4">{error}</p>
      </section>
    )
  }

  if (!hotel) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-slate-600">
        <BackButton />
        <p className="mt-4">Hotel not found.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6">
      <BackButton />

      <div className="mt-4 overflow-hidden rounded-3xl border border-blue-950/10 bg-white shadow-xl shadow-blue-950/10">
        <div className="relative h-64 md:h-80">
          {hotel.images?.[0] ? (
            <img src={hotel.images[0]} alt={hotel.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-950 to-blue-800" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/85 via-blue-950/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
            <h1 className="text-3xl font-bold md:text-4xl">{hotel.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-blue-100">
              <FiMapPin size={14} />
              {hotel.location}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm">
              <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                <FiStar size={13} className="mr-1 inline text-amber-300" />
                Rating: {hotel.rating ?? 0}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                Rooms: {rooms.length}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 md:p-8">
          <div className="rounded-2xl bg-blue-50/60 p-5">
            <h2 className="mb-2 text-lg font-semibold text-blue-900">About This Hotel</h2>
            <p className="text-sm leading-relaxed text-slate-700">
              {hotel.description || 'No description available.'}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-blue-900">Amenities</h2>
            {hotel.amenities?.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {hotel.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2"
                  >
                    <FiCheckCircle size={14} className="text-blue-700" />
                    <span className="text-sm font-medium text-slate-700">{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-blue-50 px-4 py-4 text-sm text-slate-600">
                No amenities listed for this hotel.
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-blue-900">Gallery</h2>
            {hotel.images?.length > 0 ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <img
                  src={selectedGalleryImage || hotel.images[0]}
                  alt={`${hotel.name} selected preview`}
                  className="h-64 w-full rounded-2xl object-cover"
                />

                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {hotel.images.map((image, index) => {
                    const isActive = (selectedGalleryImage || hotel.images[0]) === image

                    return (
                      <button
                        key={`${image.slice(0, 20)}-${index}`}
                        type="button"
                        onClick={() => setSelectedGalleryImage(image)}
                        className={`overflow-hidden rounded-lg border-2 ${
                          isActive ? 'border-blue-700' : 'border-transparent'
                        }`}
                        title={`View photo ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${hotel.name} ${index + 1}`}
                          className="h-16 w-full object-cover"
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-blue-50 px-4 py-8 text-sm text-slate-600">
                No hotel photos uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-blue-900">Rooms</h2>
        <p className="text-sm text-slate-500">
          Showing {filteredRooms.length} of {rooms.length}
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-blue-950/10 bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="relative block">
            <FiSearch
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
            />
            <input
              value={roomSearch}
              onChange={(event) => setRoomSearch(event.target.value)}
              placeholder="Search room type"
              className="w-full rounded-lg border border-blue-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </label>

          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
            className="w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="all">All Rooms</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRooms.map((room) => (
          <article
            key={room._id}
            className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200/40"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-600" />

            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{room.type}</p>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    room.isAvailable
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border border-slate-200 bg-slate-100 text-slate-600'
                  }`}
                >
                  {room.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRoom(room)}
                  className="inline-flex items-center gap-1 rounded-md border border-blue-300 bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200"
                >
                  <FiEye size={12} />
                  View
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-sm text-slate-600">
              <p className="flex items-center gap-1">
                <TbCurrencyDollar size={16} className="text-blue-700" />
                {room.price} / night
              </p>
              <p className="flex items-center gap-1">
                <FiUsers size={14} className="text-blue-700" />
                Capacity: {room.capacity}
              </p>
            </div>
          </article>
        ))}

        {rooms.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-8 text-center text-sm text-slate-600">
            No rooms available for this hotel.
          </div>
        )}

        {rooms.length > 0 && filteredRooms.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-8 text-center text-sm text-slate-600">
            No rooms found for this filter.
          </div>
        )}
      </div>

      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-900">Room Details</h3>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close room details"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Room Type</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{selectedRoom.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Price</p>
                <p className="mt-1 text-sm font-medium text-slate-900">${selectedRoom.price} / night</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Capacity</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{selectedRoom.capacity} guests</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    selectedRoom.isAvailable ? 'text-green-700' : 'text-slate-600'
                  }`}
                >
                  {selectedRoom.isAvailable ? 'Available for booking' : 'Currently unavailable'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default HotelDetailsPage
