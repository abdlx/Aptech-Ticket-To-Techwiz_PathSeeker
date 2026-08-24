import Icon from '../../components/Icon'
import NaviPrompt from '../../components/user/NaviPrompt'
import SectionHead from '../../components/user/SectionHead'
import { stories } from '../../data'

export default function StoriesPage({ navigate }) {
  return (
    <div className="stories-page page-stack">
      <section className="stories-hero"><div><span className="eyebrow">Real people · Real pivots</span><h1>There’s more than one way forward.</h1><p>Meet people who followed their curiosity, built new skills, and found work that fits.</p><button className="button primary" onClick={() => navigate('submit-story')}>Share your story <Icon name="arrow" /></button></div><div className="story-collage"><span className="portrait p1">AR</span><span className="portrait p2">DK</span><span className="portrait p3">FN</span><div><strong>2,400+</strong><small>career journeys shared</small></div></div></section>
      <button className="featured-story panel" onClick={() => navigate('story-detail')}><div className="story-video"><span><Icon name="play" size={28} /></span><small>04:36</small></div><div><span className="eyebrow">Featured journey</span><h2>“My psychology degree became my UX superpower.”</h2><blockquote>“Once I stopped trying to hide my background, everything clicked. Understanding people was exactly the point.”</blockquote><div className="story-person"><span>AR</span><p><strong>Aisha Rahman</strong><small>Psychology graduate → UX Designer</small></p></div><div className="story-tags"><span>Career change</span><span>Design</span><span>5-month journey</span></div></div></button>
      <section><SectionHead eyebrow="Community voices" title="More paths worth knowing" /><div className="story-grid">{stories.map((story) => <article key={story.name}><Icon name="message" /><p>“{story.quote}”</p><div><span className={`portrait ${story.tone}`}>{story.initials}</span><span><strong>{story.name}</strong><small>{story.role}</small></span></div><button className="card-link" onClick={() => navigate('story-detail')}>Read journey <Icon name="arrow" /></button></article>)}</div></section>
      <NaviPrompt pose="walking-profile" title="Your path can move, too">Careers are built one experiment at a time. Save the stories that make your next step feel possible.</NaviPrompt>
    </div>
  )
}
