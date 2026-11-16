import { Routes, Route, Navigate } from 'react-router'
import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import ColmNDev from './pages/ColmN-Dev'
import Contact from './pages/Contact'
import SearchResults from './pages/SearchResults'
import RepositoryDetail from './pages/RepositoryDetail'
import LoadingState from './components/LoadingState'

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
          <Route path="/colmn-dev" element={<Navigate to="/ColmN-Dev" replace />} />
          <Route path="/ColmN-Dev" element={<ColmNDev />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<SearchResults loading={loading} setLoading={setLoading} />} />
          <Route path="/:owner/:repo" element={<RepositoryDetail setLoading={setLoading} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App