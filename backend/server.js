require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')

const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from backend/.env')
}

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(
  __dirname,
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    './serviceAccountKey.json'
)

const serviceAccount = require(serviceAccountPath)

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true)
      }

      return callback(new Error('Origin not allowed by CORS'))
    },
  })
)

app.use(express.json())

// Verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token is required.',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = {
      uid: decoded.sub,
      email: decoded.email,
    }

    next()
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
    })
  }
}

// Validate payment form fields for the demonstration
function validatePaymentDetails(body) {
  const cardName =
    typeof body?.cardName === 'string'
      ? body.cardName.trim()
      : ''

  const cardNumber =
    typeof body?.cardNumber === 'string'
      ? body.cardNumber.replace(/[\s-]/g, '')
      : ''

  const expiry =
    typeof body?.expiry === 'string'
      ? body.expiry.trim()
      : ''

  const cvv =
    typeof body?.cvv === 'string'
      ? body.cvv.trim()
      : ''

  if (cardName.length < 2) {
    return 'Please enter the name on the card.'
  }

  if (!/^\d{13,19}$/.test(cardNumber)) {
    return 'Enter a card number containing 13–19 digits.'
  }

  const expiryMatch = expiry.match(/^(\d{2})\/(\d{2})$/)

  if (!expiryMatch) {
    return 'Enter the expiry date in MM/YY format.'
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
    return 'Enter a valid future expiry date.'
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    return 'The security code must contain 3 or 4 digits.'
  }

  return null
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Backend is running successfully',
  })
})

// Register a user
app.post('/api/auth/register', async (req, res) => {
  const fullName =
    typeof req.body?.fullName === 'string'
      ? req.body.fullName.trim().replace(/\s+/g, ' ')
      : ''

  const email =
    typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : ''

  const password =
    typeof req.body?.password === 'string'
      ? req.body.password
      : ''

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!fullName || fullName.split(/\s+/).length < 2) {
    return res.status(400).json({
      message: 'Please enter your first and last name.',
    })
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      message: 'Please enter a valid email address.',
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: 'Password must contain at least 8 characters.',
    })
  }

  try {
    const existingUsers = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (!existingUsers.empty) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const userRef = db.collection('users').doc()

    await userRef.set({
      fullName,
      email,
      passwordHash,
      plan: 'Free',
    })

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        uid: userRef.id,
        fullName,
        email,
        plan: 'Free',
      },
    })
  } catch (error) {
    console.error('Registration error:', error.message)

    return res.status(500).json({
      message: 'Registration failed. Please try again.',
    })
  }
})

// Login a user
app.post('/api/auth/login', async (req, res) => {
  const email =
    typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : ''

  const password =
    typeof req.body?.password === 'string'
      ? req.body.password
      : ''

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.',
    })
  }

  try {
    const snapshot = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()

    if (typeof userData.passwordHash !== 'string') {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      userData.passwordHash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const token = jwt.sign(
      {
        email: userData.email,
      },
      JWT_SECRET,
      {
        subject: userDoc.id,
        expiresIn: '2h',
      }
    )

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        uid: userDoc.id,
        fullName: userData.fullName,
        email: userData.email,
        plan: userData.plan || 'Free',
      },
    })
  } catch (error) {
    console.error('Login error:', error.message)

    return res.status(500).json({
      message: 'Login failed. Please try again.',
    })
  }
})

// Get the currently authenticated user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid)
    const userSnapshot = await userRef.get()

    if (!userSnapshot.exists) {
      return res.status(404).json({
        message: 'User account not found.',
      })
    }

    const userData = userSnapshot.data()

    return res.status(200).json({
      user: {
        uid: userSnapshot.id,
        fullName: userData.fullName,
        email: userData.email,
        plan: userData.plan || 'Free',
      },
    })
  } catch (error) {
    console.error('User verification error:', error.message)

    return res.status(500).json({
      message: 'Could not retrieve user details.',
    })
  }
})

// Upgrade a Free user to Paid
app.post(
  '/api/subscription/upgrade',
  authenticateToken,
  async (req, res) => {
    const validationError = validatePaymentDetails(req.body)

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      })
    }

    try {
      const userRef = db.collection('users').doc(req.user.uid)
      const userSnapshot = await userRef.get()

      if (!userSnapshot.exists) {
        return res.status(404).json({
          message: 'User account not found.',
        })
      }

      const userData = userSnapshot.data()
      const currentPlan = userData.plan || 'Free'

      if (currentPlan === 'Paid') {
        return res.status(409).json({
          message: 'You are already on the Paid plan.',
        })
      }

      if (currentPlan !== 'Free') {
        return res.status(400).json({
          message: 'The current subscription plan is invalid.',
        })
      }

      await userRef.update({
        plan: 'Paid',
      })

      return res.status(200).json({
        message: 'Your plan has been upgraded to Paid.',
        user: {
          uid: userSnapshot.id,
          fullName: userData.fullName,
          email: userData.email,
          plan: 'Paid',
        },
      })
    } catch (error) {
      console.error('Subscription upgrade error:', error.message)

      return res.status(500).json({
        message: 'Unable to upgrade your plan. Please try again.',
      })
    }
  }
)

// Existing newsletter endpoint
app.post('/api/subscribe', async (req, res) => {
  const email =
    typeof req.body?.email === 'string'
      ? req.body.email.trim()
      : ''

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      message: 'Please enter a valid email address.',
    })
  }

  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  const from = process.env.EMAIL_FROM
  const apiBase =
    process.env.MAILGUN_API_BASE || 'https://api.mailgun.net'

  if (!apiKey || !domain || !from) {
    return res.status(500).json({
      message: 'Mailgun configuration is missing.',
    })
  }

  try {
    const form = new FormData()

    form.append('from', from)
    form.append('to', email)
    form.append('subject', 'Welcome to DEV@Deakin Newsletter')
    form.append(
      'text',
      'Thank you for subscribing to DEV@Deakin!'
    )
    form.append(
      'html',
      '<h1>Welcome to DEV@Deakin!</h1>' +
        '<p>Thank you for subscribing to our newsletter.</p>' +
        '<p>Stay tuned for our latest articles and tutorials.</p>'
    )

    const credentials = Buffer.from(
      `api:${apiKey}`
    ).toString('base64')

    const response = await fetch(
      `${apiBase}/v3/${domain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        body: form,
      }
    )

    const result = await response.json().catch(() => ({}))

    console.log('Mailgun API HTTP status:', response.status)

    if (!response.ok) {
      console.error('Mailgun API error:', result)

      return res.status(502).json({
        message: 'Mailgun could not accept the email request.',
      })
    }

    console.log('Mailgun accepted the request:', result.message)

    return res.status(200).json({
      message: 'Newsletter request successful!',
      providerStatus: response.status,
      emailId: result.id,
    })
  } catch (error) {
    console.error('Mailgun request failed:', error.message)

    return res.status(502).json({
      message: 'Could not connect to Mailgun.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})