import { Link } from 'react-router-dom'
import { FiEye, FiMapPin, FiSettings, FiStar, FiTrash2 } from 'react-icons/fi'

function HotelCard({ hotel, isAdmin = false, onDelete }) {
  const primaryImage = hotel.images?.[0]

  return (
    <article className="overflow-hidden rounded-2xl border border-blue-950/10 bg-white shadow-md transition hover:shadow-xl hover:shadow-blue-950/10">
      <div className="h-44 bg-blue-950/5">
        {primaryImage ? (
          <img src={primaryImage} alt={hotel.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-950 to-blue-800 text-sm font-medium text-blue-100">
            No Image
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="text-xl font-semibold text-slate-800">{hotel.name}</h2>

        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <FiMapPin size={12} />
          {hotel.location}
        </p>

        <p className="mt-1 flex items-center gap-1 text-sm">
          <FiStar size={12} className="text-amber-400" />
          <span className="font-medium text-slate-700">{hotel.rating ?? 0}</span>
        </p>

        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {hotel.description || 'No description yet.'}
        </p>

        {hotel.amenities?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {isAdmin ? (
            <>
              <Link
                to={`/admin/hotels/${hotel._id}`}
                className="flex items-center gap-1.5 rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
              >
                <FiSettings size={14} />
                Manage
              </Link>
              <button
                type="button"
                onClick={() => onDelete?.(hotel._id)}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
              >
                <FiTrash2 size={14} />
                Delete
              </button>
            </>
          ) : (
            <Link
              to={`/hotels/${hotel._id}`}
              className="flex items-center gap-1.5 rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
            >
              <FiEye size={14} />
              View Details
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export default HotelCard