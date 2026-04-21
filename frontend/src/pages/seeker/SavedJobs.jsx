import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Search } from 'lucide-react'
import { useSavedJobs, useSaveJob } from '@/hooks/useJobs'
import JobCard from '@/components/common/JobCard'
import { SkeletonJobCard } from '@/components/common/Skeleton'

export default function SavedJobs() {
  const { data, isLoading } = useSavedJobs()
  const { mutate: unsave, isPending } = useSaveJob()
  const jobs = data?.data || []

  return (
    <div>
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.75rem', marginBottom:4 }}>Lowongan Tersimpan</h1>
        <p style={{ color:'var(--muted)' }}>{isLoading ? 'Memuat...' : `${jobs.length} lowongan tersimpan`}</p>
      </motion.div>

      {isLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {Array(6).fill(0).map((_,i)=><SkeletonJobCard key={i}/>)}
        </div>
      ) : jobs.length===0 ? (
        <div className="empty-state">
          <div className="empty-state__icon"><Bookmark size={28}/></div>
          <h3 style={{ fontFamily:'var(--font-heading)', fontWeight:700, marginBottom:8 }}>Belum ada lowongan tersimpan</h3>
          <p style={{ maxWidth:360, lineHeight:1.7 }}>Klik ikon bookmark pada lowongan untuk menyimpannya dan akses dengan mudah kapanpun.</p>
          <Link to="/jobs" className="btn btn--primary" style={{ marginTop:20 }}>
            <Search size={16}/> Cari Lowongan
          </Link>
        </div>
      ) : (
        <motion.div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}
          initial="h" animate="s" variants={{h:{},s:{transition:{staggerChildren:0.06}}}}>
          {jobs.map(j=>(
            <motion.div key={j._id} variants={{h:{opacity:0,y:12},s:{opacity:1,y:0}}}>
              <JobCard job={j} isSaved onSave={()=>unsave({ jobId:j._id, saved:true })}/>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
