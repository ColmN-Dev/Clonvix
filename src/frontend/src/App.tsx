import { Routes, Route } from 'react-router'
import { useState, lazy, Suspense } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import LoadingState from './components/LoadingState'
import Topics from './pages/Topics'
import TopicDetail from './pages/TopicDetail'

const SearchResults = lazy(() => import('./pages/SearchResults'))
const RepositoryDetail = lazy(() => import('./pages/RepositoryDetail'))
const GitHubProfile = lazy(() => import('./pages/GitHubProfile'))

function App() {

  const [loading, setLoading] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      {loading && <LoadingState />}
      <Header />
      <main className="flex flex-1 flex-col bg-(--bg-primary)">
        <Routes>
          <Route path="/" element={<Home setLoading={setLoading} />} />
          <Route path="/about" element={<About />} />
          <Route path="/ColmN-Dev" element={<Suspense fallback={<LoadingState />}><GitHubProfile setLoading={setLoading} /></Suspense>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<Suspense fallback={<LoadingState />}><SearchResults loading={loading} setLoading={setLoading} /></Suspense>} />
          <Route path="/:username" element={<Suspense fallback={<LoadingState />}><GitHubProfile setLoading={setLoading} /></Suspense>} />
          <Route path="/:owner/:repo" element={<Suspense fallback={<LoadingState />}><RepositoryDetail setLoading={setLoading} /></Suspense>} />
          <Route path="/topics/" element={<Topics />} />
          <Route path="/topics/:topic" element={<TopicDetail loading={loading} setLoading={setLoading} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App