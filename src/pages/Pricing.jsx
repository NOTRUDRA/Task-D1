
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../api'
import './Pricing.css'

function Pricing() {
  const {
    currentUser,
    loading: authLoading,
    refreshUser,
  } = useAuth()

  const [showModal, setShowModal] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const plan = currentUser?.plan || null

  function handleUpgrade() {
    if (authLoading || !currentUser || submitting) {
      return
    }

    if (plan === 'Paid') {
      alert('You are already on the Paid plan.')
      return
    }

    if (plan !== 'Free') {
      alert('Unable to load your subscription plan. Please try again.')
      return
    }

    setPaymentError('')
    setShowModal(true)
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault()
    setPaymentError('')

    if (!currentUser || currentUser.plan !== 'Free') {
      setPaymentError(
        'You must be logged in with a Free plan to upgrade.'
      )
      return
    }

    const formData = new FormData(event.currentTarget)

    const cardName = String(
      formData.get('cardName') || ''
    ).trim()

    const cardNumber = String(
      formData.get('cardNumber') || ''
    ).replace(/[\s-]/g, '')

    const expiry = String(
      formData.get('expiry') || ''
    ).trim()

    const cvv = String(
      formData.get('cvv') || ''
    ).trim()

    if (cardName.length < 2) {
      setPaymentError('Please enter the name on the card.')
      return
    }

    if (!/^\d{13,19}$/.test(cardNumber)) {
      setPaymentError(
        'Enter a card number containing 13–19 digits.'
      )
      return
    }

    const expiryMatch = expiry.match(/^(\d{2})\/(\d{2})$/)

    if (!expiryMatch) {
      setPaymentError('Enter the expiry date in MM/YY format.')
      return
    }

    const month = Number(expiryMatch[1])
    const year = 2000 + Number(expiryMatch[2])
    const now = new Date()

    if (
      month < 1 ||
      month > 12 ||
      year < now.getFullYear() ||
      (year === now.getFullYear() &&
        month < now.getMonth() + 1)
    ) {
      setPaymentError('Enter a valid future expiry date.')
      return
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setPaymentError(
        'The security code must contain 3 or 4 digits.'
      )
      return
    }

    setSubmitting(true)

    try {
      const result = await apiRequest('/api/subscription/upgrade', {
        method: 'POST',
        body: JSON.stringify({
          cardName,
          cardNumber,
          expiry,
          cvv,
        }),
      })

      await refreshUser()

      setShowModal(false)
      setPaymentError('')

      alert(result.message)
    } catch (error) {
      setPaymentError(
        error.message || 'Unable to upgrade your plan. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  let buttonText = 'Upgrade Plan'

  if (authLoading) {
    buttonText = 'Loading...'
  } else if (!currentUser) {
    buttonText = 'Log in to Upgrade'
  } else if (plan === 'Paid') {
    buttonText = 'Paid Plan Active'
  }

  const upgradeDisabled =
    authLoading ||
    !currentUser ||
    submitting ||
    plan !== 'Free'

  return (
    <main className="pricing-page">
      <h1>Choose Your Plan</h1>

      <p className="pricing-description">
        Choose the subscription that suits your needs.
      </p>

      <div className="pricing-container">
        <section className="pricing-card">
          <h2>Free</h2>

          <p className="pricing-price">
            $0 <span>/ month</span>
          </p>

          <ul>
            <li>Access to free posts</li>
            <li>5 posts per month</li>
            <li>5 MB image uploads</li>
          </ul>

          <button type="button" disabled>
            Free Plan
          </button>
        </section>

        <section className="pricing-card">
          <h2>Paid</h2>

          <p className="pricing-price">
            $5 <span>/ month</span>
          </p>

          <ul>
            <li>Access to free and paid posts</li>
            <li>50 posts per month</li>
            <li>20 MB image uploads</li>
          </ul>

          <button
            type="button"
            disabled={upgradeDisabled}
            onClick={handleUpgrade}
          >
            {buttonText}
          </button>

          {currentUser && plan === 'Paid' && (
            <p style={{ textAlign: 'center', color: '#15803d' }}>
              Your current plan: Paid
            </p>
          )}
        </section>
      </div>

      {showModal && (
        <div className="payment-overlay">
          <section
            className="payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
          >
            <h2 id="payment-title">Upgrade to Paid</h2>

            <p>Enter your payment details to continue.</p>

            <form onSubmit={handlePaymentSubmit}>
              <div className="payment-field">
                <label htmlFor="cardName">Name on card</label>
                <input
                  id="cardName"
                  name="cardName"
                  type="text"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="cardNumber">Card number</label>
                <input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="payment-row">
                <div className="payment-field">
                  <label htmlFor="expiry">Expiry date</label>
                  <input
                    id="expiry"
                    name="expiry"
                    type="text"
                    placeholder="MM/YY"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="payment-field">
                  <label htmlFor="cvv">Security code</label>
                  <input
                    id="cvv"
                    name="cvv"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="CVV"
                    required
                  />
                </div>
              </div>

              {paymentError && (
                <p role="alert" style={{ color: '#b91c1c' }}>
                  {paymentError}
                </p>
              )}

              <div className="payment-actions">
                <button
                  type="button"
                  className="payment-cancel"
                  disabled={submitting}
                  onClick={() => {
                    setShowModal(false)
                    setPaymentError('')
                  }}
                >
                  Cancel
                </button>

                <button type="submit" disabled={submitting}>
                  {submitting ? 'Processing...' : 'Continue'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default Pricing
