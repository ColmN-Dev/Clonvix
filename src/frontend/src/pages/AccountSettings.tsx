import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
import { scrollToTop } from '../utils/scrollToTop'

function AccountSettings() {
    useEffect(() => {
        document.title = 'Account Settings | Clonvix'
    }, [])

    // Set up the initial state for the account settings
    const [loading, setLoading] = useState(true)
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

    // State for user information and form fields
    const [user, setAccountUser] = useState<{ id: number; email: string; username: string } | null>(null)
    const [newUsername, setNewUsername] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [showDeletePassword, setShowDeletePassword] = useState(false)
    const [deletingAccount, setDeletingAccount] = useState(false)

    useEffect(() => {
        const controller = new AbortController()

        // Fetch the current user's account information from the backend API
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/accounts/me/', {
                    credentials: 'include',
                    signal: controller.signal
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch account information.')
                }

                const data = await response.json()

                if (!data.authenticated) {
                    throw new Error('You must be logged in to view account settings.')
                }

                setAccountUser(data.user)

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return
                setError(error instanceof Error ? error.message : 'Something went wrong.')

            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }

        fetchUser()
        return () => controller.abort()
    }, [])

    const handleChangeUsername = async () => {
        setError('')
        setMessage('')

        if (!newUsername.trim()) {
            setError('Username is required.')
            scrollToTop()
            return
        }

        try {
            const csrfResponse = await fetch('/api/accounts/csrf/', {
                credentials: 'include'
            })

            if (!csrfResponse.ok) {
                throw new Error('Failed to retrieve CSRF token.')
            }

            const csrfToken = document.cookie
                .split('; ')
                .find(cookie => cookie.startsWith('csrftoken='))
                ?.split('=')[1]

            if (!csrfToken) {
                throw new Error('CSRF token not found.')
            }

            const response = await fetch('/api/accounts/change-username/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ username: newUsername.trim() })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to change username.')
            }

            setAccountUser(prev => prev ? { ...prev, username: data.username } : prev)
            setNewUsername('')
            setMessage(data.message)
            scrollToTop()

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong.')
            scrollToTop()
        }
    }

    const handleChangePassword = async () => {
        setError('')
        setMessage('')

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError('All fields are required.')
            scrollToTop()
            return
        }

        try {
            const csrfResponse = await fetch('/api/accounts/csrf/', {
                credentials: 'include'
            })

            if (!csrfResponse.ok) {
                throw new Error('Failed to retrieve CSRF token.')
            }

            const csrfToken = document.cookie
                .split('; ')
                .find(cookie => cookie.startsWith('csrftoken='))
                ?.split('=')[1]

            if (!csrfToken) {
                throw new Error('CSRF token not found.')
            }

            const response = await fetch('/api/accounts/change-password/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_new_password: confirmNewPassword
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || data.errors?.join(' ') || 'Failed to change password.')
            }

            scrollToTop()
            setMessage(data.message)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
            
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong.')
            scrollToTop()
        }
    }


    const handleChangeEmail = async () => {
        setError('')
        setMessage('')

        if (!newEmail.trim()) {
            setError('Email address is required.')
            scrollToTop()
            return
        }

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

            const response = await fetch('/api/accounts/change-email/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ email: newEmail.trim() })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to request email change.')
            }

            setNewEmail('')
            setMessage(data.message)
            scrollToTop()

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong.')
            scrollToTop()
        }
    }

    const handleDeleteAccount = async () => {
        setError('')
        setMessage('')

        if (!deletePassword) {
            setError('Password is required.')
            return
        }

        setDeletingAccount(true)

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

            const response = await fetch('/api/accounts/delete-account/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ password: deletePassword })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete account.')
            }

            setDeletePassword('')
            setShowDeleteModal(false)
            navigate('/', { state: { accountDeleted: true } })

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong.')

        } finally {
            setDeletingAccount(false)
        }
    }

    if (loading) return <div className="page-status">Loading account settings...</div>

    if (!user) return <div className="page-status">Account information unavailable.</div>

    return (
        <div className="account-settings-page">
            <h1>Account Settings</h1>

            {error && <p className="error-message auth-message">{error}</p>}
            {message && <p className="success-message auth-message">{message}</p>}

            <div className="account-settings-form">

                <Link to="/profile" className="back-link">
                    Back to Profile
                </Link>

                {/* Account Information Card */}
                <div className="account-information-card">
                    <h2>Account Information</h2>

                    {/* Change Username */}
                    <div className="account-setting-field">
                        <h3>Change Username</h3>

                        <input
                            type="text"
                            value={newUsername}
                            onChange={event => setNewUsername(event.target.value)}
                            placeholder={user.username}
                            autoComplete="username"
                        />

                        <button type="button" onClick={handleChangeUsername}>
                            Update Username
                        </button>
                    </div>

                    {/* Change Password */}
                    <div className="account-setting-field password-settings">
                        <h3>Change Password</h3>

                        <div className="password-input-wrapper">
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="Current password"
                                value={currentPassword}
                                onChange={event => setCurrentPassword(event.target.value)}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showCurrentPassword}
                            >
                                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="password-input-wrapper">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="New password"
                                value={newPassword}
                                onChange={event => setNewPassword(event.target.value)}
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showNewPassword}
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                value={confirmNewPassword}
                                onChange={event => setConfirmNewPassword(event.target.value)}
                                autoComplete="new-password"
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

                        <button type="button" onClick={handleChangePassword}>
                            Change Password
                        </button>
                    </div>

                    {/* Change Email */}
                    <div className="account-setting-field">
                        <h3>Change Email</h3>

                        <input
                            type="email"
                            value={newEmail}
                            onChange={event => setNewEmail(event.target.value)}
                            placeholder={user.email}
                            autoComplete="email"
                        />

                        <button type="button" onClick={handleChangeEmail}>
                            Update Email
                        </button>
                    </div>
                </div>

                {/* Connected Accounts Card */}
                <div className="connected-accounts-card">
                    <h2>Connected Accounts</h2>
                </div>

                {/* Danger Zone Card */}
                <div className="danger-zone-card">
                    <h2>Danger Zone</h2>
                    <label>Delete your account</label>
                    <p>
                        Once you delete your account, there is no going back. Please be certain.
                    </p>

                    <button
                        type="button"
                        className="delete-account-button"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Delete Account
                    </button>

                </div>
            </div>
            {showDeleteModal && (
                // Delete Account Modal
                <div className="delete-account-modal-overlay"
                    onClick={() => { 
                        setShowDeleteModal(false)
                        setDeletePassword('')
                        setShowDeletePassword(false)
                    }}
                >
                    <div className="delete-account-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2>Delete Account</h2>
                        
                        <p>
                            Are you sure you want to delete your account?
                            This action cannot be undone.
                        </p>

                        <label htmlFor="delete-password">
                            Confirm your password
                        </label>
                        {error && <p className="delete-account-error auth-message">{error}</p>}
                        <div className="delete-password-wrapper">
                            <input
                                id="delete-password"
                                type={showDeletePassword ? 'text' : 'password'}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter your current password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowDeletePassword(!showDeletePassword)}
                                aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                            >
                                {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="delete-account-modal-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setDeletePassword('')
                                    setShowDeletePassword(false)
                                }}
                                disabled={deletingAccount}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deletingAccount || !deletePassword}
                            >
                                {deletingAccount ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

}

export default AccountSettings