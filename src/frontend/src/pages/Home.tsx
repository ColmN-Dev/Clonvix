import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import SearchBar from "../components/SearchBar"
import TrendingCard, { type TrendingRepo } from "../components/TrendingCard";
import Dropdown from "../components/Dropdown";

function Home() {

  // Store the trending repositories from the API
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([]);

  type DateRange = "daily" | "weekly" | "monthly";

  // Get the date range from the URL search parameters, default to "daily"
  const [searchParams, setSearchParams] = useSearchParams();
  const dateRange = (searchParams.get("range") ?? "daily") as DateRange;

  // Define the options for the date range dropdown
  const dateRangeOptions = [
    { label: "Today", value: "daily" },
    { label: "This week", value: "weekly" },
    { label: "This month", value: "monthly" },
  ];

  useEffect(() => {
  document.title = 'Home | Clonvix';

    // Fetch trending repositories from the backend
    const fetchTrendingRepos = async () => {
    try {
      const response = await fetch(`/api/github/trending/?range=${dateRange}`);

      // Check if the request was successful
      if (!response.ok) {
        throw new Error("Failed to fetch trending repositories");
      }

      // Convert the response into JSON
      const data: TrendingRepo[] = await response.json();

      // Update the trending repository state with the fetched data 
      setTrendingRepos(data);

    } catch (error) {
      console.error("Error fetching trending repositories:", error);
    }
  };

  fetchTrendingRepos();

  }, [dateRange]);

  return (

  <main>
    <section className="hero-content flex flex-1 items-start justify-center p-20 text-center">
      <div>
        <h1 className="hero-title text-5xl font-semibold text-(--hero-text)">
          Explore GitHub Repositories
        </h1>
        <p className="hero-subtitle mt-4 text-(--hero-text)">
          Search public repositories, explore source code, and connect with developers.
        </p>
        <div className="mt-8">
          <SearchBar />
        </div>
      </div>
    </section>

    <section className="featured-repos py-10">
      <div className="container mx-auto px-4">
        <div className="trending-toolbar">
          <h2 className="text-3xl font-semibold">Trending Repositories</h2>
          <Dropdown
            label="Date range:"
            value={dateRange}
            onChange={(value) => {
              searchParams.set("range", value);
              setSearchParams(searchParams);
            }}
            options={dateRangeOptions}
          />
        </div>
        
        <div className="trending-card-list grid grid-cols-1 gap-6">
          {/* Render the trending repositories using the TrendingCard component */}
          {trendingRepos.length === 0 && (
            <p>No trending repositories found</p>
          )}

          {trendingRepos.map((repo) => (
            <TrendingCard
              key={repo.github_id}
              repo={repo}
              dateRange={dateRange}
            />
          ))}
        </div>
      </div>
    </section>

  </main>
  
  )
}

export default Home