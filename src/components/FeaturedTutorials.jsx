import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../firebase'
import './FeaturedTutorials.css'
import TutorialCard from './TutorialCard'

function FeaturedTutorials() {
  const [tutorials, setTutorials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTutorials() {
      try {
        const postsQuery = query(
          collection(db, 'posts'),
          where('type', '==', 'tutorial')
        )

        const snapshot = await getDocs(postsQuery)

        const tutorialList = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }))

        setTutorials(tutorialList)
      } catch (error) {
        console.error('Error loading tutorials:', error)
        setError('Unable to load tutorials from Firestore.')
      } finally {
        setLoading(false)
      }
    }

    fetchTutorials()
  }, [])

  return (
    <section className="featured-tutorials">
      <h2>Featured Tutorials</h2>

      <div className="tutorial-grid">
        {loading ? (
          <p>Loading tutorials...</p>
        ) : error ? (
          <p>{error}</p>
        ) : tutorials.length === 0 ? (
          <p>No tutorials found.</p>
        ) : (
          tutorials.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              title={tutorial.title}
              description={tutorial.description}
              rating={tutorial.rating}
              author={tutorial.author}
              image={tutorial.image}
            />
          ))
        )}
      </div>

      <button className="see-all-button">
        See all tutorials
      </button>
    </section>
  )
}

export default FeaturedTutorials