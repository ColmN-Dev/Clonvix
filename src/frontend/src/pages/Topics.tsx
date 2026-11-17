import SearchBar from '../components/SearchBar'

function Topics() {
  return (
    <main className="hero-content flex flex-1 items-start justify-center p-20 text-center">
      <div>
        <h1 className="hero-title text-5xl font-semibold text-(--hero-text)">
          Explore GitHub Topics
        </h1>
        <p className="hero-subtitle mt-4 text-(--hero-text)">
          Discover topics and explore repositories built around them.
        </p>
        <div className="mt-8">
          <SearchBar searchType="topics" />
        </div>
      </div>
    </main>
  )
}

export default Topics