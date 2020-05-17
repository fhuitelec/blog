import React from "react"
import { colors, rhythm, scale } from "../utils/typography"
import { Link } from "gatsby"

const Title = ({ title }: {title: string}) => (
  <React.Fragment>
      <span style={{ color: colors.main }}>
        {title.split(" ")[0]}
      </span>
    {` `}
    <span style={{ color: colors.gray(30) }}>
        {title.split(" ").slice(1)}
      </span>
  </React.Fragment>
)

const Header = ({ title }: {title: string}) => {
  // @ts-ignore
  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1
        style={{
          ...scale(1.5),
          marginBottom: rhythm(1.5),
          marginTop: 0
        }}
      >
        <Link to={`/`}>
          <Title title={title} />
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3 style={{ marginTop: 0 }}>
        <Link to={`/`}>
          <Title title={title} />
        </Link>
      </h3>
    )
  }

  return <header>{header}</header>
}

export default Header
