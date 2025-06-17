
import styles from './navigation.module.scss'

const Navigation = () => {
  return (
    <nav className={`${styles.container}`}>
      <ul>
        <li>Tech</li>
        {/*<li>Tags</li>*/}
        <li>Repositories</li>
        <li>About</li>
      </ul>
    </nav>
  )
}

export default Navigation