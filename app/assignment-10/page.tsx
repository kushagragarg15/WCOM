'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import AlamoutiSTBCAnimation from '../components/AlamoutiSTBCAnimation'

export default function Assignment10Page() {
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
          <h1 className="assignment-title">Assignment 10: Alamouti Space-Time Block Coding</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Overview</h2>
            <p>
              This assignment implements the Alamouti Space-Time Block Coding (STBC) scheme using BPSK 
              and QPSK modulation. Students will compare the performance of Alamouti 2×1 STBC against 
              normal 2×1 MISO systems, understanding how space-time coding provides transmit diversity 
              without requiring channel state information at the transmitter.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Learning Objectives</h2>
            <ul>
              <li>Understand Alamouti Space-Time Block Coding principles</li>
              <li>Implement STBC encoding and decoding algorithms</li>
              <li>Compare BPSK and QPSK performance with Alamouti coding</li>
              <li>Analyze transmit diversity gains in fading channels</li>
              <li>Study orthogonal space-time code properties</li>
              <li>Evaluate complexity vs. performance trade-offs</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Key Concepts</h2>
            <div className="concepts-grid">
              <div className="concept-item">
                <h3>Alamouti STBC</h3>
                <p>First space-time block code providing full transmit diversity with linear decoding</p>
              </div>
              <div className="concept-item">
                <h3>Orthogonal Design</h3>
                <p>Code matrix orthogonality enables simple maximum likelihood decoding</p>
              </div>
              <div className="concept-item">
                <h3>Transmit Diversity</h3>
                <p>Spatial diversity achieved without channel feedback to transmitter</p>
              </div>
              <div className="concept-item">
                <h3>BPSK vs QPSK</h3>
                <p>Performance comparison of binary and quadrature phase shift keying</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Explore Alamouti Space-Time Block Coding through interactive simulations. Compare 
              the BER performance of normal MISO systems against Alamouti STBC for both BPSK 
              and QPSK modulation schemes in Rayleigh fading channels.
            </p>
            <AlamoutiSTBCAnimation />
          </section>

          <section className="assignment-section">
            <h2>Applications</h2>
            <ul>
              <li>3G/4G cellular systems (WCDMA, LTE)</li>
              <li>WiFi standards (802.11n/ac with STBC)</li>
              <li>WiMAX and mobile broadband systems</li>
              <li>Digital TV broadcasting (DVB-T2)</li>
              <li>Satellite communication systems</li>
              <li>Wireless sensor networks</li>
            </ul>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment10/alamouti_bpsk_analysis.m" className="file-card" download>
                <Code size={24} />
                <span>alamouti_bpsk_analysis.m</span>
                <small>MATLAB BPSK Implementation</small>
              </a>
              <a href="/assignments/assignment10/alamouti_qpsk_analysis.m" className="file-card" download>
                <Code size={24} />
                <span>alamouti_qpsk_analysis.m</span>
                <small>MATLAB QPSK Implementation</small>
              </a>
              <a href="/assignments/assignment10/README.md" className="file-card" download>
                <FileText size={24} />
                <span>Assignment Guide</span>
                <small>Complete Documentation</small>
              </a>
              <a href="/presentations/Assignment 10 - Alamouti STBC.pptx" className="file-card" download>
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