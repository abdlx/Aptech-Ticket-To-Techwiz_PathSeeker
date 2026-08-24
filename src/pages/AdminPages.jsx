import Icon from '../components/Icon'
import { Brand } from '../components/AppShell'
import { careers } from '../data'
import {
  AdminCareerEditor,
  AdminContentEditor,
  AdminFeedbackAnalytics,
  AdminHelpPage,
  AdminSettingsPage,
  AdminStoryReview,
  AdminUserEditor,
} from './AdminExtendedPages'

const adminNav = [
  ['admin', 'Overview', 'home'],
  ['admin-users', 'Users', 'users'],
  ['admin-careers', 'Career profiles', 'briefcase'],
  ['admin-content', 'Content library', 'library'],
  ['admin-quiz', 'Quiz builder', 'sparkles'],
  ['admin-stories', 'Success stories', 'message'],
  ['admin-feedback', 'Feedback', 'heart'],
  ['admin-feedback-analytics', 'Feedback analytics', 'chart'],
  ['admin-user-editor', 'User editor', 'edit'],
  ['admin-career-editor', 'Career editor', 'pen'],
  ['admin-content-editor', 'Content editor', 'file'],
  ['admin-story-review', 'Story review', 'check'],
]

const PageHead = ({ eyebrow, title, description, children }) => <div className="admin-page-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children}</div>

export default function AdminPage({ screen, navigate }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Brand />
        <div className="admin-workspace"><span className="avatar">PS</span><p><strong>PathSeeker HQ</strong><small>Administrator</small></p><Icon name="chevron" /></div>
        <nav><p className="nav-label">Workspace</p>{adminNav.map(([id, label, icon]) => <button key={id} className={screen === id ? 'active' : ''} onClick={() => navigate(id)}><Icon name={icon} /><span>{label}</span>{id === 'admin-feedback' && <em>12</em>}</button>)}</nav>
        <div className="admin-sidebar-bottom"><button className={screen === 'admin-help' ? 'active' : ''} onClick={() => navigate('admin-help')}><Icon name="help" /> Help center</button><button className={screen === 'admin-settings' ? 'active' : ''} onClick={() => navigate('admin-settings')}><Icon name="settings" /> Settings</button><button onClick={() => navigate('dashboard')}><Icon name="logout" /> Exit admin</button><div><span className="avatar small">SM</span><p><strong>Sarah Malik</strong><small>Super admin</small></p><Icon name="more" /></div></div>
      </aside>
      <nav className="admin-mobile-nav" aria-label="Admin navigation">{adminNav.slice(0, 7).map(([id, label, icon]) => <button key={id} className={screen === id ? 'active' : ''} onClick={() => navigate(id)}><Icon name={icon} /><span>{label}</span></button>)}<button className={screen === 'admin-settings' ? 'active' : ''} onClick={() => navigate('admin-settings')}><Icon name="settings" /><span>Settings</span></button></nav>
      <main className="admin-main">
        <header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => navigate('admin')} aria-label="Admin overview"><Icon name="menu" /></button><div className="admin-search"><Icon name="search" /><input placeholder="Search PathSeeker admin" /><kbd>⌘ K</kbd></div><button className="icon-button"><Icon name="bell" /><span className="notification-dot" /></button><button className="button soft small" onClick={() => navigate('dashboard')}><Icon name="globe" /> View website</button></header>
        <div className="admin-content">
          {screen === 'admin' && <AdminOverview navigate={navigate} />}
          {screen === 'admin-users' && <UsersAdmin />}
          {screen === 'admin-careers' && <CareersAdmin />}
          {screen === 'admin-content' && <ContentAdmin />}
          {screen === 'admin-quiz' && <QuizAdmin />}
          {screen === 'admin-stories' && <StoriesAdmin />}
          {screen === 'admin-feedback' && <FeedbackAdmin />}
          {screen === 'admin-feedback-analytics' && <AdminFeedbackAnalytics navigate={navigate} />}
          {screen === 'admin-settings' && <AdminSettingsPage navigate={navigate} />}
          {screen === 'admin-help' && <AdminHelpPage navigate={navigate} />}
          {screen === 'admin-user-editor' && <AdminUserEditor navigate={navigate} />}
          {screen === 'admin-career-editor' && <AdminCareerEditor navigate={navigate} />}
          {screen === 'admin-content-editor' && <AdminContentEditor navigate={navigate} />}
          {screen === 'admin-story-review' && <AdminStoryReview navigate={navigate} />}
        </div>
      </main>
    </div>
  )
}

function AdminOverview({ navigate }) {
  return <div className="admin-stack"><PageHead eyebrow="Monday, August 24" title="Good morning, Sarah" description="Here’s how people are finding their way with PathSeeker."><button className="button primary"><Icon name="download" /> Export report</button></PageHead><section className="admin-kpis">{[['Active users','12,482','+12.4%','users','mint'],['Quizzes completed','3,847','+8.2%','sparkles','lavender'],['Careers explored','28,104','+17.8%','compass','blue'],['Avg. match score','84%','+2.1%','target','amber']].map(([label,value,trend,icon,tone]) => <article key={label}><div><span className={`career-icon ${tone}`}><Icon name={icon} /></span><span className="trend-up"><Icon name="trend" />{trend}</span></div><strong>{value}</strong><p>{label}</p><small>vs. previous 30 days</small></article>)}</section><div className="admin-columns wide"><section className="panel analytics-card"><div className="admin-section-head"><div><span className="eyebrow">Engagement</span><h2>Platform activity</h2></div><select defaultValue="Last 30 days"><option>Last 30 days</option><option>Last 90 days</option></select></div><div className="chart-legend"><span><i className="green" /> Career views</span><span><i className="purple" /> Quiz completions</span></div><div className="bar-chart">{[42,58,49,72,66,88,81,91,75,96,84,102].map((height, i) => <div key={i}><i style={{height:`${height}%`}} /><i style={{height:`${height * .62}%`}} /><span>{['Sep','Oct','Nov','Dec','Jan','Feb'][Math.floor(i/2)]}</span></div>)}</div></section><section className="panel audience-card"><div className="admin-section-head"><div><span className="eyebrow">Audience</span><h2>User stages</h2></div><button><Icon name="more" /></button></div><div className="donut"><div><strong>12.4k</strong><small>total users</small></div></div><ul><li><i className="student" /><span>Students</span><strong>54%</strong></li><li><i className="graduate" /><span>Graduates</span><strong>27%</strong></li><li><i className="professional" /><span>Professionals</span><strong>19%</strong></li></ul></section></div><div className="admin-columns"><section className="panel"><div className="admin-section-head"><div><span className="eyebrow">Live content</span><h2>Top career profiles</h2></div><button onClick={() => navigate('admin-careers')}>View all <Icon name="arrow" /></button></div><div className="admin-career-list">{careers.slice(0,4).map((career,i) => <div key={career.id}><span>{i+1}</span><span className={`career-icon ${career.tone}`}><Icon name={career.icon} /></span><p><strong>{career.title}</strong><small>{career.field}</small></p><em>{[2841,2190,1875,1642][i].toLocaleString()} views</em><Icon name="trend" /></div>)}</div></section><section className="panel recent-activity"><div className="admin-section-head"><div><span className="eyebrow">Latest updates</span><h2>Recent activity</h2></div><button><Icon name="more" /></button></div>{[['users','New user milestone','PathSeeker reached 12,000 active users','8 min ago'],['file','Career profile updated','Cybersecurity Analyst was published','42 min ago'],['message','New success story submitted','Aisha Rahman submitted a story','2 hr ago'],['star','Feedback needs review','4 new high-priority messages','3 hr ago']].map(([icon,title,detail,time]) => <div className="activity-row" key={title}><span><Icon name={icon} /></span><p><strong>{title}</strong><small>{detail}</small></p><time>{time}</time></div>)}</section></div></div>
}

const Status = ({ children, tone = 'success' }) => <span className={`status ${tone}`}>{children}</span>

function UsersAdmin() {
  return <div className="admin-stack"><PageHead eyebrow="Community" title="Users" description="View accounts, understand engagement, and manage access."><button className="button soft"><Icon name="download" /> Export users</button><button className="button primary"><Icon name="plus" /> Add user</button></PageHead><section className="admin-filterbar panel"><div className="admin-search"><Icon name="search" /><input placeholder="Search name or email" /></div><select><option>All user stages</option><option>Students</option><option>Graduates</option></select><select><option>Any status</option><option>Active</option><option>Inactive</option></select><button><Icon name="filter" /> More filters</button></section><AdminTable headings={['User','Stage','Quiz status','Saved careers','Last active','Status','']} rows={[['AM|Alex Morgan|alex@example.com','Student','Completed','3','2 min ago','Active','⋯'],['ZN|Zara Noor|zara@example.com','Graduate','Completed','6','18 min ago','Active','⋯'],['DK|Daniel Kim|daniel@example.com','Professional','In progress','2','Yesterday','Active','⋯'],['FA|Farah Ali|farah@example.com','Student','Not started','0','Aug 21','Invited','⋯'],['OS|Omar Shah|omar@example.com','Graduate','Completed','4','Aug 19','Inactive','⋯']]} /></div>
}

function CareersAdmin() {
  return <div className="admin-stack"><PageHead eyebrow="Career Bank" title="Career profiles" description="Create and maintain salary, skill, demand, and roadmap information."><button className="button soft"><Icon name="download" /> Import CSV</button><button className="button primary"><Icon name="plus" /> New career profile</button></PageHead><section className="admin-filterbar panel"><div className="admin-search"><Icon name="search" /><input placeholder="Search career profiles" /></div><select><option>All industries</option></select><select><option>Any status</option></select><span className="filter-count">240 profiles</span></section><div className="career-admin-grid">{careers.map((career, i) => <article key={career.id} className="panel"><div><span className={`career-icon ${career.tone}`}><Icon name={career.icon} /></span><Status tone={i === 4 ? 'draft' : 'success'}>{i === 4 ? 'Draft' : 'Published'}</Status><button><Icon name="more" /></button></div><h3>{career.title}</h3><p>{career.field}</p><div><span><small>Views</small><strong>{(2841-i*213).toLocaleString()}</strong></span><span><small>Avg. match</small><strong>{career.match}%</strong></span><span><small>Updated</small><strong>{i+2}d ago</strong></span></div><button><Icon name="edit" /> Edit profile</button></article>)}</div></div>
}

function ContentAdmin() {
  return <div className="admin-stack"><PageHead eyebrow="Learning library" title="Content management" description="Manage expert videos, podcasts, courses, and downloadable documents."><button className="button primary"><Icon name="plus" /> Add content</button></PageHead><div className="content-summary">{[['All content','184','library'],['Published','163','check'],['Drafts','14','file'],['Needs review','7','clock']].map(([label,count,icon],i) => <button className={i===0?'active':''} key={label}><Icon name={icon}/><span><strong>{count}</strong><small>{label}</small></span></button>)}</div><section className="admin-filterbar panel"><div className="admin-search"><Icon name="search" /><input placeholder="Search content" /></div><select><option>All formats</option><option>Video</option><option>Podcast</option><option>Document</option></select><button><Icon name="filter" /> Filters</button></section><AdminTable headings={['Content','Format','Career tags','Author','Published','Status','']} rows={[['▶|Think like a UX designer|6-lesson mini course','Course','UX Design, Product','Maya Chen','Aug 20','Published','⋯'],['◉|Breaking into product design|28-minute expert podcast','Podcast','Design, Career change','Luis Ortega','Aug 18','Published','⋯'],['▤|Career decision workbook|PDF · 18 pages','Document','All careers','PathSeeker','Aug 15','Published','⋯'],['▣|A day as a data analyst|12-minute expert video','Video','Data, Business','Sam Wilson','—','Draft','⋯']]} /></div>
}

function QuizAdmin() {
  return <div className="admin-stack"><PageHead eyebrow="Assessment engine" title="Quiz builder" description="Shape the questions and scoring signals behind personalized matches."><button className="button soft"><Icon name="play" /> Preview quiz</button><button className="button primary"><Icon name="plus" /> Add question</button></PageHead><div className="quiz-admin-layout"><section className="panel question-list"><div><h3>Interest-based career quiz</h3><Status>Published</Status><p>7 questions · Updated Aug 18</p></div>{['Work that gives you energy','Challenges you enjoy','Your natural strengths','Preferred work environment','What success feels like','Topics you keep returning to','Your current priority'].map((question,i) => <button className={i===3?'active':''} key={question}><span>{i+1}</span><p><strong>{question}</strong><small>{i===3?'Single choice · Work style':'Single choice · Interest signal'}</small></p><Icon name="more" /></button>)}</section><section className="panel question-editor"><div className="editor-head"><div><span className="eyebrow">Question 4 of 7</span><h2>Preferred work environment</h2></div><button><Icon name="more" /></button></div><label>Question<input defaultValue="Where do you imagine doing your best work?" /></label><label>Helper text<input defaultValue="Choose the environment that gives you energy." /></label><div className="answer-editor"><span>Answer options</span>{['A focused studio with room to make','A fast-moving team solving problems','A quiet space for deep analysis','A people-first space with lots of conversation'].map((answer,i) => <div key={answer}><span>{String.fromCharCode(65+i)}</span><input defaultValue={answer} /><select defaultValue={['Creative','Enterprising','Investigative','Social'][i]}><option>{['Creative','Enterprising','Investigative','Social'][i]}</option></select><button><Icon name="more" /></button></div>)}<button><Icon name="plus" /> Add answer</button></div><div className="editor-actions"><button className="button ghost">Save draft</button><button className="button primary">Save & publish</button></div></section></div></div>
}

function StoriesAdmin() {
  return <div className="admin-stack"><PageHead eyebrow="Community inspiration" title="Success stories" description="Review, edit, and publish real career journeys."><button className="button primary"><Icon name="plus" /> Add story</button></PageHead><div className="story-admin-cards">{[['Pending review','6','clock','amber'],['Published','42','check','mint'],['Featured','8','star','lavender']].map(([label,count,icon,tone]) => <article className="panel" key={label}><span className={`career-icon ${tone}`}><Icon name={icon} /></span><div><strong>{count}</strong><p>{label}</p></div><Icon name="arrow" /></article>)}</div><AdminTable headings={['Story','Career transition','Submitted','Status','Featured','']} rows={[['AR|Aisha Rahman|aisha@example.com','Psychology → UX Design','Aug 23','Pending review','—','⋯'],['DK|Daniel Kim|daniel@example.com','Finance → Data Analyst','Aug 21','Published','Yes','⋯'],['FN|Fatima Noor|fatima@example.com','Support → Product','Aug 19','Published','Yes','⋯'],['MR|Mina Raza|mina@example.com','Teaching → Content Design','Aug 17','Needs edits','—','⋯']]} /></div>
}

function FeedbackAdmin() {
  return <div className="admin-stack"><PageHead eyebrow="Voice of the user" title="Feedback inbox" description="Prioritize issues and learn what explorers need next."><button className="button soft"><Icon name="download" /> Export feedback</button></PageHead><div className="feedback-admin-layout"><section className="panel feedback-inbox"><div className="inbox-tabs"><button className="active">Open <span>12</span></button><button>Resolved</button><button>All</button></div>{[['AM','Career compare view','I’d love a way to compare two career roadmaps side by side.','Idea','2 min ago'],['ZN','Quiz explanation','The results were great, but I wanted more detail about why…','Content','18 min ago'],['DK','Podcast playback','Playback paused when I opened my notes.','Problem','1 hr ago'],['FA','Thank you!','Navi made the questions feel much less overwhelming.','Praise','3 hr ago']].map(([initials,title,copy,type,time],i) => <button className={i===0?'active':''} key={title}><span className="avatar small">{initials}</span><p><strong>{title}</strong><small>{copy}</small><em>{type}</em></p><time>{time}</time></button>)}</section><section className="panel feedback-detail"><div className="feedback-detail-head"><div><span className="avatar">AM</span><p><strong>Alex Morgan</strong><small>alex@example.com · Student</small></p></div><Status tone="idea">Idea</Status></div><h2>Career compare view</h2><div className="rating"><span>Experience rating</span>{[1,2,3,4].map(i=><Icon name="star" key={i}/>) }<Icon name="star" /></div><blockquote>I’d love a way to compare two career roadmaps side by side. I have UX Design and Data Analysis saved, and seeing the skills, time, and salary together would help me make sense of the tradeoffs.</blockquote><div className="feedback-meta"><span><small>Submitted</small><strong>Aug 24, 2026 · 10:42 AM</strong></span><span><small>Page</small><strong>Saved careers</strong></span><span><small>Device</small><strong>Chrome · Desktop</strong></span></div><label>Internal note<textarea placeholder="Add a note for the team…" /></label><div className="feedback-actions"><button className="button ghost">Assign</button><button className="button primary"><Icon name="check" /> Mark resolved</button></div></section></div></div>
}

function AdminTable({ headings, rows }) {
  return <section className="admin-table panel"><table><thead><tr><th><input type="checkbox" /></th>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row,rowIndex) => <tr key={rowIndex}><td><input type="checkbox" /></td>{row.map((cell,i) => <td key={`${rowIndex}-${i}`}>{i===0 && cell.includes('|') ? <UserCell value={cell} /> : cell === 'Active' || cell === 'Published' || cell === 'Completed' ? <Status>{cell}</Status> : cell === 'Draft' || cell === 'Invited' || cell === 'Pending review' ? <Status tone="draft">{cell}</Status> : cell === 'Inactive' || cell === 'Needs edits' ? <Status tone="muted">{cell}</Status> : cell === 'Idea' ? <Status tone="idea">{cell}</Status> : cell}</td>)}</tr>)}</tbody></table><footer><span>Showing {rows.length} results</span><div><button disabled><Icon name="arrowLeft" /></button><button className="active">1</button><button>2</button><button>3</button><button><Icon name="arrow" /></button></div></footer></section>
}

function UserCell({ value }) {
  const [initials,name,detail] = value.split('|')
  return <div className="table-user"><span className="avatar small">{initials}</span><p><strong>{name}</strong><small>{detail}</small></p></div>
}
