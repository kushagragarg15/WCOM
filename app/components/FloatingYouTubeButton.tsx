'use client'

import { useState, useEffect } from 'react'

export default function FloatingYouTubeButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000) // Show after 3 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className={`floating-youtube-button ${isHovered ? 'expanded' : ''}`}>
      <button 
        className="close-button"
        onClick={handleClose}
        aria-label="Close YouTube promotion"
      >
        ×
      </button>
      
      <div 
        className="youtube-float-content"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="youtube-float-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        
        <div className="youtube-float-text">
          <div className="youtube-float-title">Wireless Visionaries</div>
          <div className="youtube-float-subtitle">Watch our tutorials!</div>
        </div>
        
        <a 
          href="https://www.youtube.com/@wireless_visionaries" 
          target="_blank" 
          rel="noopener noreferrer"
          className="youtube-float-button"
        >
          Subscribe
        </a>
      </div>
    </div>
  )
}