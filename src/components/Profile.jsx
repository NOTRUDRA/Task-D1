import './Profile.css'

function Profile() {
  return (
    <section className="profile">
      <img
        src="/images/logo.jpg"
        alt="Author logo"
        className="profile-image"
      />

      <p>
        I am a full-stack developer based in Melbourne, Australia.
      </p>

      <hr />

      <h3>Here's what I have done so far</h3>
    </section>
  )
}

export default Profile