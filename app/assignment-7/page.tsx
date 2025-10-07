'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import MIMOAnalysisAnimation from '../components/MIMOAnalysisAnimation'

export default function Assignment7Page() {
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
          <h1 className="assignment-title">Assignment 7: MIMO Systems and Channel Capacity Analysis</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Overview</h2>
            <p>
              This assignment explores Multiple Input Multiple Output (MIMO) wireless communication systems, 
              analyzing channel capacity for different antenna configurations and studying Bit Error Rate (BER) 
              performance in fading channels. Students will understand the benefits of spatial diversity and 
              multiplexing in modern wireless systems.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Learning Objectives</h2>
            <ul>
              <li>Understand MIMO system fundamentals and antenna configurations</li>
              <li>Analyze channel capacity for SISO, SIMO, MISO, and MIMO systems</li>
              <li>Study the impact of spatial diversity on system performance</li>
              <li>Evaluate BER performance in Rayleigh fading channels</li>
              <li>Compare different MIMO configurations and their capacity gains</li>
              <li>Understand the role of SNR in wireless communication quality</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Key Concepts</h2>
            <div className="concepts-grid">
              <div className="concept-item">
                <h3>MIMO Configurations</h3>
                <p>SISO (1×1), SIMO (1×2), MISO (2×1), and MIMO (2×2) antenna systems</p>
              </div>
              <div className="concept-item">
                <h3>Channel Capacity</h3>
                <p>Shannon capacity analysis for different antenna configurations</p>
              </div>
              <div className="concept-item">
                <h3>Spatial Diversity</h3>
                <p>Benefits of multiple antennas for improved reliability and capacity</p>
              </div>
              <div className="concept-item">
                <h3>BER Analysis</h3>
                <p>Bit Error Rate performance in BPSK modulation over fading channels</p>
              </div>
              <div className="concept-item">
                <h3>Rayleigh Fading</h3>
                <p>Statistical modeling of multipath fading in wireless channels</p>
              </div>
              <div className="concept-item">
                <h3>SNR Impact</h3>
                <p>Signal-to-Noise Ratio effects on system performance and capacity</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Explore MIMO system performance through interactive simulations. Analyze how different 
              antenna configurations affect channel capacity and observe BER performance under 
              various SNR conditions in Rayleigh fading environments.
            </p>
            <MIMOAnalysisAnimation />
          </section>

          <section className="assignment-section">
            <h2>MIMO System Theory</h2>
            <div className="theory-grid">
              <div className="theory-item">
                <h3>Channel Capacity Formulas</h3>
                <p><strong>SISO:</strong> C = log₂(1 + SNR × |h|²)</p>
                <p><strong>SIMO:</strong> C = log₂(1 + SNR × ||h||²)</p>
                <p><strong>MISO:</strong> C = log₂(1 + SNR × ||h||²)</p>
                <p><strong>MIMO:</strong> C = log₂(det(I + (SNR/Nₜ) × H × H†))</p>
              </div>
              <div className="theory-item">
                <h3>Diversity Gains</h3>
                <p><strong>Receive Diversity:</strong> Multiple antennas at receiver improve reliability</p>
                <p><strong>Transmit Diversity:</strong> Multiple antennas at transmitter enhance coverage</p>
                <p><strong>Spatial Multiplexing:</strong> MIMO enables parallel data streams</p>
              </div>
              <div className="theory-item">
                <h3>Fading Channel Model</h3>
                <p><strong>Rayleigh Fading:</strong> h ~ CN(0,1) complex Gaussian distribution</p>
                <p><strong>AWGN:</strong> n ~ CN(0,σ²) additive white Gaussian noise</p>
                <p><strong>Received Signal:</strong> r = h × s + n</p>
              </div>
              <div className="theory-item">
                <h3>Performance Metrics</h3>
                <p><strong>Channel Capacity:</strong> Maximum achievable data rate (bits/sec/Hz)</p>
                <p><strong>BER:</strong> Probability of bit error in digital transmission</p>
                <p><strong>SNR:</strong> Signal-to-Noise Ratio in dB scale</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Applications</h2>
            <ul>
              <li>4G/5G cellular communication systems</li>
              <li>WiFi 802.11n/ac/ax standards with MIMO</li>
              <li>Massive MIMO for 5G base stations</li>
              <li>Satellite communication systems</li>
              <li>Radar and sensing applications</li>
              <li>Wireless backhaul networks</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Expected Results</h2>
            <div className="results-grid">
              <div className="result-item">
                <h3>Capacity Trends</h3>
                <p>MIMO (2×2) > SIMO (1×2) ≈ MISO (2×1) > SISO (1×1)</p>
                <p>Higher antenna count leads to increased capacity</p>
              </div>
              <div className="result-item">
                <h3>SNR Dependency</h3>
                <p>Capacity increases logarithmically with SNR</p>
                <p>MIMO shows steepest capacity growth at high SNR</p>
              </div>
              <div className="result-item">
                <h3>BER Performance</h3>
                <p>BER decreases exponentially with increasing SNR</p>
                <p>Rayleigh fading causes performance degradation</p>
              </div>
              <div className="result-item">
                <h3>Diversity Benefits</h3>
                <p>Multiple antennas provide robustness against fading</p>
                <p>Spatial diversity improves link reliability</p>
              </div>
            </div>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment7/mimo_capacity_analysis.m" className="file-card" download>
                <Code size={24} />
                <span>mimo_capacity_analysis.m</span>
                <small>MATLAB Channel Capacity Code</small>
              </a>
              <a href="/assignments/assignment7/siso_ber_analysis.m" className="file-card" download>
                <Code size={24} />
                <span>siso_ber_analysis.m</span>
                <small>MATLAB BER Analysis Code</small>
              </a>
              <a href="/assignments/assignment7/README.md" className="file-card" download>
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