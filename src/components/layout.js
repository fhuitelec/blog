import * as React from "react"
import { Link } from "gatsby"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header
  const styledTitle = (
    <div>
      <span className="title-main">{title.split(".")[0]}</span>
      <span className="title-extension">.{title.split(".")[1]}</span>
    </div>
  )

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{styledTitle}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {styledTitle}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, fabien.sh. Créé avec
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
