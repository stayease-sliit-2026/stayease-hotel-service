import { useEffect, useState } from 'react'

const defaultState = {
  name: '',
  location: '',
  description: '',
  rating: 0,
  amenitiesText: '',
  images: [],
}

function readFilesAsDataUrls(files) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
          reader.readAsDataURL(file)
        }),
    ),
  )
}

function FieldLabel({ title, hint }) {
  return (
    <div className="mb-1">
      <label className="block text-sm font-medium text-slate-900">{title}</label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function HotelForm({
  initialValues,
  onCancel,
  onSubmit,
  formTitle = 'Hotel Form',
  submitLabel = 'Save Hotel',
}) {
  const [form, setForm] = useState(defaultState)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!initialValues) {
      setForm(defaultState)
      return
    }

    setForm({
      name: initialValues.name || '',
      location: initialValues.location || '',
      description: initialValues.description || '',
      rating: initialValues.rating ?? 0,
      amenitiesText: (initialValues.amenities || []).join(', '),
      images: initialValues.images || [],
    })
  }, [initialValues])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }))
  }

  async function handleImageUpload(event) {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) {
      return
    }

    try {
      setUploadError('')
      const imageUrls = await readFilesAsDataUrls(files)
      setForm((prev) => ({ ...prev, images: [...prev.images, ...imageUrls] }))
      event.target.value = ''
    } catch (error) {
      setUploadError(error.message)
    }
  }

  function handleRemoveImage(indexToRemove) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      rating: form.rating,
      amenities: form.amenitiesText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      images: form.images,
    }

    await onSubmit?.(payload)

    if (!initialValues) {
      setForm(defaultState)
      setUploadError('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-blue-950/10 bg-white p-5 shadow-lg shadow-blue-950/5"
    >
      <div className="rounded-xl bg-gradient-to-r from-blue-950 to-blue-800 px-4 py-4 text-white">
        <h3 className="text-lg font-semibold">{formTitle}</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel title="Hotel Name" />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Hotel name"
            required
            className="w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm focus:border-blue-900 focus:outline-none"
          />
        </div>

        <div>
          <FieldLabel title="Location" />
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            required
            className="w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm focus:border-blue-900 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <FieldLabel title="Description" />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          rows={4}
          className="w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm focus:border-blue-900 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel title="Rating" hint="0 to 5" />
          <input
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={handleChange}
            className="w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm focus:border-blue-900 focus:outline-none"
          />
        </div>

        <div>
          <FieldLabel title="Amenities" hint="Comma separated" />
          <input
            name="amenitiesText"
            value={form.amenitiesText}
            onChange={handleChange}
            placeholder="Pool, Wi-Fi, Parking"
            className="w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm focus:border-blue-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <FieldLabel title="Hotel Images" hint="Upload one or more" />
          <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-6 text-center hover:bg-blue-100">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <span className="text-sm font-medium text-blue-900">Choose Images</span>
          </label>
          {uploadError && <p className="mt-2 text-sm text-rose-600">{uploadError}</p>}
        </div>

        {form.images.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-900">Selected Images</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {form.images.map((image, index) => (
                <div key={`${image.slice(0, 20)}-${index}`} className="overflow-hidden rounded-xl border border-blue-100 bg-white">
                  <img
                    src={image}
                    alt={`Hotel preview ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="w-full border-t border-blue-100 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                  >
                    Remove Image
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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

export default HotelForm
