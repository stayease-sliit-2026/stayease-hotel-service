import { useEffect, useState } from 'react'

const defaultState = {
  type: '',
  price: 0,
  capacity: 1,
  isAvailable: true,
}

function RoomForm({
  initialValues,
  onCancel,
  onSubmit,
  formTitle = 'Room Form',
  submitLabel = 'Add Room',
}) {
  const [form, setForm] = useState(defaultState)

  useEffect(() => {
    if (!initialValues) {
      setForm(defaultState)
      return
    }

    setForm({
      type: initialValues.type || '',
      price: initialValues.price ?? 0,
      capacity: initialValues.capacity ?? 1,
      isAvailable: initialValues.isAvailable ?? true,
    })
  }, [initialValues])

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    if (name === 'price' || name === 'capacity') {
      setForm((prev) => ({ ...prev, [name]: Number(value) }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await onSubmit?.(form)

    if (!initialValues) {
      setForm(defaultState)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-blue-950/10 bg-white p-5 shadow-lg shadow-blue-950/5"
    >
      <div className="rounded-xl bg-gradient-to-r from-blue-950 to-blue-800 px-4 py-4 text-white">
        <h3 className="text-lg font-semibold">{formTitle}</h3>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-900">Room Type</label>
        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Room type"
          required
          className="w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm focus:border-blue-900 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-900">Price (USD)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              $
            </span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              required
              className="w-full rounded-lg border border-blue-200 py-2.5 pl-7 pr-3 text-sm focus:border-blue-900 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-900">Capacity</label>
          <input
            name="capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm focus:border-blue-900 focus:outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-slate-700">
        <input
          name="isAvailable"
          type="checkbox"
          checked={form.isAvailable}
          onChange={handleChange}
        />
        Available for booking
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-900"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-medium text-blue-900 hover:bg-blue-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default RoomForm
