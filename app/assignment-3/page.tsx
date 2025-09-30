'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import HataTwoRayAnimation from '../components/HataTwoRayAnimation'

export default function Assignment3Page() {
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
          <h1 className="assignment-title">Assignment 3: Hata-Okumura and Two-Ray Ground Reflection Models</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Overview</h2>
            <p>
              This assignment explores advanced propagation models used in wireless communication 
              systems, focusing on the Hata-Okumura model for urban environments and the 
              Two-Ray Ground Reflection model for line-of-sight scenarios.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Learning Objectives</h2>
            <ul>
              <li>Understand the Hata-Okumura empirical propagation model</li>
              <li>Analyze the Two-Ray Ground Reflection model</li>
              <li>Compare different propagation models for various environments</li>
              <li>Study the impact of antenna heights on path loss</li>
              <li>Evaluate model validity ranges and limitations</li>
              <li>Apply models to real-world cellular network planning</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Key Models</h2>
            <div className="models-grid">
              <div className="model-item">
                <h3>Hata-Okumura Model</h3>
                <p>Empirical model for urban areas</p>
                <ul>
                  <li>Frequency range: 150-1500 MHz</li>
                  <li>Distance range: 1-20 km</li>
                  <li>Transmitter height: 30-200 m</li>
                  <li>Receiver height: 1-10 m</li>
                </ul>
              </div>
              <div className="model-item">
                <h3>Two-Ray Ground Reflection</h3>
                <p>Theoretical model for LOS scenarios</p>
                <ul>
                  <li>Direct path component</li>
                  <li>Ground reflected component</li>
                  <li>Antenna height dependency</li>
                  <li>Distance^4 power law</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Implementation Parameters</h2>
            <div className="parameters-grid">
              <div className="param-group">
                <h3>System Parameters</h3>
                <ul>
                  <li>Carrier frequency: 900 MHz</li>
                  <li>Transmitter height: 50 m</li>
                  <li>Receiver height: 1.5 m</li>
                  <li>Distance range: 1-20 km</li>
                </ul>
              </div>
              <div className="param-group">
                <h3>Analysis Results</h3>
                <ul>
                  <li>Path loss vs distance plots</li>
                  <li>Received power calculations</li>
                  <li>Model comparison analysis</li>
                  <li>Environment-specific behavior</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Compare the Hata-Okumura empirical model with the Two-Ray Ground Reflection 
              theoretical model. Observe how different environments, frequencies, and antenna 
              heights affect propagation characteristics in real-time.
            </p>
            <HataTwoRayAnimation />
          </section>

          <section className="assignment-section">
            <h2>Applications</h2>
            <ul>
              <li>Cellular base station coverage planning</li>
              <li>Urban propagation prediction</li>
              <li>Interference analysis between cells</li>
              <li>Antenna height optimization</li>
              <li>Network capacity planning</li>
              <li>5G mmWave deployment strategies</li>
            </ul>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment3/hata_tworay_models.m" className="file-card" download>
                <Code size={24} />
                <span>hata_tworay_models.m</span>
                <small>MATLAB Implementation</small>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}