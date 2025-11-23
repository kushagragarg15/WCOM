'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface ModulationParams {
  maxSNR: number
  numBits: number
  analysisType: string // 'modulation' or 'mimo'
  selectedScheme: string
}

interface ModulationBERData {
  snr: number
  ber_bpsk: number
  ber_qpsk: number
  ber_16qam: number
  ber_64qam: number
}

interface MIMOBERData {
  snr: number
  ber_simo: number
  ber_miso: number
  ber_mimo: number
}

export default function ModulationMIMOAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSNR, setCurrentSNR] = useState(0)
  const [params, setParams] = useState<ModulationParams>({
    maxSNR: 20,
    numBits: 100000,
    analysisType: 'modulation',
    selectedScheme: 'all'
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const modulationRef = useRef<HTMLCanvasElement>(null)
  const mimoRef = useRef<HTMLCanvasElement>(null)
  const constellationRef = useRef<HTMLCanvasElement>(null)
  
  const [modulationData, setModulationData] = useState<ModulationBERData[]>([])
  const [mimoData, setMIMOData] = useState<MIMOBERData[]>([])

  // Q-function approximation (complementary error function)
  const qfunc = (x: number): number => {
    // Approximation of Q(x) = 0.5 * erfc(x/sqrt(2))
    // Using polynomial approximation for erfc
    if (x < 0) return 1 - qfunc(-x)
    if (x === 0) return 0.5
    
    const t = 1 / (1 + 0.3275911 * x)
    const erfcApprox = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
    
    return 0.5 * erfcApprox
  }

  // Calculate theoretical BER for modulation schemes
  const calculateModulationBER = (snrLinear: number): ModulationBERData => {
    // BPSK
    const ber_bpsk = qfunc(Math.sqrt(2 * snrLinear))
    
    // QPSK (same as BPSK in AWGN)
    const ber_qpsk = qfunc(Math.sqrt(2 * snrLinear))
    
    // 16-QAM
    const M16 = 16
    const ber_16qam = (4 / Math.log2(M16)) * (1 - 1/Math.sqrt(M16)) * 
                      qfunc(Math.sqrt(3 * Math.log2(M16) / (M16 - 1) * snrLinear))
    
    // 64-QAM
    const M64 = 64
    const ber_64qam = (4 / Math.log2(M64)) * (1 - 1/Math.sqrt(M64)) * 
                      qfunc(Math.sqrt(3 * Math.log2(M64) / (M64 - 1) * snrLinear))
    
    return {
      snr: currentSNR,
      ber_bpsk: Math.max(ber_bpsk, 1e-10),
      ber_qpsk: Math.max(ber_qpsk, 1e-10),
      ber_16qam: Math.max(ber_16qam, 1e-10),
      ber_64qam: Math.max(ber_64qam, 1e-10)
    }
  }

  // Generate complex Gaussian random variables
  const complexGaussian = (size: number): number[] => {
    return Array(size).fill(0).map(() => {
      const real = (Math.random() - 0.5) * 2
      const imag = (Math.random() - 0.5) * 2
      return Math.sqrt(real * real + imag * imag) / Math.sqrt(2)
    })
  }

  // SIMO with MRC
  const simulateSIMO = (snrLinear: number, numBits: number): number => {
    const bits = Array(numBits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
    const tx = bits.map(bit => bit === 1 ? 1 : -1) // BPSK
    
    // Two receive antennas
    const h1 = complexGaussian(numBits)
    const h2 = complexGaussian(numBits)
    
    const noise1 = complexGaussian(numBits).map(n => n * Math.sqrt(1 / (2 * snrLinear)))
    const noise2 = complexGaussian(numBits).map(n => n * Math.sqrt(1 / (2 * snrLinear)))
    
    const r1 = tx.map((s, i) => h1[i] * s + noise1[i])
    const r2 = tx.map((s, i) => h2[i] * s + noise2[i])
    
    // MRC combining
    const r_combined = r1.map((r1_val, i) => h1[i] * r1_val + h2[i] * r2[i])
    const bits_hat = r_combined.map(r => r > 0 ? 1 : 0)
    
    return bits.reduce((errors, bit, i) => errors + (bit !== bits_hat[i] ? 1 : 0), 0) / numBits
  }

  // MISO with Alamouti STBC
  const simulateMISO = (snrLinear: number, numBits: number): number => {
    const bits = Array(numBits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
    const tx = bits.map(bit => bit === 1 ? 1 : -1)
    
    // Alamouti encoding (pairs of symbols)
    const s1 = tx.filter((_, i) => i % 2 === 0)
    const s2 = tx.filter((_, i) => i % 2 === 1)
    const L = Math.min(s1.length, s2.length)
    
    const h1 = complexGaussian(L)
    const h2 = complexGaussian(L)
    
    const noise1 = complexGaussian(L).map(n => n * Math.sqrt(1 / (2 * snrLinear)))
    const noise2 = complexGaussian(L).map(n => n * Math.sqrt(1 / (2 * snrLinear)))
    
    // Alamouti reception
    const r1 = s1.map((s1_val, i) => h1[i] * s1_val + h2[i] * s2[i] + noise1[i])
    const r2 = s1.map((s1_val, i) => -h2[i] * s1_val + h1[i] * s2[i] + noise2[i])
    
    // Alamouti decoding
    const s1_hat = r1.map((r1_val, i) => h1[i] * r1_val + h2[i] * r2[i])
    const s2_hat = r1.map((r1_val, i) => h2[i] * r1_val - h1[i] * r2[i])
    
    const bits_rx = [...s1_hat, ...s2_hat].map(s => s > 0 ? 1 : 0)
    const bits_subset = bits.slice(0, bits_rx.length)
    
    return bits_subset.reduce((errors, bit, i) => errors + (bit !== bits_rx[i] ? 1 : 0), 0) / bits_subset.length
  }

  // MIMO with Alamouti STBC
  const simulateMIMO = (snrLinear: number, numBits: number): number => {
    const bits = Array(numBits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0)
    const tx = bits.map(bit => bit === 1 ? 1 : -1)
    
    const s1 = tx.filter((_, i) => i % 2 === 0)
    const s2 = tx.filter((_, i) => i % 2 === 1)
    const L = Math.min(s1.length, s2.length)
    
    // 2x2 channel matrix
    const h11 = complexGaussian(L)
    const h12 = complexGaussian(L)
    const h21 = complexGaussian(L)
    const h22 = complexGaussian(L)
    
    const noise1 = complexGaussian(L).map(n => n * Math.sqrt(1 / (2 * snrLinear)))
    const noise2 = complexGaussian(L).map(n => n * Math.sqrt(1 / (2 * snrLinear)))
    
    // Received signals at both antennas
    const r1 = s1.map((s1_val, i) => h11[i] * s1_val + h12[i] * s2[i] + noise1[i])
    const r2 = s1.map((s1_val, i) => h21[i] * s1_val + h22[i] * s2[i] + noise2[i])
    
    // Alamouti combining
    const s1_hat = r1.map((r1_val, i) => h11[i] * r1_val + h12[i] * r2[i])
    const s2_hat = r1.map((r1_val, i) => h12[i] * r1_val - h11[i] * r2[i])
    
    const bits_rx = [...s1_hat, ...s2_hat].map(s => s > 0 ? 1 : 0)
    const bits_subset = bits.slice(0, bits_rx.length)
    
    return bits_subset.reduce((errors, bit, i) => errors + (bit !== bits_rx[i] ? 1 : 0), 0) / bits_subset.length
  }

  // Calculate MIMO BER
  const calculateMIMOBER = (snrLinear: number): MIMOBERData => {
    const ber_simo = simulateSIMO(snrLinear, params.numBits / 10) // Reduced for performance
    const ber_miso = simulateMISO(snrLinear, params.numBits / 10)
    const ber_mimo = simulateMIMO(snrLinear, params.numBits / 10)
    
    return {
      snr: currentSNR,
      ber_simo: Math.max(ber_simo, 1e-6),
      ber_miso: Math.max(ber_miso, 1e-6),
      ber_mimo: Math.max(ber_mimo, 1e-6)
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
      
      if (params.analysisType === 'modulation') {
        const modResult = calculateModulationBER(snrLinear)
        setModulationData(prevData => [...prevData, modResult])
      } else {
        const mimoResult = calculateMIMOBER(snrLinear)
        setMIMOData(prevData => [...prevData, mimoResult])
      }

      return newSNR
    })
  }

  // Draw modulation BER chart
  const drawModulationChart = () => {
    const canvas = modulationRef.current
    if (!canvas || modulationData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const snrValues = modulationData.map(d => d.snr)
    const allBER = modulationData.flatMap(d => [d.ber_bpsk, d.ber_qpsk, d.ber_16qam, d.ber_64qam])
    const minSNR = Math.min(...snrValues)
    const maxSNR = Math.max(...snrValues)
    const minBER = Math.min(...allBER)
    const maxBER = Math.max(...allBER)

    const toCanvasX = (snr: number) => ((snr - minSNR) / (maxSNR - minSNR)) * (width - 80) + 40
    const toCanvasY = (ber: number) => {
      const logBER = Math.log10(Math.max(ber, 1e-10))
      const logMinBER = Math.log10(Math.max(minBER, 1e-10))
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

    // Draw modulation curves
    const schemes = [
      { data: 'ber_bpsk', color: 'blue', label: 'BPSK', show: params.selectedScheme === 'all' || params.selectedScheme === 'bpsk' },
      { data: 'ber_qpsk', color: 'red', label: 'QPSK', show: params.selectedScheme === 'all' || params.selectedScheme === 'qpsk' },
      { data: 'ber_16qam', color: 'green', label: '16-QAM', show: params.selectedScheme === 'all' || params.selectedScheme === '16qam' },
      { data: 'ber_64qam', color: 'magenta', label: '64-QAM', show: params.selectedScheme === 'all' || params.selectedScheme === '64qam' }
    ]

    schemes.forEach(scheme => {
      if (scheme.show) {
        ctx.strokeStyle = scheme.color
        ctx.lineWidth = 2
        ctx.beginPath()
        
        modulationData.forEach((point, i) => {
          const x = toCanvasX(point.snr)
          const y = toCanvasY(point[scheme.data as keyof ModulationBERData] as number)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // Draw points
        ctx.fillStyle = scheme.color
        modulationData.forEach(point => {
          const x = toCanvasX(point.snr)
          const y = toCanvasY(point[scheme.data as keyof ModulationBERData] as number)
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, 2 * Math.PI)
          ctx.fill()
        })
      }
    })

    // Labels and legend
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Eb/N0 (dB)', width / 2 - 30, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('BER (log scale)', -40, 0)
    ctx.restore()

    // Legend
    let legendY = 50
    schemes.forEach(scheme => {
      if (scheme.show) {
        ctx.strokeStyle = scheme.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(width - 120, legendY)
        ctx.lineTo(width - 100, legendY)
        ctx.stroke()
        ctx.fillStyle = 'white'
        ctx.fillText(scheme.label, width - 95, legendY + 4)
        legendY += 20
      }
    })
  }

  // Draw MIMO BER chart
  const drawMIMOChart = () => {
    const canvas = mimoRef.current
    if (!canvas || mimoData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const snrValues = mimoData.map(d => d.snr)
    const allBER = mimoData.flatMap(d => [d.ber_simo, d.ber_miso, d.ber_mimo])
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

    // Draw MIMO curves
    const techniques = [
      { data: 'ber_simo', color: 'blue', label: '1×2 SIMO (MRC)' },
      { data: 'ber_miso', color: 'red', label: '2×1 MISO (Alamouti)' },
      { data: 'ber_mimo', color: 'green', label: '2×2 MIMO (Alamouti)' }
    ]

    techniques.forEach(technique => {
      ctx.strokeStyle = technique.color
      ctx.lineWidth = 2
      ctx.beginPath()
      
      mimoData.forEach((point, i) => {
        const x = toCanvasX(point.snr)
        const y = toCanvasY(point[technique.data as keyof MIMOBERData] as number)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Draw points
      ctx.fillStyle = technique.color
      mimoData.forEach(point => {
        const x = toCanvasX(point.snr)
        const y = toCanvasY(point[technique.data as keyof MIMOBERData] as number)
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
      })
    })

    // Labels and legend
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Eb/N0 (dB)', width / 2 - 30, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('BER (log scale)', -40, 0)
    ctx.restore()

    // Legend
    let legendY = 50
    techniques.forEach(technique => {
      ctx.strokeStyle = technique.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(width - 180, legendY)
      ctx.lineTo(width - 160, legendY)
      ctx.stroke()
      ctx.fillStyle = 'white'
      ctx.fillText(technique.label, width - 155, legendY + 4)
      legendY += 20
    })
  }

  // Draw constellation diagrams
  const drawConstellations = () => {
    const canvas = constellationRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const scale = 40

    // BPSK constellation
    ctx.fillStyle = 'blue'
    ctx.beginPath()
    ctx.arc(centerX - 3*scale, centerY, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(centerX - scale, centerY, 4, 0, 2 * Math.PI)
    ctx.fill()
    
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('BPSK', centerX - 3*scale - 15, centerY + 25)

    // QPSK constellation
    ctx.fillStyle = 'red'
    const qpsk_points = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    qpsk_points.forEach(([x, y]) => {
      ctx.beginPath()
      ctx.arc(centerX + x * scale/2, centerY - y * scale/2, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
    
    ctx.fillStyle = 'white'
    ctx.fillText('QPSK', centerX - 15, centerY + 25)

    // 16-QAM constellation
    ctx.fillStyle = 'green'
    for (let i = -3; i <= 3; i += 2) {
      for (let j = -3; j <= 3; j += 2) {
        ctx.beginPath()
        ctx.arc(centerX + 3*scale + i * scale/6, centerY - j * scale/6, 3, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
    
    ctx.fillStyle = 'white'
    ctx.fillText('16-QAM', centerX + 3*scale - 20, centerY + 25)

    // Title
    ctx.fillStyle = 'white'
    ctx.font = '14px Arial'
    ctx.fillText('Modulation Constellations', 10, 20)
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
    setModulationData([])
    setMIMOData([])
  }

  // Effects
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(animationStep, 400)
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
    if (params.analysisType === 'modulation') {
      drawModulationChart()
    } else {
      drawMIMOChart()
    }
  }, [modulationData, mimoData, params.selectedScheme])

  useEffect(() => {
    drawConstellations()
  }, [])

  const progress = currentSNR / params.maxSNR

  return (
    <div className="modulation-mimo-animation">
      <div className="animation-header">
        <h3>Interactive Modulation and MIMO Analysis</h3>
        <p>Compare modulation schemes and MIMO techniques performance</p>
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
            <label>Analysis Type:</label>
            <select 
              value={params.analysisType} 
              onChange={(e) => setParams(prev => ({...prev, analysisType: e.target.value}))}
              disabled={isPlaying}
            >
              <option value="modulation">Modulation Schemes</option>
              <option value="mimo">MIMO Techniques</option>
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
              max="30"
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
          {params.analysisType === 'modulation' && (
            <div className="param-group">
              <label>Show Scheme:</label>
              <select 
                value={params.selectedScheme} 
                onChange={(e) => setParams(prev => ({...prev, selectedScheme: e.target.value}))}
              >
                <option value="all">All Schemes</option>
                <option value="bpsk">BPSK Only</option>
                <option value="qpsk">QPSK Only</option>
                <option value="16qam">16-QAM Only</option>
                <option value="64qam">64-QAM Only</option>
              </select>
            </div>
          )}
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
          {params.analysisType === 'modulation' ? (
            <>
              <div className="chart-item">
                <h4>Modulation Schemes BER (AWGN)</h4>
                <canvas 
                  ref={modulationRef} 
                  width={500} 
                  height={350}
                  className="chart-canvas"
                />
              </div>
              <div className="chart-item">
                <h4>Constellation Diagrams</h4>
                <canvas 
                  ref={constellationRef} 
                  width={400} 
                  height={300}
                  className="chart-canvas"
                />
              </div>
            </>
          ) : (
            <div className="chart-item full-width">
              <h4>MIMO Techniques BER (Rayleigh Fading)</h4>
              <canvas 
                ref={mimoRef} 
                width={600} 
                height={400}
                className="chart-canvas"
              />
            </div>
          )}
        </div>

        {((params.analysisType === 'modulation' && modulationData.length > 0) || 
          (params.analysisType === 'mimo' && mimoData.length > 0)) && (
          <div className="statistics-panel">
            <h4>Current Performance Analysis (SNR: {currentSNR} dB)</h4>
            <div className="stats-grid">
              {params.analysisType === 'modulation' && modulationData.length > 0 && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">BPSK BER:</span>
                    <span className="stat-value">
                      {modulationData[modulationData.length - 1]?.ber_bpsk.toExponential(2)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">QPSK BER:</span>
                    <span className="stat-value">
                      {modulationData[modulationData.length - 1]?.ber_qpsk.toExponential(2)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">16-QAM BER:</span>
                    <span className="stat-value">
                      {modulationData[modulationData.length - 1]?.ber_16qam.toExponential(2)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">64-QAM BER:</span>
                    <span className="stat-value">
                      {modulationData[modulationData.length - 1]?.ber_64qam.toExponential(2)}
                    </span>
                  </div>
                </>
              )}
              {params.analysisType === 'mimo' && mimoData.length > 0 && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">SIMO BER:</span>
                    <span className="stat-value">
                      {mimoData[mimoData.length - 1]?.ber_simo.toExponential(2)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">MISO BER:</span>
                    <span className="stat-value">
                      {mimoData[mimoData.length - 1]?.ber_miso.toExponential(2)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">MIMO BER:</span>
                    <span className="stat-value">
                      {mimoData[mimoData.length - 1]?.ber_mimo.toExponential(2)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">SIMO Gain:</span>
                    <span className="stat-value">
                      {(mimoData[mimoData.length - 1]?.ber_miso / mimoData[mimoData.length - 1]?.ber_simo).toFixed(1)}×
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>Higher order modulation provides more spectral efficiency but requires higher SNR</li>
          <li>BPSK and QPSK have identical BER performance in AWGN channels</li>
          <li>SIMO systems provide significant diversity gain through MRC</li>
          <li>Alamouti STBC enables transmit diversity in MISO/MIMO systems</li>
          <li>MIMO combines benefits of both transmit and receive diversity</li>
          <li>Trade-off exists between data rate and error performance</li>
        </ul>
      </div>
    </div>
  )
}