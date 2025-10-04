function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    
<footer className="mt-auto bg-gray-900 text-white py-4">
  <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
    <p>© 2025 - { new Date().getFullYear()} DR-Detect AI.</p>
  </div>
</footer>

  )
}
