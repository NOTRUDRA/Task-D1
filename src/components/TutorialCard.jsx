import './TutorialCard.css'

function TutorialCard({ title, description, rating, author, image }) {
  return (
    <article className="tutorial-card">
      <img
        src={image}
        alt={title}
        className="tutorial-image"
      />

      <h3>{title}</h3>

      <p>{description}</p>

      <div className="tutorial-info">
        <span>⭐{rating}</span>
        <span>{author}</span>
      </div>
    </article>
  )
}

export default TutorialCard