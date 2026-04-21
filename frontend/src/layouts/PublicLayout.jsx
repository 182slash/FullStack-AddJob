import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import BottomNav from '@/components/common/BottomNav'

const PublicLayout = ({ hideFooter = false }) => (
  <>
    <Navbar />
    <main className="page-wrapper">
      <motion.div
        key="public"
        className="page-enter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.div>
    </main>
    {!hideFooter && <Footer />}
    <BottomNav />
  </>
)

export default PublicLayout
