'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import RicianJakesAnimation from '../components/RicianJakesAnimation'

export default function Assignment4Page() {
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
          <h1 className="assignment-title">Assignment 4: Rician Fading and Jakes Doppler Spectrum Analysis</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Objective</h2>
            <p>
              Simulate and analyze the Rician Fading Distribution and the Jakes Doppler Spectrum 
              to understand time-varying fading environments in wireless communication channels. 
              This assignment builds upon statistical foundations to explore mobile communication 
              channel characteristics.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Theory Background</h2>
            <div className="theory-grid">
              <div className="theory-item">
                <h3>Rician Fading Distribution</h3>
                <p>Occurs when signal travels along multiple paths including:</p>
                <ul>
                  <li><strong>Line-of-Sight (LOS) Component:</strong> Direct path between transmitter and receiver</li>
                  <li><strong>Scattered Components:</strong> Multiple reflected/diffracted paths</li>
                  <li><strong>K-factor:</strong> Ratio of power in dominant component to scattered components</li>
                </ul>
              </div>
              <div className="theory-item">
                <h3>Jakes Doppler Spectrum</h3>
                <p>Arises from relative motion and scatterer movement:</p>
                <ul>
                  <li><strong>Uniform Angular Distribution:</strong> Incoming waves from all directions</li>
                  <li><strong>U-shaped Profile:</strong> Power concentrated at ±f_max</li>
                  <li><strong>Maximum Doppler Shift:</strong> f_max = v/λ = vf_c/c</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Key Concepts</h2>
            <div className="concepts-grid">
              <div className="concept-item">
                <h3>K-factor Analysis</h3>
                <p>Impact of different K-factor values (0, 1, 3, 10) on fading characteristics</p>
              </div>
              <div className="concept-item">
                <h3>Doppler Effects</h3>
                <p>Spectral shaping due to mobility and scatterer distribution</p>
              </div>
              <div className="concept-item">
                <h3>Autocorrelation Function</h3>
                <p>Time-domain correlation analysis using Bessel functions</p>
              </div>
              <div className="concept-item">
                <h3>Coherence Time</h3>
                <p>Channel stability duration: T_c ≈ 1/(πf_max)</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Simulation Parameters</h2>
            <div className="parameters-grid">
              <div className="param-group">
                <h3>Rician Fading</h3>
                <ul>
                  <li>K-factor values: [0, 1, 3, 10]</li>
                  <li>Average power (Ω): 1</li>
                  <li>Sample count: 100,000</li>
                  <li>Statistical validation</li>
                </ul>
              </div>
              <div className="param-group">
                <h3>Jakes Doppler</h3>
                <ul>
                  <li>Maximum Doppler: 100 Hz</li>
                  <li>Channel power (σ²): 1</li>
                  <li>Sampling frequency: 1000 Hz</li>
                  <li>Observation time: 10 seconds</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Applications</h2>
            <div className="applications-grid">
              <div className="app-item">
                <h3>Vehicle-to-Vehicle (V2V)</h3>
                <p>High mobility scenarios with large Doppler shifts (f_max > 1 kHz)</p>
              </div>
              <div className="app-item">
                <h3>Satellite Communications</h3>
                <p>Strong LOS with high K-factor (K > 10 dB) and low Doppler</p>
              </div>
              <div className="app-item">
                <h3>High-Speed Rail</h3>
                <p>Extreme Doppler (up to 2 kHz at 300 km/h) with rapid cell transitions</p>
              </div>
              <div className="app-item">
                <h3>Mobile Cellular Systems</h3>
                <p>Mixed LOS/NLOS environments with varying K-factors</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Experience Rician fading and Jakes Doppler spectrum in real-time. Adjust the 
              K-factor to see how the LOS component affects fading characteristics, and observe 
              how Doppler spread impacts channel coherence time.
            </p>
            <RicianJakesAnimation />
          </section>

          <section className="assignment-section">
            <h2>Learning Outcomes</h2>
            <ul>
              <li>Rician Fading Characteristics and K-factor significance</li>
              <li>Doppler Effects and spectral shaping due to mobility</li>
              <li>Channel Correlation and time-varying behavior</li>
              <li>System Design impact on communication performance</li>
              <li>Statistical Modeling using advanced probability distributions</li>
              <li>MATLAB Skills for complex signal processing and visualization</li>
            </ul>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment4/rician_jakes_analysis.m" className="file-card" download>
                <Code size={24} />
                <span>rician_jakes_analysis.m</span>
                <small>MATLAB Implementation</small>
              </a>
              <a href="/assignments/assignment4/Assignment4_RicianJakes.md" className="file-card" download>
                <FileText size={24} />
                <span>Assignment Documentation</span>
                <small>Complete Theory & Analysis</small>
              </a>
              <a href="/assignments/assignment4/README.md" className="file-card" download>
                <FileText size={24} />
                <span>Assignment Guide</span>
                <small>Quick Reference</small>
              </a>
              <a href="/presentations/Assignment 4 - Rician Fading & Jakes Spectrum.pptx" className="file-card" download>
                <FileText size={24} />
                <span>Presentation Slides</span>
                <small>Data Flow & Pseudocode</small>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}