import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { MailCheck, CheckCircle2, AlertCircle } from 'lucide-react'

function VerifyEmailChange() {
    const { token } = useParams()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [verified, setVerified] = useState(false)

    useEffect(() => {
        document.title = 'Verify Email | Clonvix'
    }, [])

    // Handle the email verification process
    const handleVerification = async () => {
        setError('')
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
                throw new Error('Unable to verify your request.')
            }

            const response = await fetch('/api/accounts/verify-email-change/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ token })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Email verification failed.')
            }

            setMessage(data.message)
            setVerified(true)

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="verify-email-page">
            <div className="verify-email-card">

                {!verified && !error && (
                    <>
                        <MailCheck size={48} />

                        <h1>Confirm your email</h1>

                        <p>
                            You're almost done updating your Clonvix account.
                            Confirm below to complete your email change.
                        </p>

                        <div className="verification-status">
                            <span>Verification status</span>
                            <strong>Waiting for confirmation</strong>
                        </div>

                        <button
                            type="button"
                            onClick={handleVerification}
                            disabled={loading || !token}
                        >
                            {loading ? 'Verifying...' : 'Confirm Email Change'}
                        </button>

                        <small>This verification link expires after one hour.</small>
                    </>
                )}

                {verified && (
                    <>
                        <CheckCircle2 size={48} />

                        <h1>Email updated</h1>

                        <p>{message}</p>

                        <Link to="/account-settings">
                            Return to Account Settings
                        </Link>
                    </>
                )}

                {error && (
                    <>
                        <AlertCircle size={48} />

                        <h1>Verification failed</h1>

                        <p>{error}</p>

                        <Link to="/account-settings">
                            Return to Account Settings
                        </Link>
                    </>
                )}

            </div>
        </div>
    )
}

export default VerifyEmailChange
