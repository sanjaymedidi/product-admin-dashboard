interface PaginationProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export default function Pagination({
  page,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit)

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-gray-600">
        Showing {startItem}–{endItem} of {total}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="page-size" className="text-sm text-black">
          Page size:
        </label>

        <select
          id="page-size"
          value={limit}
          onChange={event => onLimitChange(Number(event.target.value))}
          className="rounded border px-3 py-2 text-black"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40 text-white bg-blue-700 border-none"
        >
          Previous
        </button>

        {Array.from({length: totalPages}, (_, index) => index + 1).map(
          pageNumber => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`rounded border px-3 py-2 ${
                pageNumber === page
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
            >
              {pageNumber}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40 text-white bg-blue-700 border-none"
        >
          Next
        </button>
      </div>
    </div>
  )
}