function Home() {
  return (

    <main>
      <section className=" hero-content flex flex-1 items-start justify-center p-10 text-center">
      <div>
        <h1 className=" hero-title text-5xl font-semibold text-(--hero-text)">
          Explore GitHub Repositories
        </h1>
        <p className=" hero-subtitle mt-4 text-(--hero-text)">
          Search public repositories, explore source code, and connect with developers.
        </p>
      </div>
    </section>

    <section className="featured-repos py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold mb-6 text-center">Featured Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add your featured repository cards here */}
        </div>
      </div>
    </section>

    </main>
  )
}

export default Home