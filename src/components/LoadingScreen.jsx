import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0A0A0F]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              className="relative"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="w-20 h-20 rounded-full border-2 border-transparent bg-gradient-to-br from-[#00D4FF] to-[#FFD700] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">
                  <span className="text-3xl font-black bg-gradient-to-br from-[#00D4FF] to-[#FFD700] bg-clip-text text-transparent font-[Poppins]">
                    G
                  </span>
                </div>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#00D4FF]"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>
            <motion.p
              className="text-sm tracking-[0.3em] uppercase text-gray-400 font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Growth Arc Media
            </motion.p>
            <motion.div
              className="w-32 h-[2px] bg-[#1A1A2E] rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-[#00D4FF] to-[#FFD700] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, delay: 0.4, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
