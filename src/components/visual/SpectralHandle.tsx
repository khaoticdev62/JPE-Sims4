"use client";
import * as React from "react";
import { Handle, HandleProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { T } from "../robust/jpe-theme";

interface SpectralHandleProps extends HandleProps {
  color?: string;
}

export const SpectralHandle: React.FC<SpectralHandleProps> = ({ 
  color = T.cyan, 
  ...props 
}) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsating Glow Ring */}
      <motion.div
        animate={{
          scale: [1, 1.8],
          opacity: [0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="absolute w-4 h-4 rounded-full pointer-events-none"
        style={{ backgroundColor: color }}
      />
      
      {/* Static Subtle Outer Glow */}
      <div 
        className="absolute w-6 h-6 rounded-full blur-md opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <Handle
        {...props}
        className="!w-3 !h-3 !border-2 !rounded-full !z-50 !transition-transform hover:!scale-125"
        style={{ 
          backgroundColor: color,
          borderColor: T.bgSurface,
          boxShadow: `0 0 8px ${color}60`
        }}
      />
    </div>
  );
};
