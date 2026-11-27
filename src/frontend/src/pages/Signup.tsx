import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
import { scrollToTop } from '../utils/scrollToTop'

type SignupProps = {
    user: { id: number; email: string; username: string } | null
}

function Signup({ user }: SignupProps) {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        if (!message && !error) return

        const timeout = window.setTimeout(() => {
            setMessage('')
            setError('')
        }, 5000)

        return () => window.clearTimeout(timeout)
    }, [message, error])

    useEffect(() => {
        document.title = 'Sign up | Clonvix'
    }, [])

    // Handle user signup
    const handleSignup = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMessage('')

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        try {
            // Retrieve the CSRF cookie
            await fetch('/api/accounts/csrf/', {
                credentials: 'include',
            })

            const csrfToken = document.cookie
                .split('; ')
                .find((cookie) => cookie.startsWith('csrftoken='))
                ?.split('=')[1]

            const response = await fetch('/api/accounts/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken || '',
                },
                credentials: 'include',
                body: JSON.stringify({ email, username, password, confirmPassword }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || data.errors?.join(' ') || 'Signup failed')
            }

            scrollToTop()
            setMessage(data.message)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong')
        }
    }

    useEffect(() => {
        if (!message) return

        const timeout = window.setTimeout(() => {
            navigate('/login')
        }, 5000)

        return () => window.clearTimeout(timeout)
    }, [message, navigate])

    if (user) return <Navigate to="/" replace />

  return (
    <div className="auth-container">
        <div className="auth-card">
            <h1>Create an account</h1>

            {error && <p className="error-message auth-message">{error}</p>}
            {message && <p className="success-message auth-message">{message}</p>}

            <form className="auth-form" onSubmit={handleSignup}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
            />

            <div className="password-input-wrapper">
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />

                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <div className="password-input-wrapper">
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                />
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showConfirmPassword}
                >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <button type="submit">Sign up</button>
            </form>
        </div>
        <div className="auth-switch">
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
    </div>
  )
}

export default Signup
