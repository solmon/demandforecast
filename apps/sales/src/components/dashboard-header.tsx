"use client"

import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardHeaderProps {
  onUploadClick?: () => void
}

export function DashboardHeader({ onUploadClick }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6"
    >

      <div className="flex-1">
      </div>
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="hidden md:flex" onClick={onUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>
      </div>
    </motion.header>
  )
}

