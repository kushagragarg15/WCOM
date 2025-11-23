'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import CellularNetworkAnimation from '../components/CellularNetworkAnimation'

export default function Assignment5Page() {
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
          <h1 className="assignment-title">Assignment 5: Cellular Network Analysis with H4 Fading</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Objective</h2>
            <p>
              Simulate and analyze a cellular network scenario with multiple users, incorporating 
              path loss models, shadowing effects, and H4 cascaded fading. Compare achievable 
              data rates with and without fading, and study the relationship between user velocity 
              and channel coherence time.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Theory Background</h2>
            <div className="theory-grid">
              <div className="theory-item">
                <h3>Cellular Network Model</h3>
                <p>Key components of the simulation:</p>
                <ul>
                  <li><strong>Base Station:</strong> Located at origin (0,0)</li>
                  <li><strong>User Distribution:</strong> 10 users randomly distributed within 1000m radius</li>
                  <li><strong>Path Loss Model:</strong> Log-distance with exponent 3.5</li>
                  <li><strong>Shadowing:</strong> Log-normal with 8dB standard deviation</li>
                </ul>
              </div>
              <div className="theory-item">
                <h3>H4 Cascaded Fading</h3>
                <p>Advanced fading model characteristics:</p>
                <ul>
                  <li><strong>Cascaded Channel:</strong> h4 = h1 × h2 × h3 × h4</li>
                  <li><strong>Rayleigh Components:</strong> Each hi follows Rayleigh distribution</li>
                  <li><strong>Severe Fading:</strong> More realistic than simple Rayleigh</li>
                  <li><strong>Performance Impact:</strong> Significant rate degradation</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>System Parameters</h2>
            <div className="parameters-grid">
              <div className="param-group">
                <h3>RF Parameters</h3>
                <ul>
                  <li>Carrier Frequency: 20 GHz</li>
                  <li>Transmit Power: 46 dBm</li>
                  <li>Antenna Gains: Tx=15dBi, Rx=0dBi</li>
                  <li>Bandwidth: 10 MHz</li>
                </ul>
              </div>
              <div className="param-group">
                <h3>Channel Model</h3>
                <ul>
                  <li>Path Loss Exponent: 3.5</li>
                  <li>Shadowing Std: 8 dB</li>
                  <li>Noise Temperature: 240 K</li>
                  <li>Coverage Radius: 1000 m</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Experience the cellular network simulation in real-time. Watch how users are 
              distributed around the base station, observe the impact of H4 fading on data 
              rates, and explore the relationship between mobility and channel coherence.
            </p>
            <CellularNetworkAnimation />
          </section>

          <section className="assignment-section">
            <h2>Key Observations</h2>
            <div className="observations-grid">
              <div className="observation-item">
                <h3>User Distribution</h3>
                <p>Users are randomly distributed within the cell coverage area, with distances affecting path loss and received power.</p>
              </div>
              <div className="observation-item">
                <h3>Fading Impact</h3>
                <p>H4 cascaded fading significantly reduces achievable data rates compared to the no-fading scenario.</p>
              </div>
              <div className="observation-item">
                <h3>Mobility Effects</h3>
                <p>Higher user velocities result in shorter coherence times, affecting channel estimation and tracking.</p>
              </div>
              <div className="observation-item">
                <h3>Rate Variation</h3>
                <p>Data rates vary significantly among users due to different distances and fading realizations.</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Applications</h2>
            <ul>
              <li>5G/6G cellular network planning and optimization</li>
              <li>User equipment (UE) positioning and handover strategies</li>
              <li>Resource allocation and scheduling algorithms</li>
              <li>Quality of Service (QoS) provisioning</li>
              <li>Network capacity analysis and dimensioning</li>
              <li>Interference management in dense deployments</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Learning Outcomes</h2>
            <ul>
              <li>Understanding cellular network topology and user distribution</li>
              <li>Analysis of path loss and shadowing effects in realistic scenarios</li>
              <li>Impact of advanced fading models on system performance</li>
              <li>Relationship between user mobility and channel characteristics</li>
              <li>Data rate calculations and capacity analysis</li>
              <li>MATLAB skills for cellular network simulation</li>
            </ul>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment5/cellular_network_analysis.m" className="file-card" download>
                <Code size={24} />
                <span>cellular_network_analysis.m</span>
                <small>MATLAB Implementation</small>
              </a>
              <a href="/assignments/assignment5/Assignment5_CellularNetwork.md" className="file-card" download>
                <FileText size={24} />
                <span>Assignment Documentation</span>
                <small>Complete Theory & Analysis</small>
              </a>
              <a href="/presentations/Assignment 5 Wireless System Capacity Simulation.pptx" className="file-card" download>
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