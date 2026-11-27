
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { scrollToTop } from '../utils/scrollToTop'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!message && !error) return

        const timeout = window.setTimeout(() => {
            setMessage('')
            setError('')
        }, 5000)

        return () => window.clearTimeout(timeout)
    }, [message, error])

    useEffect(() => {
        document.title = 'Forgot Password | Clonvix'
    }, [])

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            const csrfResponse = await fetch('/api/accounts/csrf/', {
                credentials: 'include'
            })

            const csrfToken = document.cookie
                .split('; ')
                .find(cookie => cookie.startsWith('csrftoken='))
                ?.split('=')[1]

            if (!csrfResponse.ok || !csrfToken) {
                throw new Error('Failed to retrieve CSRF token.')
            }

            const response = await fetch('/api/accounts/password-reset/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Unable to request password reset.')
            }

            setMessage(data.message)
            setEmail('')
            scrollToTop()

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Forgot Password</h1>

                <p className="mb-4">Enter your email address and we'll send you a password reset link if an account exists.</p>

                {error && <p className="error-message auth-message">{error}</p>}
                {message && <p className="success-message auth-message">{message}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>

            <div className="auth-switch">
                <p>Remembered your password? <Link to="/login">Log in</Link></p>
            </div>
        </div>
    )
}

export default ForgotPassword
