import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../firebase'
import './FeaturedArticles.css'
import ArticleCard from './ArticleCard'

function FeaturedArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchArticles() {
      try {
        const postsQuery = query(
          collection(db, 'posts'),
          where('type', '==', 'article')
        )

        const snapshot = await getDocs(postsQuery)

        const articleList = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))

        setArticles(articleList)
      } catch (error) {
        console.error('Error loading articles:', error)
        setError('Unable to load articles from Firestore.')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  return (
    <section className="featured-articles">
      <h2>Featured Articles</h2>

      <div className="article-grid">
        {loading ? (
          <p>Loading articles...</p>
        ) : error ? (
          <p>{error}</p>
        ) : articles.length === 0 ? (
          <p>No articles found.</p>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              description={article.description}
              rating={article.rating}
              author={article.author}
              image={article.image}
            />
          ))
        )}
      </div>

      <button className="see-all-button">
        See all articles
      </button>
    </section>
  )
}

export default FeaturedArticles