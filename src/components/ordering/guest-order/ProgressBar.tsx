// "use client"

// import { motion } from "framer-motion"
// import { Check } from "lucide-react"

// type Step = {
//   id: number
//   name: string
// }

// type ProgressBarProps = {
//   steps: Step[]
//   currentStep: number
// }

// export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
//   return (
//     <>
//       {/* DESKTOP VERSION - Vertical progress bar (hidden on mobile) */}
//       <div className="hidden lg:block fixed left-[max(calc(50%-600px),20px)] top-18 w-[60px] flex items-center">
//         <div className="relative h-[400px] w-full">
//           {/* Container for circles and lines with exact positioning */}
//           <div className="absolute inset-0 flex flex-col justify-between py-8">
//             {/* Background line container */}
//             <div className="absolute inset-0 flex flex-col justify-between py-8 pointer-events-none">
//               <div className="relative flex-1">
//                 {/* Static background line - vertical line behind the progress */}
//                 <div
//                   className="absolute left-1/2 w-[2px] bg-black/20 transform -translate-x-1/2"
//                   style={{
//                     top: "20px", // Half of circle height
//                     bottom: "20px", // Half of circle height
//                   }}
//                 />

//                 {/* Animated progress line - grows from top to bottom */}
//                 <motion.div
//                   className="absolute left-1/2 w-[2px] bg-black transform -translate-x-1/2 origin-top"
//                   style={{
//                     top: "20px", // Half of circle height
//                     height: `calc(100% - 40px)`, // Full height minus circle height
//                   }}
//                   initial={{ scaleY: 0 }}
//                   animate={{
//                     scaleY: Math.min((currentStep - 1) / (steps.length - 1), 1),
//                   }}
//                   transition={{
//                     duration: 0.4,
//                     ease: [0.4, 0, 0.2, 1],
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Step circles - arranged vertically */}
//             {steps.map((step) => (
//               <div key={step.id} className="relative flex items-center justify-center z-10">
//                 {/* Circle with animation for active/completed states */}
//                 <motion.div
//                   initial={false}
//                   animate={{
//                     scale: currentStep >= step.id ? 1 : 0.8,
//                     backgroundColor: currentStep >= step.id ? "rgb(0 0 0)" : "rgb(255 255 255)",
//                   }}
//                   transition={{
//                     duration: 0.4,
//                     ease: "easeInOut",
//                   }}
//                   className={`
//                     flex items-center justify-center w-10 h-10 rounded-full 
//                     border-2 border-black shadow-md
//                     ${currentStep >= step.id ? "text-yellow-400" : "text-black"}
//                   `}
//                 >
//                   {/* Check mark for completed steps, number for current/future steps */}
//                   {currentStep > step.id ? (
//                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
//                       <Check className="w-5 h-5" />
//                     </motion.div>
//                   ) : (
//                     <span className="text-sm font-medium">{step.id}</span>
//                   )}
//                 </motion.div>

//                 {/* Step name label - positioned to the right of the circle */}
//                 <motion.span
//                   initial={{ opacity: 0, x: -10 }}
//                   animate={{
//                     opacity: 1,
//                     x: 0,
//                     color: currentStep >= step.id ? "rgb(0 0 0)" : "rgb(0 0 0 / 0.5)",
//                   }}
//                   transition={{ duration: 0.3 }}
//                   className="absolute left-16 whitespace-nowrap text-sm font-medium"
//                 >
//                   {step.name}
//                 </motion.span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* MOBILE VERSION - Horizontal progress bar (shown only on mobile) */}
//       <div className="lg:hidden w-full">
//         <div className="relative h-[80px] w-full bg-yellow-400 rounded-lg p-4 shadow-md">
//           {/* Container for circles and lines with horizontal layout */}
//           <div className="absolute inset-0 flex items-center px-4">
//             {/* Background line container */}
//             <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
//               <div className="relative w-full">
//                 {/* Static background line - horizontal line behind the progress */}
//                 <div
//                   className="absolute top-1/2 h-[2px] bg-black/20 transform -translate-y-1/2"
//                   style={{
//                     left: "20px", // Half of circle width
//                     right: "20px", // Half of circle width
//                   }}
//                 />

//                 {/* Animated progress line - grows from left to right */}
//                 <motion.div
//                   className="absolute top-1/2 h-[2px] bg-black transform -translate-y-1/2 origin-left"
//                   style={{
//                     left: "20px", // Half of circle width
//                     width: `calc(100% - 40px)`, // Full width minus circle width
//                   }}
//                   initial={{ scaleX: 0 }}
//                   animate={{
//                     scaleX: Math.min((currentStep - 1) / (steps.length - 1), 1),
//                   }}
//                   transition={{
//                     duration: 0.4,
//                     ease: [0.4, 0, 0.2, 1],
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Step circles - arranged horizontally */}
//             <div className="w-full flex justify-between items-center relative z-10">
//               {steps.map((step) => (
//                 <div key={step.id} className="flex flex-col items-center">
//                   {/* Circle with animation for active/completed states */}
//                   <motion.div
//                     initial={false}
//                     animate={{
//                       scale: currentStep >= step.id ? 1 : 0.8,
//                       backgroundColor: currentStep >= step.id ? "rgb(0 0 0)" : "rgb(255 255 255)",
//                     }}
//                     transition={{
//                       duration: 0.4,
//                       ease: "easeInOut",
//                     }}
//                     className={`
//                       flex items-center justify-center w-8 h-8 rounded-full 
//                       border-2 border-black shadow-md
//                       ${currentStep >= step.id ? "text-yellow-400" : "text-black"}
//                     `}
//                   >
//                     {/* Check mark for completed steps, number for current/future steps */}
//                     {currentStep > step.id ? (
//                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
//                         <Check className="w-4 h-4" />
//                       </motion.div>
//                     ) : (
//                       <span className="text-xs font-medium">{step.id}</span>
//                     )}
//                   </motion.div>

//                   {/* Step name label - positioned below the circle */}
//                   <motion.span
//                     initial={{ opacity: 0, y: -5 }}
//                     animate={{
//                       opacity: 1,
//                       y: 0,
//                       color: currentStep >= step.id ? "rgb(0 0 0)" : "rgb(0 0 0 / 0.5)",
//                     }}
//                     transition={{ duration: 0.3 }}
//                     className="text-[10px] mt-1 font-medium text-center max-w-[40px] truncate"
//                   >
//                     {step.name}
//                   </motion.span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

