'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import ModulationMIMOAnimation from '../components/ModulationMIMOAnimation'

export default function Assignment9Page() {
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
          <h1 className="assignment-title">Assignment 9: Modulation Schemes and MIMO Techniques</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Overview</h2>
            <p>
              This assignment implements and compares various digital modulation schemes (BPSK, QPSK, QAM) 
              under different MIMO configurations (SISO, SIMO, MISO, MIMO). Students will analyze BER 
              performance in both AWGN and Rayleigh fading channels, understanding the trade-offs between 
              spectral efficiency and error performance.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Learning Objectives</h2>
            <ul>
              <li>Understand different digital modulation schemes and their characteristics</li>
              <li>Implement BPSK, QPSK, and QAM modulation techniques</li>
              <li>Analyze BER performance in AWGN and fading channels</li>
              <li>Compare SISO, SIMO, MISO, and MIMO system performance</li>
              <li>Study Alamouti Space-Time Block Coding (STBC)</li>
              <li>Evaluate spectral efficiency vs. error performance trade-offs</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Key Concepts</h2>
            <div className="concepts-grid">
              <div className="concept-item">
                <h3>BPSK Modulation</h3>
                <p>Binary Phase Shift Keying - simplest and most robust modulation</p>
              </div>
              <div className="concept-item">
                <h3>QPSK Modulation</h3>
                <p>Quadrature Phase Shift Keying - 2 bits per symbol transmission</p>
              </div>
              <div className="concept-item">
                <h3>QAM Modulation</h3>
                <p>Quadrature Amplitude Modulation - high spectral efficiency</p>
              </div>
              <div className="concept-item">
                <h3>SIMO Systems</h3>
                <p>Single Input Multiple Output with Maximum Ratio Combining</p>
              </div>
              <div className="concept-item">
                <h3>MISO Systems</h3>
                <p>Multiple Input Single Output with Alamouti STBC</p>
              </div>
              <div className="concept-item">
                <h3>MIMO Systems</h3>
                <p>Multiple Input Multiple Output with spatial diversity</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Explore modulation schemes and MIMO techniques through interactive simulations. 
              Compare BER performance of different modulation types and observe how MIMO 
              configurations improve system reliability in fading environments.
            </p>
            <ModulationMIMOAnimation />
          </section>

          <section className="assignment-section">
            <h2>Modulation Schemes Theory</h2>
            <div className="theory-grid">
              <div className="theory-item">
                <h3>BPSK (Binary PSK)</h3>
                <p><strong>Constellation:</strong> 2 points (±1)</p>
                <p><strong>Bits per Symbol:</strong> 1</p>
                <p><strong>BER (AWGN):</strong> Q(√(2Eb/N0))</p>
                <p><strong>Advantages:</strong> Most robust, simple</p>
              </div>
              <div className="theory-item">
                <h3>QPSK (Quadrature PSK)</h3>
                <p><strong>Constellation:</strong> 4 points</p>
                <p><strong>Bits per Symbol:</strong> 2</p>
                <p><strong>BER (AWGN):</strong> Q(√(2Eb/N0))</p>
                <p><strong>Advantages:</strong> 2× spectral efficiency vs BPSK</p>
              </div>
              <div className="theory-item">
                <h3>16-QAM</h3>
                <p><strong>Constellation:</strong> 16 points (4×4 grid)</p>
                <p><strong>Bits per Symbol:</strong> 4</p>
                <p><strong>BER (AWGN):</strong> Complex expression</p>
                <p><strong>Advantages:</strong> High spectral efficiency</p>
              </div>
              <div className="theory-item">
                <h3>64-QAM</h3>
                <p><strong>Constellation:</strong> 64 points (8×8 grid)</p>
                <p><strong>Bits per Symbol:</strong> 6</p>
                <p><strong>BER (AWGN):</strong> Higher SNR required</p>
                <p><strong>Advantages:</strong> Very high data rates</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>MIMO Techniques</h2>
            <div className="models-grid">
              <div className="model-item">
                <h3>SISO (1×1)</h3>
                <p><strong>Configuration:</strong> Single antenna at both ends</p>
                <p><strong>Technique:</strong> Basic modulation/demodulation</p>
                <p><strong>Performance:</strong> Baseline reference</p>
                <p><strong>Complexity:</strong> Lowest</p>
              </div>
              <div className="model-item">
                <h3>SIMO (1×2)</h3>
                <p><strong>Configuration:</strong> 1 Tx, 2 Rx antennas</p>
                <p><strong>Technique:</strong> Maximum Ratio Combining (MRC)</p>
                <p><strong>Performance:</strong> Diversity gain from multiple Rx</p>
                <p><strong>Complexity:</strong> Low to moderate</p>
              </div>
              <div className="model-item">
                <h3>MISO (2×1)</h3>
                <p><strong>Configuration:</strong> 2 Tx, 1 Rx antenna</p>
                <p><strong>Technique:</strong> Alamouti Space-Time Block Coding</p>
                <p><strong>Performance:</strong> Transmit diversity gain</p>
                <p><strong>Complexity:</strong> Moderate</p>
              </div>
              <div className="model-item">
                <h3>MIMO (2×2)</h3>
                <p><strong>Configuration:</strong> 2 Tx, 2 Rx antennas</p>
                <p><strong>Technique:</strong> Alamouti STBC with MRC</p>
                <p><strong>Performance:</strong> Maximum diversity gain</p>
                <p><strong>Complexity:</strong> Highest</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Alamouti Space-Time Block Coding</h2>
            <div className="parameters-grid">
              <div className="param-group">
                <h3>Encoding Process</h3>
                <p><strong>Input:</strong> Data symbols s₁, s₂</p>
                <p><strong>Time 1:</strong> Tx1 sends s₁, Tx2 sends s₂</p>
                <p><strong>Time 2:</strong> Tx1 sends -s₂*, Tx2 sends s₁*</p>
                <p><strong>Matrix:</strong> [s₁ s₂; -s₂* s₁*]</p>
              </div>
              <div className="param-group">
                <h3>Decoding Process</h3>
                <p><strong>Received:</strong> r₁, r₂ at two time slots</p>
                <p><strong>Combining:</strong> MRC-like processing</p>
                <p><strong>Decision:</strong> ML detection of symbols</p>
                <p><strong>Advantage:</strong> Full diversity with simple decoding</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Applications</h2>
            <ul>
              <li>4G/5G cellular networks with adaptive modulation</li>
              <li>WiFi systems with MIMO and high-order QAM</li>
              <li>Digital TV broadcasting (DVB-T2, ATSC 3.0)</li>
              <li>Satellite communication systems</li>
              <li>Wireless backhaul networks</li>
              <li>IoT devices with adaptive modulation</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Expected Results</h2>
            <div className="results-grid">
              <div className="result-item">
                <h3>Modulation Performance (SISO-AWGN)</h3>
                <p>BPSK = QPSK > 16-QAM > 64-QAM</p>
                <p>Higher order modulation requires more SNR</p>
                <p>Trade-off between spectral efficiency and robustness</p>
              </div>
              <div className="result-item">
                <h3>MIMO Performance (BPSK-Rayleigh)</h3>
                <p>SIMO shows significant diversity gain</p>
                <p>MISO and MIMO provide similar performance</p>
                <p>All MIMO configs outperform SISO</p>
              </div>
              <div className="result-item">
                <h3>Spectral Efficiency</h3>
                <p>BPSK: 1 bit/s/Hz</p>
                <p>QPSK: 2 bits/s/Hz</p>
                <p>16-QAM: 4 bits/s/Hz</p>
                <p>64-QAM: 6 bits/s/Hz</p>
              </div>
              <div className="result-item">
                <h3>Practical Considerations</h3>
                <p>Channel estimation accuracy affects performance</p>
                <p>Hardware impairments limit high-order QAM</p>
                <p>Adaptive modulation optimizes throughput</p>
              </div>
            </div>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment9/modulation_schemes_analysis.m" className="file-card" download>
                <Code size={24} />
                <span>modulation_schemes_analysis.m</span>
                <small>MATLAB Modulation Analysis</small>
              </a>
              <a href="/assignments/assignment9/mimo_techniques_comparison.m" className="file-card" download>
                <Code size={24} />
                <span>mimo_techniques_comparison.m</span>
                <small>MATLAB MIMO Implementation</small>
              </a>
              <a href="/assignments/assignment9/README.md" className="file-card" download>
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