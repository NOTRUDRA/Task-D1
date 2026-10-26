import './ProjectCard.css'

function ProjectCard({ image, title, description, link }) {
  return (
    <div className="project-card">
      <img
        src={image}
        alt={title}
        className="project-image"
      />

      <div className="project-content">
        <h3>{title}</h3>

        <p>{description}</p>

        <a href={link} target="_blank" rel="noreferrer">
          Github Link
        </a>
      </div>
    </div>
  )
}

export default ProjectCard