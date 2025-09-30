'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

interface RicianParams {
  kFactor: number // K-factor in linear scale
  omega: number // Average power
  maxDoppler: number // Maximum Doppler frequency (Hz)
  sampleRate: number // Sampling rate (Hz)
}

export default function RicianJakesAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSample, setCurrentSample] = useState(0)
  const [maxSamples, setMaxSamples] = useState(1000)
  const [params, setParams] = useState<RicianParams>({
    kFactor: 1,
    omega: 1,
    maxDoppler: 100,
    sampleRate: 1000
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const ricianRef = useRef<HTMLCanvasElement>(null)
  const dopplerRef = useRef<HTMLCanvasElement>(null)
  const timeSeriesRef = useRef<HTMLCanvasElement>(null)
  const [ricianSamples, setRicianSamples] = useState<number[]>([])
  const [channelSamples, setChannelSamples] = useState<{real: number, imag: number, magnitude: number}[]>([])

  // Generate Rician fading sample
  const generateRicianSample = (kFactor: number, omega: number): number => {
    // Calculate sigma and specular amplitude
    const sigma = Math.sqrt(omega / (2 * (kFactor + 1)))
    const A = Math.sqrt(kFactor * omega / (kFactor + 1))
    
    // Generate two independent Gaussian random variables
    const u1 = Math.random()
    const u2 = Math.random()
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
    
    // Generate Rician sample
    const x = A + sigma * z1
    const y = sigma * z2
    
    return Math.sqrt(x * x + y * y)
  }

  // Generate complex channel sample with Doppler
  const generateChannelSample = (t: number, maxDoppler: number, kFactor: number, omega: number): {real: number, imag: number, magnitude: number} => {
    // LOS component
    const A = Math.sqrt(kFactor * omega / (kFactor + 1))
    const losReal = A
    const losImag = 0
    
    // Scattered component with Doppler
    const sigma = Math.sqrt(omega / (2 * (kFactor + 1)))
    
    // Simple Doppler simulation (should be more complex in practice)
    const dopplerPhase = 2 * Math.PI * maxDoppler * Math.cos(2 * Math.PI * t / 100) * t / params.sampleRate
    
    const u1 = Math.random()
    const u2 = Math.random()
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)
    
    const scatteredReal = sigma * z1 * Math.cos(dopplerPhase) - sigma * z2 * Math.sin(dopplerPhase)
    const scatteredImag = sigma * z1 * Math.sin(dopplerPhase) + sigma * z2 * Math.cos(dopplerPhase)
    
    const real = losReal + scatteredReal
    const imag = losImag + scatteredImag
    const magnitude = Math.sqrt(real * real + imag * imag)
    
    return { real, imag, magnitude }
  }

  // Rician PDF
  const ricianPdf = (r: number, kFactor: number, omega: number): number => {
    const sigma = Math.sqrt(omega / (2 * (kFactor + 1)))
    const A = Math.sqrt(kFactor * omega / (kFactor + 1))
    
    if (r < 0) return 0
    
    // Modified Bessel function I0 approximation
    const besselI0 = (x: number): number => {
      let sum = 1
      let term = 1
      for (let n = 1; n <= 20; n++) {
        term *= (x / (2 * n)) * (x / (2 * n))
        sum += term
      }
      return sum
    }
    
    const arg = r * A / (sigma * sigma)
    return (r / (sigma * sigma)) * Math.exp(-(r * r + A * A) / (2 * sigma * sigma)) * besselI0(arg)
  }

  // Jakes Doppler Spectrum
  const jakesDopplerSpectrum = (f: number, maxDoppler: number, sigma2: number): number => {
    if (Math.abs(f) >= maxDoppler) return 0
    return sigma2 / (Math.PI * maxDoppler * Math.sqrt(1 - Math.pow(f / maxDoppler, 2)))
  }

  // Draw Rician distribution
  const drawRicianDistribution = () => {
    const canvas = ricianRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    if (ricianSamples.length === 0) return

    // Create histogram
    const numBins = 30
    const minVal = 0
    const maxVal = Math.max(...ricianSamples) * 1.2
    const binWidth = (maxVal - minVal) / numBins
    const bins = new Array(numBins).fill(0)

    ricianSamples.forEach(sample => {
      const binIndex = Math.floor((sample - minVal) / binWidth)
      if (binIndex >= 0 && binIndex < numBins) {
        bins[binIndex]++
      }
    })

    // Normalize bins to get density
    const totalArea = ricianSamples.length * binWidth
    const normalizedBins = bins.map(count => count / totalArea)

    // Draw histogram bars
    const maxDensity = Math.max(...normalizedBins, ricianPdf(Math.sqrt(params.omega), params.kFactor, params.omega))
    const barWidth = (width - 80) / numBins
    
    ctx.fillStyle = 'rgba(135, 206, 235, 0.7)'
    ctx.strokeStyle = 'rgba(25, 25, 112, 0.8)'
    ctx.lineWidth = 1

    normalizedBins.forEach((density, i) => {
      const barHeight = (density / maxDensity) * (height - 80)
      const x = 40 + i * barWidth
      const y = height - 40 - barHeight
      
      ctx.fillRect(x, y, barWidth - 1, barHeight)
      ctx.strokeRect(x, y, barWidth - 1, barHeight)
    })

    // Draw theoretical Rician PDF
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    for (let i = 0; i <= width - 80; i++) {
      const r = minVal + (i / (width - 80)) * (maxVal - minVal)
      const pdf = ricianPdf(r, params.kFactor, params.omega)
      const canvasY = height - 40 - (pdf / maxDensity) * (height - 80)
      
      if (i === 0) {
        ctx.moveTo(40 + i, canvasY)
      } else {
        ctx.lineTo(40 + i, canvasY)
      }
    }
    ctx.stroke()

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText(`Rician Distribution (K=${params.kFactor})`, 10, 20)
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

  // Draw Jakes Doppler Spectrum
  const drawJakesDopplerSpectrum = () => {
    const canvas = dopplerRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Draw theoretical Jakes spectrum
    const maxFreq = params.maxDoppler * 1.2
    const freqStep = (2 * maxFreq) / (width - 80)
    
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    let maxSpectrum = 0
    const spectrumPoints = []
    
    for (let i = 0; i <= width - 80; i++) {
      const f = -maxFreq + i * freqStep
      const spectrum = jakesDopplerSpectrum(f, params.maxDoppler, params.omega)
      spectrumPoints.push(spectrum)
      if (isFinite(spectrum)) {
        maxSpectrum = Math.max(maxSpectrum, spectrum)
      }
    }
    
    spectrumPoints.forEach((spectrum, i) => {
      const x = 40 + i
      let y = height - 40
      if (isFinite(spectrum) && maxSpectrum > 0) {
        y = height - 40 - (spectrum / maxSpectrum) * (height - 80)
      }
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = 40 + (i / 10) * (width - 80)
      const y = 40 + (i / 10) * (height - 80)
      ctx.beginPath()
      ctx.moveTo(x, 40)
      ctx.lineTo(x, height - 40)
      ctx.moveTo(40, y)
      ctx.lineTo(width - 40, y)
      ctx.stroke()
    }

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText(`Jakes Doppler Spectrum (fmax=${params.maxDoppler}Hz)`, 10, 20)
    ctx.fillText('Frequency (Hz)', width / 2 - 30, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Power Spectral Density', -50, 0)
    ctx.restore()

    // Mark ±fmax
    const fmaxX = 40 + ((params.maxDoppler + maxFreq) / (2 * maxFreq)) * (width - 80)
    const fmaxXNeg = 40 + ((-params.maxDoppler + maxFreq) / (2 * maxFreq)) * (width - 80)
    
    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(fmaxX, 40)
    ctx.lineTo(fmaxX, height - 40)
    ctx.moveTo(fmaxXNeg, 40)
    ctx.lineTo(fmaxXNeg, height - 40)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Draw time series of channel
  const drawChannelTimeSeries = () => {
    const canvas = timeSeriesRef.current
    if (!canvas || channelSamples.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const magnitudes = channelSamples.map(s => s.magnitude)
    const minMag = Math.min(...magnitudes)
    const maxMag = Math.max(...magnitudes)
    const range = maxMag - minMag

    // Draw magnitude
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 2
    ctx.beginPath()

    channelSamples.forEach((sample, i) => {
      const x = (i / (channelSamples.length - 1)) * (width - 80) + 40
      const y = height - 40 - ((sample.magnitude - minMag) / range) * (height - 80)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = 40 + (i / 10) * (width - 80)
      const y = 40 + (i / 10) * (height - 80)
      ctx.beginPath()
      ctx.moveTo(x, 40)
      ctx.lineTo(x, height - 40)
      ctx.moveTo(40, y)
      ctx.lineTo(width - 40, y)
      ctx.stroke()
    }

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Channel Magnitude Over Time', 10, 20)
    ctx.fillText('Time (samples)', width / 2 - 30, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Magnitude', -30, 0)
    ctx.restore()
  }

  // Animation step
  const animationStep = () => {
    setCurrentSample(prevSample => {
      if (prevSample >= maxSamples) {
        setIsPlaying(false)
        return prevSample
      }

      const newSample = prevSample + 1
      
      // Generate new Rician sample
      const ricianSample = generateRicianSample(params.kFactor, params.omega)
      setRicianSamples(prev => [...prev, ricianSample])
      
      // Generate new channel sample
      const channelSample = generateChannelSample(newSample, params.maxDoppler, params.kFactor, params.omega)
      setChannelSamples(prev => [...prev, channelSample])

      return newSample
    })
  }

  // Control functions
  const startAnimation = () => {
    if (currentSample >= maxSamples) return
    setIsPlaying(true)
  }

  const pauseAnimation = () => {
    setIsPlaying(false)
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentSample(0)
    setRicianSamples([])
    setChannelSamples([])
  }

  // Effects
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(animationStep, 50)
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
  }, [isPlaying, currentSample, maxSamples, params])

  useEffect(() => {
    drawRicianDistribution()
  }, [ricianSamples, params])

  useEffect(() => {
    drawJakesDopplerSpectrum()
  }, [params])

  useEffect(() => {
    drawChannelTimeSeries()
  }, [channelSamples])

  // Initialize with some samples
  useEffect(() => {
    const initialRician = []
    const initialChannel = []
    for (let i = 0; i < 100; i++) {
      initialRician.push(generateRicianSample(params.kFactor, params.omega))
      initialChannel.push(generateChannelSample(i, params.maxDoppler, params.kFactor, params.omega))
    }
    setRicianSamples(initialRician)
    setChannelSamples(initialChannel)
    setCurrentSample(100)
  }, [])

  const progress = currentSample / maxSamples

  return (
    <div className="rician-jakes-animation">
      <div className="animation-header">
        <h3>Interactive Rician Fading and Jakes Doppler Animation</h3>
        <p>Explore time-varying fading channels with LOS components and Doppler effects</p>
      </div>

      <div className="animation-controls">
        <div className="control-buttons">
          <button 
            onClick={isPlaying ? pauseAnimation : startAnimation}
            className="control-btn primary"
            disabled={currentSample >= maxSamples}
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
            <label>K-factor:</label>
            <input 
              type="number" 
              value={params.kFactor} 
              onChange={(e) => setParams(prev => ({...prev, kFactor: Math.max(0, Number(e.target.value))}))}
              step="0.5"
              min="0"
              max="20"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Max Doppler (Hz):</label>
            <input 
              type="number" 
              value={params.maxDoppler} 
              onChange={(e) => setParams(prev => ({...prev, maxDoppler: Number(e.target.value)}))}
              step="10"
              min="10"
              max="500"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Average Power (Ω):</label>
            <input 
              type="number" 
              value={params.omega} 
              onChange={(e) => setParams(prev => ({...prev, omega: Math.max(0.1, Number(e.target.value))}))}
              step="0.1"
              min="0.1"
              max="5"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Max Samples:</label>
            <input 
              type="number" 
              value={maxSamples} 
              onChange={(e) => setMaxSamples(Number(e.target.value))}
              step="100"
              min="500"
              max="5000"
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
          Samples: {currentSample} / {maxSamples} ({(progress * 100).toFixed(1)}%)
        </span>
      </div>

      <div className="animation-content">
        <div className="charts-container">
          <div className="chart-item">
            <canvas 
              ref={ricianRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <canvas 
              ref={dopplerRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item full-width">
            <canvas 
              ref={timeSeriesRef} 
              width={800} 
              height={250}
              className="chart-canvas"
            />
          </div>
        </div>

        {ricianSamples.length > 0 && (
          <div className="statistics-panel">
            <h4>Current Statistics (n = {ricianSamples.length})</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">K-factor:</span>
                <span className="stat-value">{params.kFactor}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Empirical Mean:</span>
                <span className="stat-value">
                  {(ricianSamples.reduce((sum, x) => sum + x, 0) / ricianSamples.length).toFixed(4)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Empirical Variance:</span>
                <span className="stat-value">
                  {(() => {
                    const mean = ricianSamples.reduce((sum, x) => sum + x, 0) / ricianSamples.length
                    const variance = ricianSamples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (ricianSamples.length - 1)
                    return variance.toFixed(4)
                  })()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max Doppler:</span>
                <span className="stat-value">{params.maxDoppler} Hz</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Coherence Time:</span>
                <span className="stat-value">{(1 / (Math.PI * params.maxDoppler) * 1000).toFixed(2)} ms</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Power:</span>
                <span className="stat-value">{params.omega}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>K-factor determines the ratio of LOS to scattered power</li>
          <li>K=0 reduces to Rayleigh fading (no LOS component)</li>
          <li>Jakes spectrum has characteristic U-shape due to uniform scattering</li>
          <li>Maximum Doppler frequency depends on mobile speed and carrier frequency</li>
          <li>Coherence time inversely related to Doppler spread</li>
          <li>Critical for mobile communication system design and channel estimation</li>
        </ul>
      </div>
    </div>
  )
}