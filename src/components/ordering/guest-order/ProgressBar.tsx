"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

type Step = {
  id: number
  name: string
}

type ProgressBarProps = {
  steps: Step[]
  currentStep: number
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="fixed left-4 md:left-8 top-8 w-[60px] flex items-center">
      <div className="relative h-[400px] w-full">
        {/* Container for circles and lines with exact positioning */}
        <div className="absolute inset-0 flex flex-col justify-between py-8">
          {/* Background line container */}
          <div className="absolute inset-0 flex flex-col justify-between py-8 pointer-events-none">
            <div className="relative flex-1">
              {/* Static background line - positioned relative to circles */}
              <div
                className="absolute left-1/2 w-[2px] bg-black/20 transform -translate-x-1/2"
                style={{
                  top: "20px", // Half of circle height
                  bottom: "20px", // Half of circle height
                }}
              />

              {/* Animated progress line - positioned relative to circles */}
              <motion.div
                className="absolute left-1/2 w-[2px] bg-black transform -translate-x-1/2 origin-top"
                style={{
                  top: "20px", // Half of circle height
                  height: `calc(100% - 40px)`, // Full height minus circle height
                }}
                initial={{ scaleY: 0 }}
                animate={{
                  scaleY: Math.min((currentStep - 1) / (steps.length - 1), 1),
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            </div>
          </div>

          {/* Steps */}
          {steps.map((step) => (
            <div key={step.id} className="relative flex items-center justify-center z-10">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep >= step.id ? 1 : 0.8,
                  backgroundColor: currentStep >= step.id ? "rgb(0 0 0)" : "rgb(255 255 255)",
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full 
                  border-2 border-black shadow-md
                  ${currentStep >= step.id ? "text-yellow-400" : "text-black"}
                `}
              >
                {currentStep > step.id ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </motion.div>

              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  color: currentStep >= step.id ? "rgb(0 0 0)" : "rgb(0 0 0 / 0.5)",
                }}
                transition={{ duration: 0.3 }}
                className="absolute left-14 whitespace-nowrap text-sm font-medium hidden md:inline-block"
              >
                {step.name}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

