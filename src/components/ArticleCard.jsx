import './ArticleCard.css'

function ArticleCard({ title, description, rating, author, image }) {
  return (
    <article className="article-card">
      <img
        src={image}
        alt={title}
        className="article-image"
      />

      <h3>{title}</h3>

      <p>{description}</p>

      <div className="article-info">
        <span>⭐{rating}</span>
        <span>{author}</span>
      </div>
    </article>
  )
}

export default ArticleCard