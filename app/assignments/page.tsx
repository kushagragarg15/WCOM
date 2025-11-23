import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AssignmentsPage() {
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
        <div className="assignments-header">
          <Link href="/" className="back-link">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="assignments-title">WCOM Lab Assignments</h1>
          <p className="assignments-subtitle">
            Comprehensive wireless communication laboratory exercises with interactive simulations
          </p>
        </div>

        <div className="assignments-content">
          <div className="assignments-overview">
            <h2>Course Overview</h2>
            <p>
              The WCOM Lab assignments are designed to provide hands-on experience with wireless 
              communication concepts through MATLAB simulations and interactive web-based animations. 
              Each assignment builds upon previous knowledge to create a comprehensive understanding 
              of wireless systems.
            </p>
          </div>

          <div className="assignments-grid-page">
            <Link href="/assignment-1" className="assignment-card">
              <div className="assignment-number">01</div>
              <div className="assignment-info">
                <h3>Gaussian Random Variable Distribution</h3>
                <p>
                  Learn probability distributions and statistical analysis through interactive 
                  Gaussian distribution simulation with real-time parameter adjustment.
                </p>
                <div className="assignment-topics">
                  <span className="topic">Statistical Analysis</span>
                  <span className="topic">MATLAB Programming</span>
                  <span className="topic">Signal Modeling</span>
                </div>
              </div>
            </Link>

            <Link href="/assignment-2" className="assignment-card">
              <div className="assignment-number">02</div>
              <div className="assignment-info">
                <h3>Path Loss and Shadowing Analysis</h3>
                <p>
                  Explore wireless propagation models including free space path loss, 
                  log-distance models, and shadowing effects in various environments.
                </p>
                <div className="assignment-topics">
                  <span className="topic">Propagation Models</span>
                  <span className="topic">Link Budget</span>
                  <span className="topic">Coverage Planning</span>
                </div>
              </div>
            </Link>

            <Link href="/assignment-3" className="assignment-card">
              <div className="assignment-number">03</div>
              <div className="assignment-info">
                <h3>Hata-Okumura and Two-Ray Models</h3>
                <p>
                  Compare empirical and theoretical propagation models for different 
                  environments and understand their applications in cellular networks.
                </p>
                <div className="assignment-topics">
                  <span className="topic">Empirical Models</span>
                  <span className="topic">Theoretical Analysis</span>
                  <span className="topic">Urban Propagation</span>
                </div>
              </div>
            </Link>

            <Link href="/assignment-4" className="assignment-card">
              <div className="assignment-number">04</div>
              <div className="assignment-info">
                <h3>Rician Fading and Jakes Doppler Spectrum</h3>
                <p>
                  Understand time-varying fading channels, LOS components, and Doppler 
                  effects in mobile communication systems.
                </p>
                <div className="assignment-topics">
                  <span className="topic">Fading Channels</span>
                  <span className="topic">Doppler Effects</span>
                  <span className="topic">Mobile Communications</span>
                </div>
              </div>
            </Link>

            <Link href="/assignment-5" className="assignment-card">
              <div className="assignment-number">05</div>
              <div className="assignment-info">
                <h3>Cellular Network Analysis with H4 Fading</h3>
                <p>
                  Simulate cellular networks with multiple users, H4 cascaded fading, 
                  and analyze the impact on data rates and system performance.
                </p>
                <div className="assignment-topics">
                  <span className="topic">Cellular Networks</span>
                  <span className="topic">H4 Fading</span>
                  <span className="topic">System Analysis</span>
                </div>
              </div>
            </Link>

            <Link href="/assignment-6" className="assignment-card">
              <div className="assignment-number">06</div>
              <div className="assignment-info">
                <h3>Water-filling Power Allocation Algorithm</h3>
                <p>
                  Implement optimal power allocation across multiple channels using 
                  the water-filling algorithm to maximize system capacity.
                </p>
                <div className="assignment-topics">
                  <span className="topic">Power Allocation</span>
                  <span className="topic">Optimization</span>
                  <span className="topic">Capacity Maximization</span>
                </div>
              </div>
            </Link>

            <Link href="/assignment-7" className="assignment-card">
              <div className="assignment-number">07</div>
              <div className="assignment-info">
                <h3>MIMO Systems and Channel Capacity Analysis</h3>
                <p>
                  Explore Multiple Input Multiple Output systems, analyze channel capacity 
                  for different antenna configurations, and study BER performance in fading channels.
                </p>
                <div className="assignment-topics">
                  <span className="topic">MIMO Systems</span>
                  <span className="topic">Channel Capacity</span>
                  <span className="topic">Spatial Diversity</span>
                </div>
              </div>
            </Link>

            <Link href="/assignment-8" className="assignment-card">
              <div className="assignment-number">08</div>
              <div className="assignment-info">
                <h3>Diversity Combining Techniques</h3>
                <p>
                  Compare Selection Combining, Equal Gain Combining, and Maximum Ratio Combining 
                  techniques. Analyze BER performance and diversity gains in Rayleigh fading channels.
                </p>
                <div className="assignment-topics">
                  <span className="topic">Diversity Combining</span>
                  <span className="topic">BER Analysis</span>
                  <span className="topic">Fading Mitigation</span>
                </div>
              </div>
            </Link>

            <Link href="/assignment-9" className="assignment-card">
              <div className="assignment-number">09</div>
              <div className="assignment-info">
                <h3>Modulation Schemes and MIMO Techniques</h3>
                <p>
                  Implement BPSK, QPSK, and QAM modulation schemes under SISO, SIMO, MISO, and MIMO 
                  configurations. Compare spectral efficiency and error performance trade-offs.
                </p>
                <div className="assignment-topics">
                  <span className="topic">Digital Modulation</span>
                  <span className="topic">MIMO Systems</span>
                  <span className="topic">Alamouti STBC</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="course-info">
            <h2>Learning Objectives</h2>
            <div className="objectives-grid">
              <div className="objective-item">
                <h3>Theoretical Understanding</h3>
                <p>Develop deep understanding of wireless communication principles and mathematical foundations.</p>
              </div>
              <div className="objective-item">
                <h3>Practical Implementation</h3>
                <p>Gain hands-on experience with MATLAB programming and simulation techniques.</p>
              </div>
              <div className="objective-item">
                <h3>Interactive Learning</h3>
                <p>Use web-based animations to visualize complex concepts and experiment with parameters.</p>
              </div>
              <div className="objective-item">
                <h3>Real-world Applications</h3>
                <p>Connect theoretical knowledge to practical wireless system design and optimization.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
