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