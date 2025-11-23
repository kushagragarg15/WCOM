'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface DiversityParams {
  Mt: number // Number of transmit antennas
  Mr: number // Number of receive antennas
  maxSNR: number
  numBits: number
  showTechnique: string
}

interface BERData {
  snr: number
  ber_sc: number
  ber_egc: number
  ber_mrc: number
}

export default function DiversityCombiningAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSNR, setCurrentSNR] = useState(0)
  const [params, setParams] = useState<DiversityParams>({
    Mt: 1,
    Mr: 2,
    maxSNR: 35,
    numBits: 10000,
    showTechnique: 'all'
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const berRef = useRef<HTMLCanvasElement>(null)
  const diversityRef = useRef<HTMLCanvasElement>(null)
  const diagramRef = useRef<HTMLCanvasElement>(null)
  
  const [berData, setBERData] = useState<BERData[]>([])

  // Generate complex Gaussian random variables
  const complexGaussian = (size: number): number[] => {
    return Array(size).fill(0).map(() => {
      const real = (Math.random() - 0.5) * 2
      const imag = (Math.random() - 0.5) * 2
      return Math.sqrt(real * real + imag * imag) / Math.sqrt(2)
    })
  }

  // Generate Rayleigh fading channel
  const generateChannel = (Mr: number, numBits: number): number[][] => {
    return Array(Mr).fill(0).map(() => complexGaussian(numBits))
  }

  // Selection Combining
  const selectionCombining = (h: number[][], y: number[][], numBits: number): number[] => {
    const decisions = []
    
    for (let i = 0; i < numBits; i++) {
      // Find branch with maximum channel gain
      let maxGain = 0
      let bestBranch = 0
      
      for (let j = 0; j < h.length; j++) {
        const gain = h[j][i] * h[j][i]
        if (gain > maxGain) {
          maxGain = gain
          bestBranch = j
        }
      }
      
      // Use the best branch for decision
      const equalized = y[bestBranch][i] / h[bestBranch][i]
      decisions.push(equalized > 0 ? 1 : 0)
    }
    
    return decisions
  }

  // Equal Gain Combining
  const equalGainCombining = (h: number[][], y: number[][], numBits: number): number[] => {
    const decisions = []
    
    for (let i = 0; i < numBits; i++) {
      let combined = 0
      
      // Combine all branches with equal weights (phase correction only)
      for (let j = 0; j < h.length; j++) {
        const phase_correction = h[j][i] / Math.abs(h[j][i])
        combined += y[j][i] * phase_correction
      }
      
      decisions.push(combined > 0 ? 1 : 0)
    }
    
    return decisions
  }

  // Maximum Ratio Combining
  const maximumRatioCombining = (h: number[][], y: number[][], numBits: number): number[] => {
    const decisions = []
    
    for (let i = 0; i < numBits; i++) {
      let numerator = 0
      let denominator = 0
      
      // Combine with optimal weights
      for (let j = 0; j < h.length; j++) {
        numerator += h[j][i] * y[j][i]
        denominator += h[j][i] * h[j][i]
      }
      
      const combined = numerator / denominator
      decisions.push(combined > 0 ? 1 : 0)
    }
    
    return decisions
  }

  // Calculate BER for all techniques
  const calculateBER = (snrLinear: number): BERData => {
    const numBits = params.numBits
    
    // Generate random bits and BPSK symbols
    const bits = Array(numBits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
    const symbols = bits.map(bit => bit === 1 ? 1 : -1)
    
    // Generate channel and noise
    const h = generateChannel(params.Mr, numBits)
    const noise = Array(params.Mr).fill(0).map(() => 
      complexGaussian(numBits).map(n => n * Math.sqrt(1 / (2 * snrLinear)))
    )
    
    // Generate received signals
    const y = h.map((channel, j) => 
      channel.map((h_val, i) => h_val * symbols[i] + noise[j][i])
    )
    
    // Apply combining techniques
    const decisions_sc = selectionCombining(h, y, numBits)
    const decisions_egc = equalGainCombining(h, y, numBits)
    const decisions_mrc = maximumRatioCombining(h, y, numBits)
    
    // Calculate BER for each technique
    const ber_sc = decisions_sc.reduce((errors, decision, i) => 
      errors + (decision !== bits[i] ? 1 : 0), 0) / numBits
    const ber_egc = decisions_egc.reduce((errors, decision, i) => 
      errors + (decision !== bits[i] ? 1 : 0), 0) / numBits
    const ber_mrc = decisions_mrc.reduce((errors, decision, i) => 
      errors + (decision !== bits[i] ? 1 : 0), 0) / numBits
    
    return {
      snr: currentSNR,
      ber_sc: Math.max(ber_sc, 1e-6), // Avoid log(0)
      ber_egc: Math.max(ber_egc, 1e-6),
      ber_mrc: Math.max(ber_mrc, 1e-6)
    }
  }

  // Animation step
  const animationStep = () => {
    setCurrentSNR(prevSNR => {
      if (prevSNR >= params.maxSNR) {
        setIsPlaying(false)
        return prevSNR
      }

      const newSNR = prevSNR + 2
      const snrLinear = Math.pow(10, newSNR / 10)
      
      const berResult = calculateBER(snrLinear)
      setBERData(prevData => [...prevData, berResult])

      return newSNR
    })
  }

  // Draw BER comparison chart
  const drawBERChart = () => {
    const canvas = berRef.current
    if (!canvas || berData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Find min/max for scaling
    const snrValues = berData.map(d => d.snr)
    const allBER = berData.flatMap(d => [d.ber_sc, d.ber_egc, d.ber_mrc])
    const minSNR = Math.min(...snrValues)
    const maxSNR = Math.max(...snrValues)
    const minBER = Math.min(...allBER)
    const maxBER = Math.max(...allBER)

    // Helper functions (log scale for BER)
    const toCanvasX = (snr: number) => ((snr - minSNR) / (maxSNR - minSNR)) * (width - 80) + 40
    const toCanvasY = (ber: number) => {
      const logBER = Math.log10(Math.max(ber, 1e-6))
      const logMinBER = Math.log10(Math.max(minBER, 1e-6))
      const logMaxBER = Math.log10(maxBER)
      return height - 40 - ((logBER - logMinBER) / (logMaxBER - logMinBER)) * (height - 80)
    }

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

    // Draw BER curves
    const techniques = [
      { data: 'ber_sc', color: 'red', label: 'Selection Combining (SC)', show: params.showTechnique === 'all' || params.showTechnique === 'sc' },
      { data: 'ber_egc', color: 'blue', label: 'Equal Gain Combining (EGC)', show: params.showTechnique === 'all' || params.showTechnique === 'egc' },
      { data: 'ber_mrc', color: 'cyan', label: 'Maximum Ratio Combining (MRC)', show: params.showTechnique === 'all' || params.showTechnique === 'mrc' }
    ]

    techniques.forEach(technique => {
      if (technique.show) {
        ctx.strokeStyle = technique.color
        ctx.lineWidth = 2
        ctx.beginPath()
        
        berData.forEach((point, i) => {
          const x = toCanvasX(point.snr)
          const y = toCanvasY(point[technique.data as keyof BERData] as number)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // Draw points
        ctx.fillStyle = technique.color
        berData.forEach(point => {
          const x = toCanvasX(point.snr)
          const y = toCanvasY(point[technique.data as keyof BERData] as number)
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, 2 * Math.PI)
          ctx.fill()
        })
      }
    })

    // Current SNR marker
    if (currentSNR <= maxSNR) {
      const currentX = toCanvasX(currentSNR)
      ctx.strokeStyle = 'yellow'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(currentX, 40)
      ctx.lineTo(currentX, height - 40)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('SNR (dB)', width / 2 - 30, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('BER (log scale)', -40, 0)
    ctx.restore()

    // Legend
    let legendY = 50
    techniques.forEach(technique => {
      if (technique.show) {
        ctx.strokeStyle = technique.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(width - 200, legendY)
        ctx.lineTo(width - 180, legendY)
        ctx.stroke()
        ctx.fillStyle = 'white'
        ctx.fillText(technique.label, width - 175, legendY + 4)
        legendY += 20
      }
    })
  }

  // Draw diversity gain comparison
  const drawDiversityGain = () => {
    const canvas = diversityRef.current
    if (!canvas || berData.length < 5) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Calculate diversity gains (slope of BER curves)
    const highSNRData = berData.slice(-5) // Last 5 points
    
    if (highSNRData.length < 2) return

    // Calculate slopes for diversity order estimation
    const calculateSlope = (data: number[]) => {
      const n = data.length
      const x = highSNRData.map(d => d.snr)
      const y = data.map(d => Math.log10(d))
      
      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = y.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
      
      return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    }

    const slope_sc = calculateSlope(highSNRData.map(d => d.ber_sc))
    const slope_egc = calculateSlope(highSNRData.map(d => d.ber_egc))
    const slope_mrc = calculateSlope(highSNRData.map(d => d.ber_mrc))

    // Draw diversity order bars
    const techniques = [
      { name: 'SC', slope: -slope_sc, color: 'red' },
      { name: 'EGC', slope: -slope_egc, color: 'blue' },
      { name: 'MRC', slope: -slope_mrc, color: 'cyan' }
    ]

    const maxSlope = Math.max(...techniques.map(t => t.slope))
    const barWidth = (width - 120) / 3
    
    techniques.forEach((tech, i) => {
      const barHeight = (tech.slope / maxSlope) * (height - 100)
      const x = 40 + i * (barWidth + 20)
      const y = height - 40 - barHeight
      
      ctx.fillStyle = tech.color
      ctx.fillRect(x, y, barWidth, barHeight)
      
      // Labels
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.fillText(tech.name, x + barWidth/2 - 10, height - 20)
      ctx.fillText(tech.slope.toFixed(1), x + barWidth/2 - 10, y - 5)
    })

    ctx.fillStyle = 'white'
    ctx.font = '14px Arial'
    ctx.fillText('Diversity Order Estimation', 10, 20)
    ctx.font = '10px Arial'
    ctx.fillText('(Higher values = better diversity)', 10, 35)
  }

  // Draw system diagram
  const drawSystemDiagram = () => {
    const canvas = diagramRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Draw transmitter
    ctx.fillStyle = 'orange'
    ctx.fillRect(50, height/2 - 15, 30, 30)
    ctx.fillStyle = 'white'
    ctx.font = '10px Arial'
    ctx.fillText('Tx', 60, height/2 + 5)

    // Draw receivers
    const rxPositions = []
    for (let i = 0; i < params.Mr; i++) {
      const y = height/2 - (params.Mr - 1) * 15 + i * 30
      rxPositions.push(y)
      
      ctx.fillStyle = 'lightblue'
      ctx.fillRect(300, y - 10, 25, 20)
      ctx.fillStyle = 'white'
      ctx.font = '8px Arial'
      ctx.fillText(`Rx${i+1}`, 305, y + 2)
    }

    // Draw channel paths
    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = 1
    rxPositions.forEach(rxY => {
      ctx.beginPath()
      ctx.moveTo(80, height/2)
      ctx.lineTo(300, rxY)
      ctx.stroke()
      
      // Add fading indicator
      ctx.fillStyle = 'yellow'
      ctx.font = '8px Arial'
      ctx.fillText('h', 150, (height/2 + rxY)/2)
    })

    // Draw combiner
    ctx.fillStyle = 'green'
    ctx.fillRect(350, height/2 - 20, 40, 40)
    ctx.fillStyle = 'white'
    ctx.font = '10px Arial'
    ctx.fillText('Comb', 355, height/2 + 5)

    // Draw decision device
    ctx.fillStyle = 'purple'
    ctx.fillRect(410, height/2 - 10, 30, 20)
    ctx.fillStyle = 'white'
    ctx.font = '8px Arial'
    ctx.fillText('Dec', 418, height/2 + 2)

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText(`Diversity System (${params.Mt}×${params.Mr})`, 10, 20)
    ctx.font = '10px Arial'
    ctx.fillText('BPSK Signal', 45, height/2 + 45)
    ctx.fillText('Rayleigh Fading', 200, 20)
    ctx.fillText('Output', 415, height/2 + 35)
  }

  // Control functions
  const startAnimation = () => {
    if (currentSNR >= params.maxSNR) return
    setIsPlaying(true)
  }

  const pauseAnimation = () => {
    setIsPlaying(false)
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentSNR(0)
    setBERData([])
  }

  // Effects
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(animationStep, 500)
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
  }, [isPlaying, currentSNR, params])

  useEffect(() => {
    drawBERChart()
  }, [berData, params.showTechnique])

  useEffect(() => {
    drawDiversityGain()
  }, [berData])

  useEffect(() => {
    drawSystemDiagram()
  }, [params.Mr, params.Mt])

  const progress = currentSNR / params.maxSNR

  return (
    <div className="diversity-combining-animation">
      <div className="animation-header">
        <h3>Interactive Diversity Combining Analysis</h3>
        <p>Compare Selection Combining, Equal Gain Combining, and Maximum Ratio Combining techniques</p>
      </div>

      <div className="animation-controls">
        <div className="control-buttons">
          <button 
            onClick={isPlaying ? pauseAnimation : startAnimation}
            className="control-btn primary"
            disabled={currentSNR >= params.maxSNR}
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
            <label>Receive Antennas (Mr):</label>
            <input 
              type="number" 
              value={params.Mr} 
              onChange={(e) => setParams(prev => ({...prev, Mr: Number(e.target.value)}))}
              step="1"
              min="1"
              max="4"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Max SNR (dB):</label>
            <input 
              type="number" 
              value={params.maxSNR} 
              onChange={(e) => setParams(prev => ({...prev, maxSNR: Number(e.target.value)}))}
              step="5"
              min="20"
              max="40"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Num Bits:</label>
            <input 
              type="number" 
              value={params.numBits} 
              onChange={(e) => setParams(prev => ({...prev, numBits: Number(e.target.value)}))}
              step="5000"
              min="5000"
              max="50000"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Show Technique:</label>
            <select 
              value={params.showTechnique} 
              onChange={(e) => setParams(prev => ({...prev, showTechnique: e.target.value}))}
            >
              <option value="all">All Techniques</option>
              <option value="sc">SC Only</option>
              <option value="egc">EGC Only</option>
              <option value="mrc">MRC Only</option>
            </select>
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
          SNR: {currentSNR} dB / {params.maxSNR} dB ({(progress * 100).toFixed(1)}%)
        </span>
      </div>

      <div className="animation-content">
        <div className="charts-container">
          <div className="chart-item">
            <h4>BER vs SNR Comparison</h4>
            <canvas 
              ref={berRef} 
              width={500} 
              height={350}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <h4>System Block Diagram</h4>
            <canvas 
              ref={diagramRef} 
              width={450} 
              height={300}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item full-width">
            <h4>Diversity Order Analysis</h4>
            <canvas 
              ref={diversityRef} 
              width={400} 
              height={250}
              className="chart-canvas"
            />
          </div>
        </div>

        {berData.length > 0 && (
          <div className="statistics-panel">
            <h4>Current Performance Analysis (SNR: {currentSNR} dB)</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">SC BER:</span>
                <span className="stat-value">
                  {berData[berData.length - 1]?.ber_sc.toExponential(2)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">EGC BER:</span>
                <span className="stat-value">
                  {berData[berData.length - 1]?.ber_egc.toExponential(2)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">MRC BER:</span>
                <span className="stat-value">
                  {berData[berData.length - 1]?.ber_mrc.toExponential(2)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">MRC Gain over SC:</span>
                <span className="stat-value">
                  {(berData[berData.length - 1]?.ber_sc / berData[berData.length - 1]?.ber_mrc).toFixed(1)}×
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Diversity Order:</span>
                <span className="stat-value">{params.Mr}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Configuration:</span>
                <span className="stat-value">{params.Mt}×{params.Mr}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>MRC provides optimal BER performance among all combining techniques</li>
          <li>EGC offers good performance with moderate complexity</li>
          <li>SC is simplest but has worst performance among diversity techniques</li>
          <li>All techniques achieve the same diversity order (Mr)</li>
          <li>Performance gap increases with higher SNR values</li>
          <li>More receive antennas provide better diversity gain</li>
        </ul>
      </div>
    </div>
  )
}