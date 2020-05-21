import React from "react"

import { rhythm } from "../utils/typography"
import Header from "./header"

type Props = {
  title: string,
  bigHeader: boolean,
  children: React.ReactNode
}

const Layout = ({ title, bigHeader, children }: Props) => (
  <div
    style={{
      marginLeft: `auto`,
      marginRight: `auto`,
      maxWidth: rhythm(30),
      padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`
    }}
  >
    <Header big={bigHeader} title={title}/>
    <main>{children}</main>
  </div>
)

export default Layout
