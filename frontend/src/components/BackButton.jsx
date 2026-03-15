import { useNavigate } from 'react-router-dom'

function BackButton({ fallbackPath = '/', label = 'Back' }) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(fallbackPath)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
    >
      &larr; {label}
    </button>
  )
}

export default BackButton
