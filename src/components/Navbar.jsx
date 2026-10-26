import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { currentUser, loading, logout } = useAuth()

  function handleLogout() {
    logout()
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        DEV@Deakin
      </Link>

      <div className="navbar-search">
        <span className="navbar-search-icon"></span>
        <input type="text" placeholder="Search..." />
      </div>

      <div className="navbar-actions">
        <Link to="/pricing" className="navbar-action">
          Pricing
        </Link>

        <span className="navbar-action navbar-post">
          Post
        </span>

        {!loading && (
          currentUser ? (
            <>
              <span className="navbar-action">
                {currentUser.email}
              </span>

              <button
                type="button"
                className="navbar-action"
                style={{
                  borderTop: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  cursor: 'pointer',
                }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-action">
                Login
              </Link>

              <Link to="/signup" className="navbar-action">
                Sign Up
              </Link>
            </>
          )
        )}
      </div>
    </nav>
  )
}

export default Navbar