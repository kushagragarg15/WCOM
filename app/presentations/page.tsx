'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Presentation } from 'lucide-react'

export default function PresentationsPage() {
  const presentations = [
    {
      id: 2,
      title: "Path Loss and Shadowing Analysis",
      description: "Comprehensive presentation covering free space path loss, shadowing effects, and propagation modeling in wireless communication systems.",
      topics: ["Free Space Path Loss", "Log-normal Shadowing", "Propagation Models", "Signal Attenuation"],
      filename: "Assignment 2 Path Loss and Shadowing .pptx"
    },
    {
      id: 3,
      title: "Wireless Propagation Models",
      description: "Detailed analysis of various wireless propagation models including empirical and theoretical approaches for different environments.",
      topics: ["Okumura Model", "Hata Model", "COST-231", "Indoor Propagation"],
      filename: "Assignment 3 - Wireless Propagation Models.pptx"
    },
    {
      id: 4,
      title: "Rician Fading & Jakes Spectrum",
      description: "In-depth study of Rician fading channels and Jakes Doppler spectrum analysis for mobile communication systems.",
      topics: ["Rician Distribution", "K-factor Analysis", "Jakes Model", "Doppler Spectrum"],
      filename: "Assignment 4 - Rician Fading & Jakes Spectrum.pptx"
    },
    {
      id: 5,
      title: "Wireless System Capacity Simulation",
      description: "Comprehensive analysis of wireless system capacity including Shannon capacity and practical implementation considerations.",
      topics: ["Shannon Capacity", "AWGN Channels", "Capacity Limits", "System Performance"],
      filename: "Assignment 5 Wireless System Capacity Simulation.pptx"
    },
    {
      id: 6,
      title: "Water-filling Algorithm",
      description: "Advanced presentation on water-filling algorithm for optimal power allocation in multi-channel communication systems.",
      topics: ["Power Allocation", "Water-filling Theory", "MIMO Systems", "Optimization"],
      filename: "Assignment 6 - Water-filling Algorithm.pptx"
    },
    {
      id: 7,
      title: "MIMO Capacity & BER Analysis",
      description: "Detailed study of Multiple-Input Multiple-Output systems focusing on capacity analysis and bit error rate performance.",
      topics: ["MIMO Capacity", "Spatial Multiplexing", "BER Analysis", "Channel Matrix"],
      filename: "Assignment 7 - MIMO Capacity & BER.pptx"
    },
    {
      id: 8,
      title: "Diversity Techniques",
      description: "Comprehensive overview of diversity techniques in wireless communications including spatial, temporal, and frequency diversity.",
      topics: ["Spatial Diversity", "Temporal Diversity", "Frequency Diversity", "Combining Techniques"],
      filename: "Assignment 8 - Diversity Techniques.pptx"
    },
    {
      id: 9,
      title: "Multi-Antenna Modulation Analysis",
      description: "Advanced analysis of modulation techniques in multi-antenna systems with focus on performance optimization.",
      topics: ["Multi-Antenna Systems", "Modulation Schemes", "Performance Analysis", "Signal Processing"],
      filename: "Assignment 9 - Multi-Antenna Modulation Analysis.pptx"
    },
    {
      id: 10,
      title: "Alamouti Space-Time Block Coding",
      description: "Detailed presentation on Alamouti STBC scheme covering theory, implementation, and performance analysis for transmit diversity.",
      topics: ["Space-Time Coding", "Alamouti Scheme", "Transmit Diversity", "Orthogonal Design"],
      filename: "Assignment 10 - Alamouti STBC.pptx"
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="site-header" role="banner">
        <div className="container nav">
          <Link className="brand" href="/" aria-label="WCOM Lab Home">
            WCOM Lab Portal
          </Link>
          <nav className="nav-links" role="navigation">
            <Link href="/">Home</Link>
            <Link href="/assignments">Assignments</Link>
            <Link href="/presentations" className="active">Presentations</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        <div className="page-header">
          <Link href="/assignments" className="back-link">
            <ArrowLeft size={20} />
            Back to Assignments
          </Link>
          <h1>
            <Presentation className="page-icon" />
            Presentation Slides
          </h1>
          <p>Comprehensive presentation slides covering all wireless communication topics with detailed analysis and visual explanations.</p>
        </div>

        <div className="presentations-grid">
          {presentations.map((presentation) => (
            <div key={presentation.id} className="presentation-card">
              <div className="presentation-header">
                <FileText className="presentation-icon" size={24} />
                <div className="presentation-number">#{presentation.id}</div>
              </div>
              
              <div className="presentation-content">
                <h3>{presentation.title}</h3>
                <p>{presentation.description}</p>
                
                <div className="presentation-topics">
                  {presentation.topics.map((topic, index) => (
                    <span key={index} className="topic">{topic}</span>
                  ))}
                </div>
                
                <div className="presentation-actions">
                  <a 
                    href={`/presentations/${presentation.filename}`}
                    download
                    className="btn btn-primary"
                  >
                    <Download size={16} />
                    Download PowerPoint
                  </a>
                  <Link 
                    href={`/assignment-${presentation.id}`}
                    className="btn btn-ghost"
                  >
                    <FileText size={16} />
                    View Assignment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <h3>📊 Data Flow Diagrams</h3>
            <p>Each presentation includes detailed data flow diagrams showing the step-by-step process of algorithms and simulations.</p>
          </div>
          <div className="feature-item">
            <h3>📈 Performance Analysis</h3>
            <p>Comprehensive performance metrics and analysis with graphical representations of results and comparisons.</p>
          </div>
          <div className="feature-item">
            <h3>🔬 Theoretical Background</h3>
            <p>Solid theoretical foundation with mathematical derivations and explanations of underlying principles.</p>
          </div>
          <div className="feature-item">
            <h3>💻 Implementation Details</h3>
            <p>Practical implementation guidance with pseudocode and MATLAB code explanations for hands-on learning.</p>
          </div>
        </div>

        <div className="credits-section">
          <h2>Presentation Credits</h2>
          <p>
            These comprehensive presentation slides were created by <strong>Leher Joshi (23UCC566)</strong> and <strong>Harshita Devnani (23UCC546)</strong> 
            as part of the WCOM Lab project. The presentations include detailed data flow diagrams, pseudocode implementations, 
            theoretical analysis, and performance evaluations for each wireless communication topic covered in the course.
          </p>
        </div>
      </main>
    </div>
  )
}