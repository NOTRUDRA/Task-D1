import './Projects.css'
import ProjectCard from './ProjectCard'

function Projects() {
  return (
    <section className="projects">

      <ProjectCard
        image="/images/bmi.png"
        title="BMI Calculator"
        description="This project is a functional and responsive BMI calculator. It calculates BMI using JavaScript functionality and displays it with a category."
        link="https://github.com/NOTRUDRA/BMI/tree/main/Solution1"
      />

      <ProjectCard
        image="/images/ecom.png"
        title="ShopEase E-Commerce"
        description="This project is an example of an E-Com website UI. The current version is only an example of UI and responsive design except functionality."
        link="https://github.com/NOTRUDRA/ShopEase_UI"
      />

      <hr />
      
    </section>
  )
}

export default Projects