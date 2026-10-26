import './Banner.css'

function Banner() {
  return (
    <div className="banner">
      <img
        src="/images/banner.jpeg"
        alt="Deakin University Banner"
      />

      <div className="banner-overlay">
        Hey, I am Rudra!
      </div>
    </div>
  )
}

export default Banner