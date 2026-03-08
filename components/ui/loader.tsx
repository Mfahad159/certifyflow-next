"use client"

import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface LoaderProps {
  className?: string
  size?: number
  speed?: number
  stroke?: number
  color?: string
}

export function Loader({
  className,
  size = 80,
  speed = 1.4,
  stroke = 5,
  color = "currentColor"
}: LoaderProps) {

  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('loader-styles')) {
      const style = document.createElement('style')
      style.id = 'loader-styles'
      style.textContent = `
        .loader-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: var(--uib-stroke);
          width: var(--uib-size);
          border-radius: calc(var(--uib-stroke) / 2);
          overflow: hidden;
          transform: translate3d(0, 0, 0);
        }

        .loader-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background-color: var(--uib-color);
          opacity: var(--uib-bg-opacity);
          transition: background-color 0.3s ease;
        }

        .loader-container::after {
          content: '';
          height: 100%;
          width: 100%;
          border-radius: calc(var(--uib-stroke) / 2);
          animation: zoom var(--uib-speed) ease-in-out infinite;
          transform: translateX(-100%);
          background-color: var(--uib-color);
          transition: background-color 0.3s ease;
        }

        @keyframes zoom {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return (
    <div
      className={cn("loader-container", className)}
      style={{
        // @ts-ignore
        '--uib-size': `${size}px`,
        '--uib-color': color,
        '--uib-speed': `${speed}s`,
        '--uib-stroke': `${stroke}px`,
        '--uib-bg-opacity': '.1',
      }}
    />
  )
}
