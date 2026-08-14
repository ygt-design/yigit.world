import styled from 'styled-components'
import { GRID } from '../../grid/index.js'

export const Article = styled.article`
  padding: 9.5rem;
  hyphens: auto;

  @media ${GRID.MEDIA_TABLET} {
    padding: 5.5rem;
  }

  @media ${GRID.MEDIA_MOBILE} {
    padding: 2.5rem 1.5rem;
  }
  font-family: var(--font-display);
  color: #131313;
  font-size: calc(0.95rem * 0.8);
  line-height: 1.45;
  font-weight: 400;
  font-style: normal;
  font-optical-sizing: auto;

  h2 {
    margin: 0 0 1.25em;
    font-family: var(--font-display);
    font-size: calc(32px * 0.8);
    line-height: 1;
    font-weight: 400;
    font-stretch: var(--font-title-stretch);
    font-optical-sizing: auto;
    text-transform: uppercase;
    text-align: center;
    color: #000;
  }

  p {
    margin: 0;
  }

  p + p,
  ol + p,
  p + ol,
  p + blockquote {
    margin-top: 1.25em;
  }

  ol {
    margin: 0;
    padding: 1em 0 1em 5em;
    font-family: var(--font-mono);
    font-size: calc(0.95rem * 0.8);
    line-height: 1.35;
    font-weight: 350;
    text-transform: uppercase;
    letter-spacing: -0.025em;
  }

  li + li {
    margin-top: 0.5em;
  }

  blockquote {
    margin: 1.25em 0 0;
    padding: 0;
    font-style: italic;
    opacity: 0.6;
  }

  a {
    color: inherit;
    text-decoration: underline;
  }
`

export default function ManifestoArticle(props) {
  return (
    <Article {...props}>
      <h2>
        Reinventing the Wheel<br />
        The Inefficient Designer&rsquo;s Manifesto
      </h2>
      <p>
        To reinvent the wheel by definition has a negative meaning: the
        attempt to duplicate — most likely with inferior results — a method
        that has already previously been created or optimized by others. With
        this notion in mind, I aim to challenge this perspective through my
        design practice. My objective is to develop processes that, while they
        may not match the efficiency of contemporary design practices focused
        on productivity, stand as a testament to my individual approach and
        reaction against prevailing norms. My work aims to critique and respond
        to the forceful standardization in design that leads to homogenization,
        advocating for a return to creative self expression and uniqueness.
        Throughout the final year of my undergraduate graphic design studies, I
        have come up with a set of principles guiding me in my projects. These
        points reflect my philosophy and my journey towards having a distinct
        creative practice.
      </p>

      <ol>
        <li>
          Ask questions, and explore through play, rather than constantly
          seeking solutions — embrace the curiosity of a mad scientist.
        </li>
        <li>Engage with unconventional tools and spaces for creation.</li>
        <li>
          Value the process as much, if not more than, the final outcome.
        </li>
        <li>
          Commit to open source principles: share your work and foster a
          community.
        </li>
        <li>
          Adopt an interdisciplinary approach and take inspiration outside of
          conventional graphic design practices.
        </li>
        <li>
          Reinvent the wheel — seek a unique process for your creative practice
          rather than trying to fit into the existing &lsquo;optimized&rsquo;
          methodologies.
        </li>
      </ol>

      <p>
        The tools we use in graphic design shape our creative processes and
        outcomes. Not only the tools we use to create our designs but the very
        tools we look at for inspiration dictate a uniform approach. Single
        aesthetic, single design, single algorithm, single software… Contemporary
        design tools, with their relentless pursuit of efficiency, strive for
        the creation of the &ldquo;flawless design every time&rdquo;, ignoring
        the diverse creative processes that do not conform to mainstream
        practices like those imposed by Adobe&rsquo;s suite of tools or the ones
        that get promoted on social media. As Marshall McLuhan famously states,
        &ldquo;We shape our tools and thereafter our tools shape us.&rdquo;
      </p>
      <p>
        Stick to the trends, prioritize the user, make it more efficient, make
        it look clean and remove anything that leaves things open-ended. I am
        tired of the uncritical acceptance of these processes and its rapid
        consumption. I strive to craft work that is not immediately recognizable
        expected, but ambiguous. Through this approach I challenge the ethos that
        dictates content must be produced and consumed as rapidly as possible. My
        ambition is to not to only create tools but invent new processes that
        resist the immediate comprehension, demanding engagement more than
        typical graphic design. I prioritize uniqueness through play over
        efficiency. My critique does not specifically reside in the creations
        themselves but in the process of building and interacting with them. I am
        proposing giving up conventional notions of aesthetics and efficient
        production in the favour of a journey of self-discovery and practice
        evolution.
      </p>
      <blockquote>
        &ldquo;Rather than challenge each other to create new ideas and form new
        connections, all of the players in the business of media (which these
        days means everyone) have accepted the roles of producing and consuming
        &lsquo;stuff.&rsquo;&rdquo; —{' '}
        <a
          href="https://maekan.com/the-modern-creators-paradigm-reasons-for-more-critique-and-accountability/"
          target="_blank"
          rel="noreferrer"
        >
          The Modern Creator&rsquo;s Paradigm
        </a>
      </blockquote>
    </Article>
  )
}
