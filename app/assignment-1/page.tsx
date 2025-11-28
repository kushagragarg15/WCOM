'use client'

import Link from 'next/link'
import { ArrowLeft, Download, FileText, Code } from 'lucide-react'
import GaussianAnimation from '../components/GaussianAnimation'

export default function Assignment1Page() {
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
          <h1 className="assignment-title">Assignment 1: Gaussian Random Variable Distribution</h1>
        </div>

        <div className="assignment-content">
          <section className="assignment-section">
            <h2>Objective</h2>
            <p>
              Create MATLAB code to generate and plot a Gaussian random variable distribution,
              demonstrating understanding of probability distributions and MATLAB programming.
            </p>
          </section>

          <section className="assignment-section">
            <h2>Theory</h2>
            <p>A Gaussian (Normal) distribution is a continuous probability distribution characterized by:</p>
            <ul>
              <li><strong>Mean (μ):</strong> The center of the distribution</li>
              <li><strong>Standard deviation (σ):</strong> The spread of the distribution</li>
              <li><strong>Probability Density Function:</strong> f(x) = (1/(σ√(2π))) * e^(-(x-μ)²/(2σ²))</li>
            </ul>
          </section>

          <section className="assignment-section">
            <h2>Implementation</h2>
            <p>The MATLAB code performs the following operations:</p>
            <ol>
              <li>Generate random samples from a Gaussian distribution</li>
              <li>Create multiple visualizations to analyze the distribution</li>
              <li>Compare empirical results with theoretical values</li>
              <li>Display statistical measures</li>
            </ol>
          </section>

          <section className="assignment-section">
            <h2>Expected Results</h2>
            <div className="results-grid">
              <div className="result-item">
                <h3>Statistical Output</h3>
                <p>Theoretical vs Sample statistics comparison including mean, standard deviation, variance, skewness, and kurtosis.</p>
              </div>
              <div className="result-item">
                <h3>Visualizations</h3>
                <p>Four comprehensive plots: Histogram vs PDF, Q-Q plot, Time series, and CDF comparison.</p>
              </div>
            </div>
          </section>

          <section className="assignment-section">
            <h2>Interactive Animation</h2>
            <p>
              Experience the Gaussian distribution learning process in real-time. Watch how sample
              statistics converge to theoretical values as the sample size increases, demonstrating
              the Law of Large Numbers and Central Limit Theorem.
            </p>
            <GaussianAnimation />
          </section>

          <section className="assignment-section">
            <h2>Learning Outcomes</h2>
            <ul>
              <li>Understanding Gaussian distribution properties</li>
              <li>MATLAB programming for statistical analysis</li>
              <li>Data visualization techniques</li>
              <li>Comparison of empirical vs theoretical results</li>
              <li>Statistical validation methods</li>
            </ul>
          </section>

          <section className="assignment-section youtube-cta">
            <div className="youtube-assignment-banner">
              <div className="youtube-assignment-content">
                <div className="youtube-assignment-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="youtube-assignment-text">
                  <h3>📺 Watch the Video Tutorial</h3>
                  <p>Get a detailed walkthrough of this Gaussian Distribution assignment on our YouTube channel! See step-by-step MATLAB implementation and concept explanations.</p>
                </div>
              </div>
              <a 
                href="https://www.youtube.com/@wireless_visionaries" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-youtube-small"
              >
                Watch Tutorial
              </a>
            </div>
          </section>

          <div className="assignment-files">
            <h2>Assignment Files</h2>
            <div className="file-grid">
              <a href="/assignments/assignment1/gaussian_distribution.m" className="file-card" download>
                <Code size={24} />
                <span>gaussian_distribution.m</span>
                <small>MATLAB Implementation</small>
              </a>
              <a href="/assignments/assignment1/Assignment1_GaussianDistribution.md" className="file-card" download>
                <FileText size={24} />
                <span>Assignment Documentation</span>
                <small>Complete Guide</small>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}