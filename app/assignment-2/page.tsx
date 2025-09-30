'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import PathLossAnimation from '../components/PathLossAnimation'

export default function Assignment2Page() {
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
          <h1 className="assignment-title">Assignment 2: Path Loss and Shadowing Analysis</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Overview</h2>
            <p>
              This assignment focuses on analyzing path loss models and shadowing effects in wireless 
              communication systems. Students will explore free space path loss, log-distance models, 
              and the impact of shadowing on received signal power.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Learning Objectives</h2>
            <ul>
              <li>Understand free space path loss and log-distance models</li>
              <li>Analyze the impact of path loss exponent on signal attenuation</li>
              <li>Study shadowing effects using Gaussian random variables</li>
              <li>Visualize received power variation with distance</li>
              <li>Evaluate coverage and link budget calculations</li>
              <li>Compare theoretical models with realistic propagation</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Key Concepts</h2>
            <div className="concepts-grid">
              <div className="concept-item">
                <h3>Path Loss Models</h3>
                <p>Free space path loss model and log-distance path loss model analysis</p>
              </div>
              <div className="concept-item">
                <h3>Environmental Effects</h3>
                <p>Path loss exponent variations for different environment types</p>
              </div>
              <div className="concept-item">
                <h3>Shadowing Analysis</h3>
                <p>Log-normal fading and Gaussian random variable effects</p>
              </div>
              <div className="concept-item">
                <h3>Link Budget</h3>
                <p>Coverage analysis and link budget calculations</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Explore how signal strength decreases with distance and observe the impact of 
              shadowing effects in real-time. Adjust parameters to see how different environments 
              and frequencies affect path loss characteristics.
            </p>
            <PathLossAnimation />
          </section>

          <section className="assignment-section">
            <h2>Applications</h2>
            <ul>
              <li>Cellular network coverage planning</li>
              <li>WiFi access point placement</li>
              <li>Satellite link budget analysis</li>
              <li>Indoor propagation modeling</li>
              <li>5G network deployment optimization</li>
            </ul>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment2/path_loss_shadowing.m" className="file-card" download>
                <Code size={24} />
                <span>path_loss_shadowing.m</span>
                <small>MATLAB Implementation</small>
              </a>
              <a href="/assignments/assignment2/README.md" className="file-card" download>
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