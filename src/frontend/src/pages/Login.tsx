
import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
import { scrollToTop } from '../utils/scrollToTop'

type LoginProps = {
    user: { id: number; email: string; username: string } | null
    setUser: React.Dispatch<React.SetStateAction<{ id: number; email: string; username: string } | null>>
}

function Login({ user, setUser }: LoginProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
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
        document.title = 'Log in | Clonvix'
    }, [])

    // Handle user login
    const handleLogin = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMessage('')

        try {
            // Get the CSRF cookie before making the POST request
            await fetch('/api/accounts/csrf/', {
            credentials: 'include',
            })

            const csrfToken = document.cookie
            .split('; ')
            .find((cookie) => cookie.startsWith('csrftoken='))
            ?.split('=')[1]

            const response = await fetch('/api/accounts/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken || '',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
            throw new Error(data.error || 'Login failed')
            }

            scrollToTop()
            setUser(data.user)
            setMessage(data.message)
            setTimeout(() => {
                navigate('/profile')
            }, 2000)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong')
        }
    }

    if (user && !message) return <Navigate to="/" replace />

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Log in</h1>

                {error && <p className="error-message auth-message">{error}</p>}
                {message && <p className="success-message auth-message">{message}</p>}

                <form className="auth-form" onSubmit={handleLogin}>
                    <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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

                    <button type="submit">Log in</button>
                    
                    <div className="forgot-password-link">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>
                </form>
            </div>

            <div className="auth-switch">
                <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            </div>
        </div>
    )
}

export default Login
