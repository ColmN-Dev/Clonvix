import { useEffect, useState } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router'
import SearchBar from '../components/SearchBar'
import TrendingCard, { type TrendingRepo } from '../components/TrendingCard'
import Dropdown from '../components/Dropdown'

type HomePageProps = {
  setLoading: (loading: boolean) => void;
  setUser: (user: { id: number; email: string; username: string } | null) => void;
};

function Home({ setLoading, setUser }: HomePageProps) {

  // React Router hooks
  const location = useLocation()
  const navigate = useNavigate()

  // Success message state
  const [successMessage, setSuccessMessage] = useState(location.state?.accountDeleted ? 'Account deleted successfully.' : '')

  // Trending repositories state
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([])

  // Date range state from URL search parameters
  const [searchParams, setSearchParams] = useSearchParams()

  type DateRange = "daily" | "weekly" | "monthly";
  const dateRange = (searchParams.get("range") ?? "daily") as DateRange;

  // Date range dropdown options
  const dateRangeOptions = [
    { label: "Today", value: "daily" },
    { label: "This week", value: "weekly" },
    { label: "This month", value: "monthly" },
  ];

  // Check whether the user arrived after deleting their account
  useEffect(() => {
    if (location.state?.accountDeleted) {
      // Clear navigation state so the message doesn't reappear on refresh
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: null
      })

      // Clear the user state after redirecting to homepage
      window.setTimeout(() => setUser(null), 0)
    }
  }, [location, navigate, setUser])

  // Automatically clear the success message after five seconds
  useEffect(() => {
    if (!successMessage) return

    const timeout = window.setTimeout(() => {
      setSuccessMessage('')
    }, 5000)

    return () => window.clearTimeout(timeout)
  }, [successMessage])

  useEffect(() => {
  document.title = 'Home | Clonvix';

    // Fetch trending repositories from the backend
    const fetchTrendingRepos = async () => {
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  fetchTrendingRepos();

  }, [dateRange, setLoading]);

  return (

    <main>
      <section className="hero-content flex flex-1 items-start justify-center p-20 text-center">
        <div>
          {successMessage && (<p className="delete-account-success">{successMessage}</p>)}
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
              <p className="page-status">No trending repositories found</p>
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