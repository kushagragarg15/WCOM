'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  useEffect(() => {
    // Current year
    const yearEl = document.getElementById("year")
    if (yearEl) yearEl.textContent = new Date().getFullYear().toString()

    // Mobile nav toggle
    const toggle = document.querySelector(".nav-toggle") as HTMLButtonElement
    const nav = document.getElementById("site-nav")
    if (toggle && nav) {
      const handleToggle = () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true"
        toggle.setAttribute("aria-expanded", String(!expanded))
        nav.classList.toggle("open", !expanded)
      }
      toggle.addEventListener("click", handleToggle)
      
      // Close menu when clicking link (mobile)
      const handleNavClick = (e: Event) => {
        const t = e.target as HTMLElement
        if (t && t.tagName === "A" && nav.classList.contains("open")) {
          nav.classList.remove("open")
          toggle.setAttribute("aria-expanded", "false")
        }
      }
      nav.addEventListener("click", handleNavClick)

      return () => {
        toggle.removeEventListener("click", handleToggle)
        nav.removeEventListener("click", handleNavClick)
      }
    }
  }, [])

  useEffect(() => {
    // Reveal on scroll
    const reveals = Array.from(document.querySelectorAll(".reveal"))
    if ("IntersectionObserver" in window && reveals.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible")
              io.unobserve(entry.target)
            }
          })
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
      )
      reveals.forEach((el) => io.observe(el))
      
      return () => io.disconnect()
    } else {
      // Fallback: show immediately
      reveals.forEach((el) => el.classList.add("visible"))
    }
  }, [])

  return (
    <>
      <header className="site-header" role="banner">
        <div className="container nav">
          <Link className="brand" href="/" aria-label="WCOM Lab Home">
            <span>WCOM Lab</span>
            <span className="dept-label">Department of CCE</span>
          </Link>

          <button className="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle navigation">
            <span className="bar"></span><span className="bar"></span><span className="bar"></span>
          </button>

          <nav id="site-nav" className="nav-links" role="navigation" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/assignments">Assignments</Link>
            <Link href="/contact">Contact</Link>
            <Image 
              src="https://lnmiit.ac.in/wp-content/uploads/2023/07/LNMIIT-Logo-Transperant-Background.png" 
              alt="LNMIIT Logo" 
              width={80} 
              height={80}
              className="lnmiit-logo"
            />
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="hero section reveal" aria-labelledby="hero-title">
          <div className="hero-background">
            <div className="mythical-communication">
              {/* Ethereal Signal Orbs */}
              <div className="signal-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
                <div className="orb orb-4"></div>
                <div className="orb orb-5"></div>
              </div>
              
              {/* Flowing Energy Streams */}
              <div className="energy-streams">
                <div className="stream-path path-1"></div>
                <div className="stream-path path-2"></div>
                <div className="stream-path path-3"></div>
                <div className="stream-path path-4"></div>
              </div>
              
              {/* Geometric Signal Patterns */}
              <div className="signal-geometry">
                <div className="geo-circle circle-1"></div>
                <div className="geo-circle circle-2"></div>
                <div className="geo-hexagon hex-1"></div>
                <div className="geo-hexagon hex-2"></div>
                <div className="geo-triangle tri-1"></div>
                <div className="geo-triangle tri-2"></div>
              </div>
              
              {/* Mystical Connection Lines */}
              <div className="connection-web">
                <div className="web-line line-1"></div>
                <div className="web-line line-2"></div>
                <div className="web-line line-3"></div>
                <div className="web-line line-4"></div>
                <div className="web-line line-5"></div>
              </div>
              
              {/* Floating Runes/Symbols */}
              <div className="signal-runes">
                <div className="rune rune-wifi"></div>
                <div className="rune rune-wave"></div>
                <div className="rune rune-signal"></div>
                <div className="rune rune-network"></div>
              </div>
            </div>
          </div>
          <div className="container hero-content">
            <div className="hero-text">
              <h1 id="hero-title" className="title text-balance animate-fade-in">WCOM Lab Assignments Portal</h1>
              <p className="lead text-pretty animate-slide-up">
                A modern, minimal hub to explore WCOM lab assignments, resources, and team profiles under the Department of CCE, LNMIIT.
              </p>
              <div className="cta animate-fade-in-delayed">
                <Link className="btn btn-primary" href="/assignments">View Assignments</Link>
                <Link className="btn btn-ghost" href="#about">Learn More</Link>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section reveal" aria-labelledby="about-title">
          <div className="container">
            <h2 id="about-title" className="section-title centered-title">About WCOM Lab</h2>
            <div className="learning-objectives">
              <h3 className="objectives-title">Learning Objectives and Overview</h3>
              <p className="objectives-text">
                The objective of this course is to equip students with a comprehensive understanding of wireless 
                communication systems with hands-on experience on wireless channel modeling, large-scale fading, and 
                statistical fading models, key technologies through simulations in MATLAB. They will learn about wireless 
                channel capacity, performance evaluation using BER, and diversity techniques to combat fading in wireless 
                channel. Students will gain practical experience implementing MIMO systems, Zero-Forcing (ZF), and 
                MMSE detection techniques, as well as exploring multi-carrier modulation like OFDM. Lab sessions will 
                enhance practical expertise, allowing students to apply these cutting-edge technologies in real-world wireless 
                communication scenarios.
              </p>
              <div className="cif-button-container">
                <a 
                  href="/CCE-CIF-Wireless-Communication-Lab.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary cif-button"
                  download="CCE-CIF-Wireless-Communication-Lab.pdf"
                >
                  See CIF
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section reveal" aria-labelledby="quick-assignments">
          <div className="container">
            <div className="section-header">
              <h2 id="quick-assignments" className="section-title">Quick Access</h2>
              <Link className="link" href="/assignments">Browse all assignments</Link>
            </div>
            <div className="assignments-grid">
              <Link className="tile" href="/assignment-1" aria-label="Open Assignment 1">
                <span className="tile-title">Assignment 1</span>
                <span className="tile-subtitle">Gaussian Random Variable Distribution</span>
              </Link>
              <Link className="tile" href="/assignment-2" aria-label="Open Assignment 2">
                <span className="tile-title">Assignment 2</span>
                <span className="tile-subtitle">Path Loss and Shadowing Analysis</span>
              </Link>
              <Link className="tile" href="/assignment-3" aria-label="Open Assignment 3">
                <span className="tile-title">Assignment 3</span>
                <span className="tile-subtitle">Hata-Okumura and Two-Ray Models</span>
              </Link>
              <Link className="tile" href="/assignment-4" aria-label="Open Assignment 4">
                <span className="tile-title">Assignment 4</span>
                <span className="tile-subtitle">Rician Fading and Jakes Doppler Spectrum</span>
              </Link>
              <Link className="tile" href="/assignment-5" aria-label="Open Assignment 5">
                <span className="tile-title">Assignment 5</span>
                <span className="tile-subtitle">Cellular Network Analysis with H4 Fading</span>
              </Link>
              <Link className="tile" href="/assignment-6" aria-label="Open Assignment 6">
                <span className="tile-title">Assignment 6</span>
                <span className="tile-subtitle">Water-filling Power Allocation Algorithm</span>
              </Link>
            </div>
          </div>
        </section>
      </main>


    </>
  )
}
