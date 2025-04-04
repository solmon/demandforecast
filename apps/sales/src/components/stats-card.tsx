"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  delay?: number
}

export function StatsCard({ title, value, description, icon: Icon, trend, delay = 0 }: StatsCardProps) {
  const isPositive = trend ? trend.value > 0 : false

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: delay + 0.1,
              }}
              className="rounded-full bg-primary/10 p-2"
            >
              <Icon className="h-4 w-4 text-primary" />
            </motion.div>
          )}
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {value}
          </motion.div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {trend && (
            <motion.div
              className={`mt-2 flex items-center text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.3 }}
            >
              <span className="mr-1">
                {isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

