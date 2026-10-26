
import { useState } from 'react';
import './Footer.css';

function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    type: '',
    message: ''
  });

  async function handleSubscribe(event) {
    event.preventDefault();

    const enteredEmail = email.trim();

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(
        'http://localhost:5000/api/subscribe',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: enteredEmail
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Subscription failed.'
        );
      }

      setStatus({
        type: 'success',
        message: data.message || 'Subscription successful!'
      });

      setEmail('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Something went wrong.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="newsletter">
        <h2>SIGN UP FOR OUR DAILY INSIDER</h2>

        <div className="newsletter-action">
          <form
            className="newsletter-form"
            onSubmit={handleSubscribe}
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Subscribe'}
            </button>
          </form>

          {status.message && (
            <p
              className={`newsletter-message ${status.type}`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-links">
          <div className="footer-column">
            <h3>Explore</h3>
            <a href="#home">Home</a>
            <a href="#questions">Questions</a>
            <a href="#articles">Articles</a>
            <a href="#tutorials">Tutorials</a>
          </div>

          <div className="footer-column">
            <h3>Support</h3>
            <a href="#faqs">FAQs</a>
            <a href="#help">Help</a>
            <a href="#contact">Contact Us</a>
          </div>

          <div className="footer-column">
            <h3>Stay connected</h3>

            <div className="social-icons">
              <a href="#facebook">
                <img
                  src="/images/facebook.jpg"
                  alt="Facebook"
                />
              </a>

              <a href="#twitter">
                <img
                  src="/images/twitter.png"
                  alt="Twitter"
                />
              </a>

              <a href="#instagram">
                <img
                  src="/images/insta.jpg"
                  alt="Instagram"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>DEV@Deakin 2022</p>

          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms</a>
            <a href="#code-of-conduct">Code of Conduct</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
