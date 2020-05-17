import React from "react"

import { rhythm } from "../utils/typography"
import Header from "./header"

const Layout = ({ location, title, children }) => (
  <div
    style={{
      marginLeft: `auto`,
      marginRight: `auto`,
      maxWidth: rhythm(30),
      padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`
    }}
  >
    <Header title={title}/>
    <main>{children}</main>
  </div>
)

export default Layout
