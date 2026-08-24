import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import AdminTable from '../../components/admin/AdminTable'

export default function StoriesAdmin() {
  return <div className="admin-stack"><PageHead eyebrow="Community inspiration" title="Success stories" description="Review, edit, and publish real career journeys."><button className="button primary"><Icon name="plus" /> Add story</button></PageHead><div className="story-admin-cards">{[['Pending review','6','clock','amber'],['Published','42','check','mint'],['Featured','8','star','lavender']].map(([label,count,icon,tone]) => <article className="panel" key={label}><span className={`career-icon ${tone}`}><Icon name={icon} /></span><div><strong>{count}</strong><p>{label}</p></div><Icon name="arrow" /></article>)}</div><AdminTable headings={['Story','Career transition','Submitted','Status','Featured','']} rows={[['AR|Aisha Rahman|aisha@example.com','Psychology → UX Design','Aug 23','Pending review','—','⋯'],['DK|Daniel Kim|daniel@example.com','Finance → Data Analyst','Aug 21','Published','Yes','⋯'],['FN|Fatima Noor|fatima@example.com','Support → Product','Aug 19','Published','Yes','⋯'],['MR|Mina Raza|mina@example.com','Teaching → Content Design','Aug 17','Needs edits','—','⋯']]} /></div>
}
