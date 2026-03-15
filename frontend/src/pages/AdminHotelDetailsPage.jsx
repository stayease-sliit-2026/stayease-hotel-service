import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft,
  FiEdit2,
  FiEye,
  FiMapPin,
  FiPlus,
  FiStar,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'
import { TbCurrencyDollar } from 'react-icons/tb'
import {
  addRoomToHotel,
  deleteRoom,
  getHotelById,
  listHotelRooms,
  updateHotel,
  updateRoom,
} from '../api/hotelApi'
import HotelForm from '../components/HotelForm'
import RoomForm from '../components/RoomForm'

function AdminHotelDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [authPopupMessage, setAuthPopupMessage] = useState('')

  const [showHotelForm, setShowHotelForm] = useState(false)
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [viewingRoom, setViewingRoom] = useState(null)
  const [deletingRoom, setDeletingRoom] = useState(null)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState('')

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

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [hotelData, roomData] = await Promise.all([getHotelById(id), listHotelRooms(id)])
      setHotel(hotelData)
      setRooms(roomData)
    } catch (err) {
      handlePageError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    setSelectedGalleryImage(hotel?.images?.[0] || '')
  }, [hotel])

  async function handleHotelUpdate(payload) {
    try {
      setError('')
      setMessage('')
      await updateHotel(id, payload)
      const updated = await getHotelById(id)
      setHotel(updated)
      setShowHotelForm(false)
      setMessage('Hotel updated successfully.')
    } catch (err) {
      handlePageError(err)
    }
  }

  async function handleRoomSubmit(payload) {
    try {
      setError('')
      setMessage('')
      if (editingRoom) {
        await updateRoom(id, editingRoom._id, payload)
        setMessage('Room updated successfully.')
        setEditingRoom(null)
      } else {
        await addRoomToHotel(id, payload)
        setMessage('Room added successfully.')
      }
      setShowRoomForm(false)
      const roomData = await listHotelRooms(id)
      setRooms(roomData)
    } catch (err) {
      handlePageError(err)
    }
  }

  function handleOpenEditRoom(room) {
    setEditingRoom(room)
    setShowRoomForm(true)
    setViewingRoom(null)
  }

  function handleCancelRoomForm() {
    setShowRoomForm(false)
    setEditingRoom(null)
  }

  async function handleDeleteRoom() {
    if (!deletingRoom) return

    try {
      setError('')
      setMessage('')
      await deleteRoom(id, deletingRoom._id)
      setMessage('Room deleted.')
      if (editingRoom?._id === deletingRoom._id) {
        setEditingRoom(null)
        setShowRoomForm(false)
      }
      if (viewingRoom?._id === deletingRoom._id) {
        setViewingRoom(null)
      }
      setDeletingRoom(null)
      const roomData = await listHotelRooms(id)
      setRooms(roomData)
    } catch (err) {
      handlePageError(err)
    }
  }

  function handleOpenViewRoom(room) {
    setViewingRoom(room)
  }

  function handleOpenDeleteRoom(room) {
    setDeletingRoom(room)
  }

  function handleToggleAddRoom() {
    if (showRoomForm && !editingRoom) {
      setShowRoomForm(false)
    } else {
      setEditingRoom(null)
      setShowRoomForm(true)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="animate-pulse overflow-hidden rounded-3xl border border-blue-100 bg-white">
          <div className="h-72 bg-blue-100" />
          <div className="space-y-3 p-6">
            <div className="h-6 w-1/3 rounded bg-blue-100" />
            <div className="h-4 w-1/4 rounded bg-blue-100" />
            <div className="h-4 w-3/4 rounded bg-blue-100" />
          </div>
        </div>
      </div>
    )
  }

  if (!hotel && error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-sm text-rose-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="mt-4 text-sm text-blue-700 underline"
        >
          Back to Admin
        </button>
      </div>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/admin')}
        className="mb-5 flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50"
      >
        <FiArrowLeft size={15} />
        Back to Admin
      </button>

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

      {/* Hotel Hero Card */}
      {hotel && (
        <div className="mb-6 overflow-hidden rounded-3xl border border-blue-950/10 bg-white shadow-xl shadow-blue-950/10">
          <div className="relative h-64 md:h-80">
            {hotel.images?.[0] ? (
              <img src={hotel.images[0]} alt={hotel.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-r from-blue-950 to-blue-800">
                <MdHotel size={56} className="text-blue-300/50" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/85 via-blue-950/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold md:text-4xl">{hotel.name}</h1>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-blue-100">
                    <FiMapPin size={14} />
                    {hotel.location}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHotelForm((prev) => !prev)}
                  className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
                >
                  {showHotelForm ? <FiX size={14} /> : <FiEdit2 size={14} />}
                  {showHotelForm ? 'Cancel' : 'Edit Hotel'}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm">
                <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
                  <FiStar size={13} className="mr-1 inline text-amber-300" />
                  Rating: {hotel.rating ?? 0}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">Rooms: {rooms.length}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6 md:p-8">
            {hotel.description && (
              <div className="rounded-2xl bg-blue-50/60 p-4">
                <p className="text-sm leading-relaxed text-slate-700">{hotel.description}</p>
              </div>
            )}

            {hotel.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-900">Photo Gallery</h3>
                <span className="text-xs text-slate-500">{hotel.images?.length || 0} photos</span>
              </div>

              {hotel.images?.length > 0 ? (
                <>
                  <img
                    src={selectedGalleryImage || hotel.images[0]}
                    alt={`${hotel.name} selected preview`}
                    className="h-64 w-full rounded-2xl object-cover"
                  />

                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                    {hotel.images.map((img, idx) => {
                      const isActive = (selectedGalleryImage || hotel.images[0]) === img

                      return (
                        <button
                          key={`${img.slice(0, 15)}-${idx}`}
                          type="button"
                          onClick={() => setSelectedGalleryImage(img)}
                          className={`overflow-hidden rounded-lg border-2 ${
                            isActive ? 'border-blue-700' : 'border-transparent'
                          }`}
                          title={`View photo ${idx + 1}`}
                        >
                          <img
                            src={img}
                            alt={`${hotel.name} ${idx + 1}`}
                            className="h-16 w-full object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="rounded-xl bg-white px-4 py-8 text-center text-sm text-slate-500">
                  No photos uploaded for this hotel.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rooms Panel */}
      <div className="overflow-hidden rounded-3xl border border-blue-950/10 bg-white shadow-xl shadow-blue-950/10">
        {/* Rooms header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-950/10 bg-blue-50/50 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-blue-900">
              Rooms{rooms.length > 0 ? ` (${rooms.length})` : ''}
            </h2>
            <p className="text-xs text-slate-500">View, update, or delete room records</p>
          </div>
          <button
            type="button"
            onClick={handleToggleAddRoom}
            className="flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
          >
            {showRoomForm && !editingRoom ? <FiX size={14} /> : <FiPlus size={14} />}
            {showRoomForm && !editingRoom ? 'Cancel' : 'Add Room'}
          </button>
        </div>

        {/* Rooms table */}
        {rooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-950/10 bg-blue-50/60 text-left text-xs font-semibold uppercase tracking-wider text-blue-900">
                  <th className="px-6 py-3">Room Type</th>
                  <th className="px-6 py-3">Price / Night</th>
                  <th className="px-6 py-3">Capacity</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-950/5">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-blue-50/30">
                    <td className="px-6 py-4 font-medium text-slate-900">{room.type}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="flex items-center gap-0.5">
                        <TbCurrencyDollar size={14} />
                        {room.price}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <FiUsers size={13} />
                        {room.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          room.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {room.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenViewRoom(room)}
                          className="flex items-center gap-1 rounded-md border border-blue-200 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                        >
                          <FiEye size={12} />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditRoom(room)}
                          className="flex items-center gap-1 rounded-md border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                        >
                          <FiEdit2 size={12} />
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteRoom(room)}
                          className="flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          <FiTrash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <MdHotel size={40} className="mb-3 text-blue-200" />
            <p className="text-sm text-slate-500">
              No rooms yet. Click <strong>Add Room</strong> to create the first room.
            </p>
          </div>
        )}
      </div>

      {/* Room form modal (create / edit) */}
      {showRoomForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={handleCancelRoomForm}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-1 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <h3 className="text-base font-semibold text-blue-900">
                {editingRoom ? 'Update Room' : 'Add New Room'}
              </h3>
              <button
                type="button"
                onClick={handleCancelRoomForm}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close room form"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-4 pt-3">
              <RoomForm
                initialValues={editingRoom}
                onSubmit={handleRoomSubmit}
                onCancel={handleCancelRoomForm}
                formTitle={editingRoom ? 'Edit Room Details' : 'Create Room'}
                submitLabel={editingRoom ? 'Save Changes' : 'Add Room'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hotel form modal (edit) */}
      {showHotelForm && hotel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setShowHotelForm(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-1 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <h3 className="text-base font-semibold text-blue-900">Edit Hotel</h3>
              <button
                type="button"
                onClick={() => setShowHotelForm(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close hotel form"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-4 pt-3">
              <HotelForm
                initialValues={hotel}
                onSubmit={handleHotelUpdate}
                onCancel={() => setShowHotelForm(false)}
                formTitle="Edit Hotel Details"
                submitLabel="Save Changes"
              />
            </div>
          </div>
        </div>
      )}

      {/* Room view modal */}
      {viewingRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setViewingRoom(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-900">Room Details</h3>
              <button
                type="button"
                onClick={() => setViewingRoom(null)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close room details"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Room Type
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">{viewingRoom.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Price
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  ${viewingRoom.price} / night
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Capacity
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">{viewingRoom.capacity} guests</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Availability
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    viewingRoom.isAvailable ? 'text-green-700' : 'text-slate-500'
                  }`}
                >
                  {viewingRoom.isAvailable ? 'Available for booking' : 'Currently unavailable'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room delete modal */}
      {deletingRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setDeletingRoom(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">Delete Room</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{deletingRoom.type}</strong>? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingRoom(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRoom}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                Delete Room
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

export default AdminHotelDetailsPage
