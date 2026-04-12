import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/useUIStore';

const SLICES = ['WHEN', 'DO', 'ONLY_IF', 'STOP', 'CONDITION'];

/**
 * GamepadRadialMenu Component (Epic 11)
 * A premium, glassmorphic radial interface for JPE logic insertion.
 */
export const GamepadRadialMenu: React.FC = () => {
  const { isGamepadRadialOpen, gamepadRadialAngle } = useUIStore();
  
  const sliceAngle = 360 / SLICES.length;
  const currentSlice = Math.floor((gamepadRadialAngle || 0) / sliceAngle);

  return (
    <AnimatePresence>
      {isGamepadRadialOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop Blur Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

          {/* Radial Container */}
          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Spectral Ring */}
            <div className="absolute inset-0 rounded-full border border-teal-500/30 bg-gray-900/40 shadow-[0_0_50px_rgba(20,184,166,0.1)] ring-1 ring-white/10" />

            {/* Selection Slice Highlight */}
            <motion.div
              animate={{ rotate: currentSlice * sliceAngle }}
              className="absolute w-full h-full"
            >
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}
              />
            </motion.div>

            {/* JPE Keywords */}
            {SLICES.map((keyword, i) => {
              const rotation = i * sliceAngle;
              const isSelected = i === currentSlice;
              
              return (
                <motion.div
                  key={keyword}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="absolute inset-0 flex items-start justify-center pt-8"
                >
                  <motion.div
                    animate={{ 
                      scale: isSelected ? 1.2 : 1,
                      color: isSelected ? '#2dd4bf' : '#94a3b8',
                      textShadow: isSelected ? '0 0 15px rgba(45,212,191,0.5)' : 'none'
                    }}
                    style={{ transform: `rotate(${-rotation}deg)` }}
                    className="font-mono text-xl font-bold tracking-widest uppercase transition-colors"
                  >
                    {keyword}
                  </motion.div>
                </motion.div>
              );
            })}

            {/* Central Brand Core */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.5)] flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
               <span className="text-black font-black text-2xl">JPE</span>
            </div>
          </div>

          {/* Prompt Message */}
          <div className="absolute bottom-20 text-teal-400 font-mono text-sm tracking-widest animate-pulse">
            RELEASE TRIGGER TO COMMIT LOGIC
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
