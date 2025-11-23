'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface AlamoutiParams {
  maxSNR: number
  numBits: number
  modulation: string // 'bpsk' or 'qpsk'
  showComparison: string
}

interface BERData {
  snr: number
  ber_normal: number
  ber_alamouti: number
  ber_theory_normal?: number
  ber_theory_alamouti?: number
}

export default function AlamoutiSTBCAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSNR, setCurrentSNR] = useState(0)
  const [params, setParams] = useState<AlamoutiParams>({
    maxSNR: 20,
    numBits: 100000,
    modulation: 'bpsk',
    showComparison: 'both'
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const berRef = useRef<HTMLCanvasElement>(null)
  const encodingRef = useRef<HTMLCanvasElement>(null)
  const constellationRef = useRef<HTMLCanvasElement>(null)
  
  const [berData, setBERData] = useState<BERData[]>([])

  // Generate complex Gaussian random variables
  const complexGaussian = (size: number): number[] => {
    return Array(size).fill(0).map(() => {
      const real = (Math.random() - 0.5) * 2
      const imag = (Math.random() - 0.5) * 2
      return Math.sqrt(real * real + imag * imag) / Math.sqrt(2)
    })
  }

  // BPSK modulation
  const bpskModulate = (bits: number[]): number[] => {
    return bits.map(bit => bit === 1 ? 1 : -1)
  }

  // QPSK modulation
  const qpskModulate = (bits: number[]): number[] => {
    const symbols = []
    for (let i = 0; i < bits.length; i += 2) {
      const I = bits[i] === 1 ? 1 : -1
      const Q = bits[i + 1] === 1 ? 1 : -1
      // Return magnitude (for simulation simplicity)
      symbols.push(Math.sqrt(I * I + Q * Q) / Math.sqrt(2))
    }
    return symbols
  }

  // Normal 2x1 MISO simulation
  const simulateNormalMISO = (snrLinear: number, numBits: number): number => {
    const bits = Array(numBits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
    
    let symbols: number[]
    if (params.modulation === 'bpsk') {
      symbols = bpskModulate(bits)
    } else {
      symbols = qpskModulate(bits)
    }
    
    const N = symbols.length
    const h1 = complexGaussian(N)
    const h2 = complexGaussian(N)
    
    // Power normalization: split power between antennas
    const tx = symbols.map(s => s / Math.sqrt(2))
    
    // Noise
    const noiseVar = 1 / (2 * snrLinear)
    const noise = complexGaussian(N).map(n => n * Math.sqrt(noiseVar))
    
    // Received signal: both antennas transmit same symbol
    const r = tx.map((s, i) => h1[i] * s + h2[i] * s + noise[i])
    
    // MRC combining
    const hCombined = h1.map((h1_val, i) => h1_val + h2[i])
    const y = r.map((r_val, i) => {
      const hMag = hCombined[i] * hCombined[i]
      return hMag > 0 ? (hCombined[i] * r_val) / hMag : 0
    })
    
    // Decision
    const recvBits = y.map(val => val > 0 ? 1 : 0)
    
    // Calculate BER
    let errors = 0
    if (params.modulation === 'bpsk') {
      errors = recvBits.reduce((sum, bit, i) => sum + (bit !== bits[i] ? 1 : 0), 0)
      return errors / numBits
    } else {
      // QPSK: compare with original bits (simplified)
      for (let i = 0; i < recvBits.length && i * 2 + 1 < bits.length; i++) {
        if (recvBits[i] !== bits[i * 2]) errors++
        if (recvBits[i] !== bits[i * 2 + 1]) errors++
      }
      return errors / numBits
    }
  }

  // Alamouti STBC simulation
  const simulateAlamoutiSTBC = (snrLinear: number, numBits: number): number => {
    const bits = Array(numBits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
    
    let symbols: number[]
    if (params.modulation === 'bpsk') {
      symbols = bpskModulate(bits)
    } else {
      symbols = qpskModulate(bits)
    }
    
    // Alamouti encoding: process symbols in pairs
    const s1 = symbols.filter((_, i) => i % 2 === 0)
    const s2 = symbols.filter((_, i) => i % 2 === 1)
    const L = Math.min(s1.length, s2.length)
    
    const h1 = complexGaussian(L)
    const h2 = complexGaussian(L)
    
    // Power normalization
    const x1 = s1.slice(0, L).map(s => s / Math.sqrt(2))
    const x2 = s2.slice(0, L).map(s => s / Math.sqrt(2))
    const x3 = s2.slice(0, L).map(s => -s / Math.sqrt(2)) // -s2*
    const x4 = s1.slice(0, L).map(s => s / Math.sqrt(2))  // s1*
    
    // Noise
    const noiseVar = 1 / (2 * snrLinear)
    const n1 = complexGaussian(L).map(n => n * Math.sqrt(noiseVar))
    const n2 = complexGaussian(L).map(n => n * Math.sqrt(noiseVar))
    
    // Received signals
    const r1 = x1.map((x1_val, i) => h1[i] * x1_val + h2[i] * x2[i] + n1[i])
    const r2 = x3.map((x3_val, i) => h1[i] * x3_val + h2[i] * x4[i] + n2[i])
    
    // Alamouti decoding
    const y1 = r1.map((r1_val, i) => h1[i] * r1_val + h2[i] * r2[i])
    const y2 = r1.map((r1_val, i) => h2[i] * r1_val - h1[i] * r2[i])
    
    // Channel energy normalization
    const hEq = h1.map((h1_val, i) => h1_val * h1_val + h2[i] * h2[i])
    const s1_rx = y1.map((y_val, i) => hEq[i] > 0 ? y_val / hEq[i] : 0)
    const s2_rx = y2.map((y_val, i) => hEq[i] > 0 ? y_val / hEq[i] : 0)
    
    // Reconstruct bits
    const recvBits = Array(numBits).fill(0)
    for (let i = 0; i < L; i++) {
      if (i * 2 < numBits) recvBits[i * 2] = s1_rx[i] > 0 ? 1 : 0
      if (i * 2 + 1 < numBits) recvBits[i * 2 + 1] = s2_rx[i] > 0 ? 1 : 0
    }
    
    // Calculate BER
    const errors = recvBits.reduce((sum, bit, i) => sum + (bit !== bits[i] ? 1 : 0), 0)
    return errors / numBits
  }

  // Theoretical BER calculations
  const calculateTheoreticalBER = (snrLinear: number): { normal: number, alamouti: number } => {
    if (params.modulation === 'bpsk') {
      // BPSK in Rayleigh fading
      const gamma = snrLinear
      const normal = 0.5 * (1 - Math.sqrt(gamma / (1 + gamma)))
      
      // Alamouti 2x1 (approximation)
      const mu = Math.sqrt(gamma / (1 + gamma))
      const alamouti = Math.pow(0.5 * (1 - mu), 2) * (1 + 2 * mu)
      
      return { normal, alamouti }
    } else {
      // QPSK (similar to BPSK per bit)
      const gamma = snrLinear
      const normal = 0.5 * (1 - Math.sqrt(gamma / (1 + gamma)))
      const mu = Math.sqrt(gamma / (1 + gamma))
      const alamouti = Math.pow(0.5 * (1 - mu), 2) * (1 + 2 * mu)
      
      return { normal, alamouti }
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
      
      const ber_normal = simulateNormalMISO(snrLinear, params.numBits / 10) // Reduced for performance
      const ber_alamouti = simulateAlamoutiSTBC(snrLinear, params.numBits / 10)
      const theoretical = calculateTheoreticalBER(snrLinear)
      
      const berResult: BERData = {
        snr: newSNR,
        ber_normal: Math.max(ber_normal, 1e-6),
        ber_alamouti: Math.max(ber_alamouti, 1e-6),
        ber_theory_normal: Math.max(theoretical.normal, 1e-6),
        ber_theory_alamouti: Math.max(theoretical.alamouti, 1e-6)
      }
      
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

    const snrValues = berData.map(d => d.snr)
    const allBER = berData.flatMap(d => [d.ber_normal, d.ber_alamouti])
    const minSNR = Math.min(...snrValues)
    const maxSNR = Math.max(...snrValues)
    const minBER = Math.min(...allBER)
    const maxBER = Math.max(...allBER)

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

    // Draw curves
    const curves = [
      { data: 'ber_normal', color: 'blue', label: `Normal 2×1 MISO (${params.modulation.toUpperCase()})`, show: params.showComparison === 'both' || params.showComparison === 'normal' },
      { data: 'ber_alamouti', color: 'red', label: `Alamouti 2×1 STBC (${params.modulation.toUpperCase()})`, show: params.showComparison === 'both' || params.showComparison === 'alamouti' },
      { data: 'ber_theory_normal', color: 'lightblue', label: 'Theoretical Normal', show: params.showComparison === 'both', dash: true },
      { data: 'ber_theory_alamouti', color: 'pink', label: 'Theoretical Alamouti', show: params.showComparison === 'both', dash: true }
    ]

    curves.forEach(curve => {
      if (curve.show && berData[0][curve.data as keyof BERData] !== undefined) {
        ctx.strokeStyle = curve.color
        ctx.lineWidth = curve.dash ? 1 : 2
        if (curve.dash) ctx.setLineDash([5, 5])
        else ctx.setLineDash([])
        
        ctx.beginPath()
        berData.forEach((point, i) => {
          const value = point[curve.data as keyof BERData] as number
          if (value !== undefined) {
            const x = toCanvasX(point.snr)
            const y = toCanvasY(value)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
        })
        ctx.stroke()

        // Draw points for main curves
        if (!curve.dash) {
          ctx.fillStyle = curve.color
          berData.forEach(point => {
            const value = point[curve.data as keyof BERData] as number
            if (value !== undefined) {
              const x = toCanvasX(point.snr)
              const y = toCanvasY(value)
              ctx.beginPath()
              ctx.arc(x, y, 3, 0, 2 * Math.PI)
              ctx.fill()
            }
          })
        }
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
    curves.forEach(curve => {
      if (curve.show && berData.length > 0 && berData[0][curve.data as keyof BERData] !== undefined) {
        ctx.strokeStyle = curve.color
        ctx.lineWidth = curve.dash ? 1 : 2
        if (curve.dash) ctx.setLineDash([5, 5])
        else ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(width - 200, legendY)
        ctx.lineTo(width - 180, legendY)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = 'white'
        ctx.fillText(curve.label, width - 175, legendY + 4)
        legendY += 20
      }
    })
  }

  // Draw Alamouti encoding diagram
  const drawEncodingDiagram = () => {
    const canvas = encodingRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Title
    ctx.fillStyle = 'white'
    ctx.font = '14px Arial'
    ctx.fillText('Alamouti Space-Time Block Code', 10, 20)

    // Input symbols
    ctx.font = '12px Arial'
    ctx.fillText('Input: s₁, s₂', 20, 50)

    // Encoding matrix
    ctx.fillText('Encoding Matrix:', 20, 80)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1
    
    // Matrix brackets
    ctx.beginPath()
    ctx.moveTo(50, 100)
    ctx.lineTo(40, 100)
    ctx.lineTo(40, 140)
    ctx.lineTo(50, 140)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(200, 100)
    ctx.lineTo(210, 100)
    ctx.lineTo(210, 140)
    ctx.lineTo(200, 140)
    ctx.stroke()

    // Matrix elements
    ctx.fillText('s₁', 60, 115)
    ctx.fillText('s₂', 120, 115)
    ctx.fillText('-s₂*', 55, 135)
    ctx.fillText('s₁*', 120, 135)

    // Time slots
    ctx.fillText('Time 1', 240, 115)
    ctx.fillText('Time 2', 240, 135)

    // Transmission scheme
    ctx.fillText('Transmission:', 20, 170)
    ctx.fillText('Tx1 → s₁, Tx2 → s₂ (Time 1)', 30, 190)
    ctx.fillText('Tx1 → -s₂*, Tx2 → s₁* (Time 2)', 30, 210)

    // Orthogonality property
    ctx.fillText('Orthogonal: S·S† = (|s₁|² + |s₂|²)I', 20, 240)
    ctx.fillText('Enables linear ML decoding', 20, 260)
  }

  // Draw constellation diagram
  const drawConstellation = () => {
    const canvas = constellationRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const scale = 60

    ctx.fillStyle = 'white'
    ctx.font = '14px Arial'
    ctx.fillText(`${params.modulation.toUpperCase()} Constellation`, 10, 20)

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(centerX - scale, centerY)
    ctx.lineTo(centerX + scale, centerY)
    ctx.moveTo(centerX, centerY - scale)
    ctx.lineTo(centerX, centerY + scale)
    ctx.stroke()

    if (params.modulation === 'bpsk') {
      // BPSK constellation
      ctx.fillStyle = 'cyan'
      ctx.beginPath()
      ctx.arc(centerX - scale/2, centerY, 6, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(centerX + scale/2, centerY, 6, 0, 2 * Math.PI)
      ctx.fill()
      
      ctx.fillStyle = 'white'
      ctx.font = '10px Arial'
      ctx.fillText('-1', centerX - scale/2 - 8, centerY + 20)
      ctx.fillText('+1', centerX + scale/2 - 5, centerY + 20)
    } else {
      // QPSK constellation
      ctx.fillStyle = 'orange'
      const qpskPoints = [
        [scale/2, -scale/2], [scale/2, scale/2], 
        [-scale/2, scale/2], [-scale/2, -scale/2]
      ]
      qpskPoints.forEach(([x, y]) => {
        ctx.beginPath()
        ctx.arc(centerX + x, centerY + y, 5, 0, 2 * Math.PI)
        ctx.fill()
      })
      
      ctx.fillStyle = 'white'
      ctx.font = '8px Arial'
      ctx.fillText('01', centerX + scale/2 + 5, centerY - scale/2)
      ctx.fillText('11', centerX + scale/2 + 5, centerY + scale/2 + 10)
      ctx.fillText('10', centerX - scale/2 - 15, centerY + scale/2 + 10)
      ctx.fillText('00', centerX - scale/2 - 15, centerY - scale/2)
    }

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '10px Arial'
    ctx.fillText('I', centerX + scale + 10, centerY + 5)
    ctx.fillText('Q', centerX - 5, centerY - scale - 10)
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
      intervalRef.current = setInterval(animationStep, 600)
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
  }, [berData, params.showComparison])

  useEffect(() => {
    drawEncodingDiagram()
  }, [])

  useEffect(() => {
    drawConstellation()
  }, [params.modulation])

  const progress = currentSNR / params.maxSNR

  return (
    <div className="alamouti-stbc-animation">
      <div className="animation-header">
        <h3>Interactive Alamouti Space-Time Block Coding Analysis</h3>
        <p>Compare normal MISO systems with Alamouti STBC for BPSK and QPSK modulation</p>
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
            <label>Modulation:</label>
            <select 
              value={params.modulation} 
              onChange={(e) => setParams(prev => ({...prev, modulation: e.target.value}))}
              disabled={isPlaying}
            >
              <option value="bpsk">BPSK</option>
              <option value="qpsk">QPSK</option>
            </select>
          </div>
          <div className="param-group">
            <label>Max SNR (dB):</label>
            <input 
              type="number" 
              value={params.maxSNR} 
              onChange={(e) => setParams(prev => ({...prev, maxSNR: Number(e.target.value)}))}
              step="5"
              min="15"
              max="25"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Num Bits:</label>
            <input 
              type="number" 
              value={params.numBits} 
              onChange={(e) => setParams(prev => ({...prev, numBits: Number(e.target.value)}))}
              step="10000"
              min="10000"
              max="200000"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Show:</label>
            <select 
              value={params.showComparison} 
              onChange={(e) => setParams(prev => ({...prev, showComparison: e.target.value}))}
            >
              <option value="both">Both Systems</option>
              <option value="normal">Normal MISO Only</option>
              <option value="alamouti">Alamouti STBC Only</option>
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
            <h4>BER Performance Comparison</h4>
            <canvas 
              ref={berRef} 
              width={500} 
              height={350}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <h4>Alamouti Encoding Scheme</h4>
            <canvas 
              ref={encodingRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item full-width">
            <h4>Modulation Constellation</h4>
            <canvas 
              ref={constellationRef} 
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
                <span className="stat-label">Normal MISO BER:</span>
                <span className="stat-value">
                  {berData[berData.length - 1]?.ber_normal.toExponential(2)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Alamouti STBC BER:</span>
                <span className="stat-value">
                  {berData[berData.length - 1]?.ber_alamouti.toExponential(2)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Alamouti Gain:</span>
                <span className="stat-value">
                  {(berData[berData.length - 1]?.ber_normal / berData[berData.length - 1]?.ber_alamouti).toFixed(1)}×
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Modulation:</span>
                <span className="stat-value">{params.modulation.toUpperCase()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Code Rate:</span>
                <span className="stat-value">1 (Full Rate)</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Diversity Order:</span>
                <span className="stat-value">2 (Alamouti)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>Alamouti STBC provides full transmit diversity without channel feedback</li>
          <li>Orthogonal code design enables linear maximum likelihood decoding</li>
          <li>Significant BER improvement over normal MISO repetition coding</li>
          <li>Full rate transmission (no bandwidth expansion required)</li>
          <li>BPSK and QPSK show similar diversity gains with Alamouti coding</li>
          <li>Practical implementation in 3G/4G and WiFi standards</li>
        </ul>
      </div>
    </div>
  )
}