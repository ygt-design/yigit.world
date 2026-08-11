import { createGlobalStyle } from "styled-components";
import gtCanon from "./assets/fonts/GT-Canon-Trial-VF.woff2";
import jetBrainsMono from "./assets/fonts/JetBrainsMono[wght].woff2";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "GT Canon";
    src: url(${gtCanon}) format("woff2");
    font-weight: 100 900;
    font-stretch: 50% 150%;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "JetBrains Mono";
    src: url(${jetBrainsMono}) format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  :root {
    --font-display: "GT Canon", serif;
    --font-mono: "JetBrains Mono", monospace;
    --font-title-stretch: 70%;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  *::-webkit-scrollbar {
    width: 0;
    height: 0;
    opacity: 0;
  }

  html, body {
    height: 100%;
    overflow: hidden;
  }

  /* Scale the root font-size up on large screens so rem-based type (bio,
     tags, contact, manifesto, project info, etc.) grows with the viewport
     instead of looking small. px-based band math is unaffected. */
  @media (min-width: 1600px) {
    html { font-size: 17px; }
  }
  @media (min-width: 2000px) {
    html { font-size: 18px; }
  }
  @media (min-width: 2560px) {
    html { font-size: 20px; }
  }
  @media (min-width: 3200px) {
    html { font-size: 22px; }
  }

  body {
    font-family: 'Inter', sans-serif;
  }

  img {
    width: 100%;
  }
`;

export default GlobalStyle;
