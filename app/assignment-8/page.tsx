'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import DiversityCombiningAnimation from '../components/DiversityCombiningAnimation'

export default function Assignment8Page() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="site-header" role="banner">
        <div className="container nav">
          <Link className="brand" href="/" aria-label="WCOM Lab Home">
            <span>WCOM Lab</span>
            <span className="dept-label">Department of CCE</span>
          </Link>
          <nav className="nav-links" role="navigation">
            <Link href="/">Home</Link>
            <Link href="/assignments">Assignments</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="assignment-header">
          <Link href="/" className="back-link">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="assignment-title">Assignment 8: Diversity Combining Techniques</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Overview</h2>
            <p>
              This assignment explores diversity combining techniques in wireless communication systems, 
              comparing the performance of Selection Combining (SC), Equal Gain Combining (EGC), and 
              Maximum Ratio Combining (MRC) methods. Students will analyze BER performance and understand 
              how diversity improves system reliability in fading channels.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Learning Objectives</h2>
            <ul>
              <li>Understand diversity combining principles and their importance</li>
              <li>Implement Selection Combining (SC) technique</li>
              <li>Analyze Equal Gain Combining (EGC) performance</li>
              <li>Study Maximum Ratio Combining (MRC) optimization</li>
              <li>Compare BER performance of different combining methods</li>
              <li>Evaluate diversity gain and system improvements</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Key Concepts</h2>
            <div className="concepts-grid">
              <div className="concept-item">
                <h3>Selection Combining (SC)</h3>
                <p>Select the branch with the highest instantaneous SNR for signal detection</p>
              </div>
              <div className="concept-item">
                <h3>Equal Gain Combining (EGC)</h3>
                <p>Combine all branches with equal weights after phase alignment</p>
              </div>
              <div className="concept-item">
                <h3>Maximum Ratio Combining (MRC)</h3>
                <p>Optimal combining with weights proportional to branch SNR</p>
              </div>
              <div className="concept-item">
                <h3>Diversity Gain</h3>
                <p>Performance improvement achieved through multiple signal paths</p>
              </div>
              <div className="concept-item">
                <h3>Rayleigh Fading</h3>
                <p>Statistical model for multipath fading in wireless channels</p>
              </div>
              <div className="concept-item">
                <h3>BER Analysis</h3>
                <p>Bit Error Rate performance evaluation under fading conditions</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Explore diversity combining techniques through interactive simulations. Compare the 
              BER performance of SC, EGC, and MRC methods and observe how diversity order affects 
              system performance in Rayleigh fading environments.
            </p>
            <DiversityCombiningAnimation />
          </section>

          <section className="assignment-section">
            <h2>Applications</h2>
            <ul>
              <li>Cellular base stations with multiple antennas</li>
              <li>WiFi systems with antenna diversity</li>
              <li>Satellite communication receivers</li>
              <li>Wireless sensor networks</li>
              <li>Mobile handset diversity implementations</li>
              <li>Radar systems with multiple receivers</li>
            </ul>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment8/diversity_combining_analysis.m" className="file-card" download>
                <Code size={24} />
                <span>diversity_combining_analysis.m</span>
                <small>MATLAB Implementation</small>
              </a>
              <a href="/assignments/assignment8/README.md" className="file-card" download>
                <FileText size={24} />
                <span>Assignment Guide</span>
                <small>Complete Documentation</small>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}