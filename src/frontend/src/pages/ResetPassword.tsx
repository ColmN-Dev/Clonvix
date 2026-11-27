
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
import { scrollToTop } from '../utils/scrollToTop'

function ResetPassword() {
    const { uid, token } = useParams()
    const navigate = useNavigate()

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
        document.title = 'Reset Password | Clonvix'
    }, [])

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMessage('')

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

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

            const response = await fetch('/api/accounts/password-reset-confirm/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    uid,
                    token,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || data.errors?.join(' ') || 'Failed to reset password.')
            }

            setMessage(data.message)
            setNewPassword('')
            setConfirmPassword('')
            scrollToTop()

            setTimeout(() => navigate('/login'), 2500)

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Reset Password</h1>

                <p className="mb-4">Enter your new password below.</p>

                {error && <p className="error-message auth-message">{error}</p>}
                {message && <p className="success-message auth-message">{message}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="password-input-wrapper">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button type="submit" disabled={loading} className="mb-4">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
                            <div className="auth-switch">
                    <p><Link to="/login">Back to login</Link></p>
                </div>
        </div>
    )
}

export default ResetPassword
