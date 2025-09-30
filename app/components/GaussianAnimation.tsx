'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

interface GaussianStats {
  n: number
  empMean: number
  empStd: number
  empVar: number
  meanError: number
  varError: number
  snrDb: number
  paprDb: number
}

export default function GaussianAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [samples, setSamples] = useState<number[]>([])
  const [stats, setStats] = useState<GaussianStats | null>(null)
  const [progress, setProgress] = useState(0)
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)
  const [maxSamples, setMaxSamples] = useState(2000)
  const [batchSize, setBatchSize] = useState(25)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeSeriesRef = useRef<HTMLCanvasElement>(null)

  // Generate Gaussian random numbers using Box-Muller transform
  const generateGaussianSample = (mu: number, sigma: number): number => {
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return z0 * sigma + mu
  }

  // Calculate statistics
  const calculateStats = (samples: number[]): GaussianStats => {
    const n = samples.length
    const empMean = samples.reduce((sum, x) => sum + x, 0) / n
    const empVar = samples.reduce((sum, x) => sum + Math.pow(x - empMean, 2), 0) / (n - 1)
    const empStd = Math.sqrt(empVar)
    const meanError = Math.abs(empMean - mu)
    const varError = Math.abs(empVar - sigma * sigma)
    
    // SNR calculation
    const snrDb = empStd > 0 ? 20 * Math.log10(Math.abs(empMean) / empStd) : Infinity
    
    // PAPR calculation
    const peakPower = Math.max(...samples.map(x => x * x))
    const avgPower = samples.reduce((sum, x) => sum + x * x, 0) / n
    const paprDb = avgPower > 0 ? 10 * Math.log10(peakPower / avgPower) : Infinity

    return { n, empMean, empStd, empVar, meanError, varError, snrDb, paprDb }
  }

  // Gaussian PDF
  const gaussianPdf = (x: number, mu: number, sigma: number): number => {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2))
  }

  // Draw histogram and PDF
  const drawHistogram = () => {
    const canvas = canvasRef.current
    if (!canvas || samples.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Calculate histogram
    const minVal = Math.min(...samples) - 0.5
    const maxVal = Math.max(...samples) + 0.5
    const numBins = Math.min(50, Math.max(10, Math.floor(samples.length / 20)))
    const binWidth = (maxVal - minVal) / numBins
    const bins = new Array(numBins).fill(0)

    samples.forEach(sample => {
      const binIndex = Math.floor((sample - minVal) / binWidth)
      if (binIndex >= 0 && binIndex < numBins) {
        bins[binIndex]++
      }
    })

    // Normalize bins to get density
    const totalArea = samples.length * binWidth
    const normalizedBins = bins.map(count => count / totalArea)

    // Draw histogram bars
    const maxDensity = Math.max(...normalizedBins, gaussianPdf(mu, mu, sigma))
    const barWidth = width / numBins
    
    ctx.fillStyle = 'rgba(135, 206, 235, 0.7)'
    ctx.strokeStyle = 'rgba(25, 25, 112, 0.8)'
    ctx.lineWidth = 1

    normalizedBins.forEach((density, i) => {
      const barHeight = (density / maxDensity) * height * 0.8
      const x = i * barWidth
      const y = height - barHeight - 20
      
      ctx.fillRect(x, y, barWidth - 1, barHeight)
      ctx.strokeRect(x, y, barWidth - 1, barHeight)
    })

    // Draw theoretical PDF
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    for (let i = 0; i <= width; i++) {
      const x = minVal + (i / width) * (maxVal - minVal)
      const y = gaussianPdf(x, mu, sigma)
      const canvasY = height - (y / maxDensity) * height * 0.8 - 20
      
      if (i === 0) {
        ctx.moveTo(i, canvasY)
      } else {
        ctx.lineTo(i, canvasY)
      }
    }
    ctx.stroke()

    // Add labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Histogram vs Theoretical PDF', 10, 20)
    ctx.fillStyle = 'rgba(135, 206, 235, 0.7)'
    ctx.fillRect(10, 30, 15, 10)
    ctx.fillStyle = 'white'
    ctx.fillText('Empirical', 30, 40)
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(10, 50)
    ctx.lineTo(25, 50)
    ctx.stroke()
    ctx.fillText('Theoretical', 30, 55)
  }

  // Draw time series
  const drawTimeSeries = () => {
    const canvas = timeSeriesRef.current
    if (!canvas || samples.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const minVal = Math.min(...samples, mu - 3 * sigma)
    const maxVal = Math.max(...samples, mu + 3 * sigma)
    const range = maxVal - minVal

    // Draw samples
    ctx.strokeStyle = 'rgba(0, 100, 255, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()

    samples.forEach((sample, i) => {
      const x = (i / (samples.length - 1)) * width
      const y = height - ((sample - minVal) / range) * height * 0.8 - 20
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw mean line
    const meanY = height - ((mu - minVal) / range) * height * 0.8 - 20
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, meanY)
    ctx.lineTo(width, meanY)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw ±σ bounds
    const upperY = height - ((mu + sigma - minVal) / range) * height * 0.8 - 20
    const lowerY = height - ((mu - sigma - minVal) / range) * height * 0.8 - 20
    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(0, upperY)
    ctx.lineTo(width, upperY)
    ctx.moveTo(0, lowerY)
    ctx.lineTo(width, lowerY)
    ctx.stroke()
    ctx.setLineDash([])

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Signal Samples Over Time', 10, 20)
  }

  // Animation step
  const animationStep = () => {
    setSamples(prevSamples => {
      if (prevSamples.length >= maxSamples) {
        setIsPlaying(false)
        return prevSamples
      }

      const newSamples = []
      const remainingSamples = maxSamples - prevSamples.length
      const samplesToAdd = Math.min(batchSize, remainingSamples)

      for (let i = 0; i < samplesToAdd; i++) {
        newSamples.push(generateGaussianSample(mu, sigma))
      }

      const updatedSamples = [...prevSamples, ...newSamples]
      setStats(calculateStats(updatedSamples))
      setProgress(updatedSamples.length / maxSamples)
      
      return updatedSamples
    })
  }

  // Control functions
  const startAnimation = () => {
    if (samples.length >= maxSamples) return
    setIsPlaying(true)
  }

  const pauseAnimation = () => {
    setIsPlaying(false)
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setSamples([])
    setStats(null)
    setProgress(0)
  }

  // Effects
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(animationStep, 300)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, samples.length, maxSamples, batchSize, mu, sigma])

  useEffect(() => {
    drawHistogram()
  }, [samples, mu, sigma])

  useEffect(() => {
    drawTimeSeries()
  }, [samples, mu, sigma])

  // Initialize with some samples
  useEffect(() => {
    const initialSamples = []
    for (let i = 0; i < 50; i++) {
      initialSamples.push(generateGaussianSample(mu, sigma))
    }
    setSamples(initialSamples)
    setStats(calculateStats(initialSamples))
    setProgress(50 / maxSamples)
  }, [])

  return (
    <div className="gaussian-animation">
      <div className="animation-header">
        <h3>Interactive Gaussian Distribution Animation</h3>
        <p>Watch how sample statistics converge to theoretical values as sample size increases</p>
      </div>

      <div className="animation-controls">
        <div className="control-buttons">
          <button 
            onClick={isPlaying ? pauseAnimation : startAnimation}
            className="control-btn primary"
            disabled={samples.length >= maxSamples}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={resetAnimation} className="control-btn secondary">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        <div className="parameters">
          <div className="param-group">
            <label>Mean (μ):</label>
            <input 
              type="number" 
              value={mu} 
              onChange={(e) => setMu(Number(e.target.value))}
              step="0.1"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Std Dev (σ):</label>
            <input 
              type="number" 
              value={sigma} 
              onChange={(e) => setSigma(Math.max(0.1, Number(e.target.value)))}
              step="0.1"
              min="0.1"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Max Samples:</label>
            <input 
              type="number" 
              value={maxSamples} 
              onChange={(e) => setMaxSamples(Math.max(100, Number(e.target.value)))}
              step="100"
              min="100"
              disabled={isPlaying}
            />
          </div>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {samples.length} / {maxSamples} samples ({(progress * 100).toFixed(1)}%)
        </span>
      </div>

      <div className="animation-content">
        <div className="charts-container">
          <div className="chart-item">
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <canvas 
              ref={timeSeriesRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
        </div>

        {stats && (
          <div className="statistics-panel">
            <h4>Sample Statistics (n = {stats.n})</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Empirical Mean:</span>
                <span className="stat-value">{stats.empMean.toFixed(4)}</span>
                <span className="stat-error">(Error: {stats.meanError.toFixed(4)})</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Theoretical Mean:</span>
                <span className="stat-value">{mu.toFixed(4)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Empirical Std:</span>
                <span className="stat-value">{stats.empStd.toFixed(4)}</span>
                <span className="stat-error">(Error: {Math.abs(stats.empStd - sigma).toFixed(4)})</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Theoretical Std:</span>
                <span className="stat-value">{sigma.toFixed(4)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">SNR (dB):</span>
                <span className="stat-value">{isFinite(stats.snrDb) ? stats.snrDb.toFixed(2) : '∞'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">PAPR (dB):</span>
                <span className="stat-value">{isFinite(stats.paprDb) ? stats.paprDb.toFixed(2) : '∞'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>Law of Large Numbers - sample statistics converge to population parameters</li>
          <li>Central Limit Theorem - sample distribution approaches normal</li>
          <li>Statistical validation through empirical vs theoretical comparison</li>
          <li>Wireless communication relevance - signal modeling and characterization</li>
        </ul>
      </div>
    </div>
  )
}