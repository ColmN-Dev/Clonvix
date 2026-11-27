import { Routes, Route, Navigate } from 'react-router'
import { useState, useEffect, lazy, Suspense } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import LoadingState from './components/LoadingState'
import Topics from './pages/Topics'
import TopicDetail from './pages/TopicDetail'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import AccountSettings from './pages/AccountSettings'
import VerifyEmailChange from './pages/VerifyEmailChange'
const SearchResults = lazy(() => import('./pages/SearchResults'))
const RepositoryDetail = lazy(() => import('./pages/RepositoryDetail'))
const GitHubProfile = lazy(() => import('./pages/GitHubProfile'))

function App() {

  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState<{ id: number; email: string; username: string } | null>(null)

  // Check if the user is already authenticated when the app loads
  useEffect(() => {
      const checkAuth = async () => {
          try {
              const response = await fetch('/api/accounts/me/', {
                  credentials: 'include',
              })

              const data = await response.json()

              if (data.authenticated) {
                  setUser(data.user)
              }
          } catch (error) {
              console.error('Failed to check authentication:', error)
          } finally {
              setLoading(false)
          }
      }

      checkAuth()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {loading && <LoadingState />}
      <Header user={user} setUser={setUser} />
      <main className="flex flex-1 flex-col bg-(--bg-primary)">
        <Routes>
          <Route path="/" element={<Home setLoading={setLoading} setUser={setUser} />} />
          <Route path="/about" element={<About />} />
          <Route path="/ColmN-Dev" element={<Suspense fallback={<LoadingState />}><GitHubProfile setLoading={setLoading} /></Suspense>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<Suspense fallback={<LoadingState />}><SearchResults loading={loading} setLoading={setLoading} /></Suspense>} />
          <Route path="/signup" element={<Signup user={user} />} />
          <Route path="/login" element={<Login user={user} setUser={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/profile" element={loading ? <LoadingState /> : user ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/edit-profile" element={loading ? <LoadingState /> : user ? <EditProfile /> : <Navigate to="/login" replace />} />
          <Route path="/account-settings" element={loading ? <LoadingState /> : user ? <AccountSettings /> : <Navigate to="/login" replace />} />
          <Route path="/verify-email-change/:token" element={<Suspense fallback={<LoadingState />}><VerifyEmailChange /></Suspense>} />
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