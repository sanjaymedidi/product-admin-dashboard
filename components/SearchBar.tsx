interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  category: string
  categories: string[]
  onCategoryChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
}

export default function SearchBar({
  value,
  onChange,
  category,
  categories,
  onCategoryChange,
  sortBy,
  onSortChange,
}: SearchBarProps) {
  return (
    <div className="mb-6 grid gap-4 rounded-lg bg-white p-4 shadow md:grid-cols-3">
      {/* Search */}
      <div>
        <label
          htmlFor="product-search"
          className="mb-2 block font-medium text-orange-500 font-sans"
        >
          Search Products
        </label>

        <input
          id="product-search"
          type="search"
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border text-black p-3 outline-none focus:ring-2"
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="mb-2 block font-medium text-orange-500 font-sans"
        >
          Category
        </label>

        <select
          id="category"
          value={category}
          onChange={event =>
            onCategoryChange(event.target.value)
          }
          className="w-full rounded-lg border bg-white text-black p-3"
        >
          <option value="">All Categories</option>

          {categories.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label
          htmlFor="sort"
          className="mb-2 block font-medium text-orange-500 font-sans"
        >
          Sort By
        </label>

        <select
          id="sort"
          value={sortBy}
          onChange={event =>
            onSortChange(event.target.value)
          }
          className="w-full rounded-lg border bg-white text-black p-3"
        >
          <option value="">Default</option>

          <option value="price-asc">
            Price: Low to High
          </option>

          <option value="price-desc">
            Price: High to Low
          </option>

          <option value="rating-desc">
            Rating: High to Low
          </option>

          <option value="rating-asc">
            Rating: Low to High
          </option>

          <option value="title-asc">
            Title: A to Z
          </option>

          <option value="title-desc">
            Title: Z to A
          </option>
        </select>
      </div>
    </div>
  )
}