'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import WaterFillingAnimation from '../components/WaterFillingAnimation'

export default function Assignment6Page() {
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
          <h1 className="assignment-title">Assignment 6: Water-filling Power Allocation Algorithm</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Objective</h2>
            <p>
              Implement and visualize the water-filling power allocation algorithm for optimal 
              power distribution across multiple wireless channels. Compare the capacity achieved 
              with water-filling versus equal power allocation, and understand the principle of 
              adaptive power allocation based on channel conditions.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Theory Background</h2>
            <div className="theory-grid">
              <div className="theory-item">
                <h3>Water-filling Algorithm</h3>
                <p>Optimal power allocation strategy:</p>
                <ul>
                  <li><strong>Principle:</strong> Allocate more power to better channels</li>
                  <li><strong>Water Level:</strong> μ (mu) represents the optimal threshold</li>
                  <li><strong>Power Allocation:</strong> P_i = max(1/μ - 1/γ_i, 0)</li>
                  <li><strong>Objective:</strong> Maximize total channel capacity</li>
                </ul>
              </div>
              <div className="theory-item">
                <h3>Channel Model</h3>
                <p>Rayleigh fading environment:</p>
                <ul>
                  <li><strong>Channel Gains:</strong> g_i = |h_i|² (Rayleigh distributed)</li>
                  <li><strong>SNR per Channel:</strong> γ_i = g_i / N₀</li>
                  <li><strong>Capacity Formula:</strong> C = Σ log₂(1 + P_i × γ_i)</li>
                  <li><strong>Power Constraint:</strong> Σ P_i ≤ P_total</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Algorithm Parameters</h2>
            <div className="parameters-grid">
              <div className="param-group">
                <h3>System Parameters</h3>
                <ul>
                  <li>Number of Channels: N = 6</li>
                  <li>Noise Power: N₀ = 1</li>
                  <li>Total Power: P_total = 5</li>
                  <li>Convergence Error: ε = 1e-6</li>
                </ul>
              </div>
              <div className="param-group">
                <h3>Optimization Process</h3>
                <ul>
                  <li>Bisection search for optimal μ</li>
                  <li>Iterative water level adjustment</li>
                  <li>Power constraint satisfaction</li>
                  <li>Capacity maximization</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Experience the water-filling algorithm in action. Watch how power is optimally 
              distributed across channels based on their quality, and see the characteristic 
              "water-filling" visualization that gives the algorithm its name.
            </p>
            <WaterFillingAnimation />
          </section>

          <section className="assignment-section">
            <h2>Key Observations</h2>
            <div className="observations-grid">
              <div className="observation-item">
                <h3>Adaptive Power Allocation</h3>
                <p>Channels with better gains receive more power, while poor channels may receive no power at all.</p>
              </div>
              <div className="observation-item">
                <h3>Water Level Principle</h3>
                <p>The algorithm finds an optimal "water level" μ that determines power allocation across all channels.</p>
              </div>
              <div className="observation-item">
                <h3>Capacity Improvement</h3>
                <p>Water-filling consistently achieves higher capacity compared to equal power distribution.</p>
              </div>
              <div className="observation-item">
                <h3>Channel Quality Impact</h3>
                <p>The algorithm automatically adapts to channel conditions, maximizing spectral efficiency.</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Mathematical Foundation</h2>
            <div className="math-concepts">
              <div className="math-item">
                <h3>Optimization Problem</h3>
                <p>Maximize: C = Σᵢ log₂(1 + Pᵢγᵢ)</p>
                <p>Subject to: Σᵢ Pᵢ ≤ P_total, Pᵢ ≥ 0</p>
              </div>
              <div className="math-item">
                <h3>Lagrangian Solution</h3>
                <p>Optimal power: Pᵢ = max(1/μ - 1/γᵢ, 0)</p>
                <p>Water level: μ found via bisection search</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Applications</h2>
            <ul>
              <li>OFDM systems with adaptive power allocation</li>
              <li>MIMO systems with parallel channels</li>
              <li>Cognitive radio spectrum management</li>
              <li>5G/6G resource allocation algorithms</li>
              <li>Satellite communication link optimization</li>
              <li>Wireless sensor network energy management</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Learning Outcomes</h2>
            <ul>
              <li>Understanding optimal power allocation principles</li>
              <li>Implementation of iterative optimization algorithms</li>
              <li>Analysis of capacity-achieving strategies</li>
              <li>Visualization of water-filling concept</li>
              <li>Comparison of allocation strategies</li>
              <li>MATLAB skills for communication system optimization</li>
            </ul>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment6/waterfilling_algorithm.m" className="file-card" download>
                <Code size={24} />
                <span>waterfilling_algorithm.m</span>
                <small>MATLAB Implementation</small>
              </a>
              <a href="/assignments/assignment6/Assignment6_WaterFilling.md" className="file-card" download>
                <FileText size={24} />
                <span>Assignment Documentation</span>
                <small>Complete Theory & Analysis</small>
              </a>
              <a href="/presentations/Assignment 6 - Water-filling Algorithm.pptx" className="file-card" download>
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