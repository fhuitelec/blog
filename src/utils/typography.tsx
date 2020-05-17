import Typography from "typography"
import gray from "gray-percentage"
import oceanBeachTheme from "typography-theme-ocean-beach"

oceanBeachTheme.headerFontFamily = ["Work Sans", "sans-serif"]
oceanBeachTheme.googleFonts.push({
  name: "Work Sans",
  styles: ["600"]
})
oceanBeachTheme.overrideThemeStyles = ({ adjustFontSizeTo, rhythm }) => {
  return {
    "a.gatsby-resp-image-link": {
      boxShadow: "none"
    },
    "a": {
      color: "#419eda",
      textShadow: "none",
      backgroundImage: "none"
    },
    blockquote: {
      ...adjustFontSizeTo("19px"),
      color: gray(60),
      fontStyle: "italic",
      borderLeft: `${rhythm(6 / 26)} solid ${gray(70)}`
    },
    "a:hover": {
      backgroundImage: "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 1px, #419eda 1px, #419eda 2px, rgba(0, 0, 0, 0) 2px)"
    }
  }
}

const typography = new Typography(oceanBeachTheme)

if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
