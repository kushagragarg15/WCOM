'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface MIMOParams {
  maxSNR: number
  numRealizations: number
  showBER: boolean
  selectedConfig: string
}

interface CapacityData {
  snr: number
  siso: number
  simo: number
  miso: number
  mimo: number
}

interface BERData {
  snr: number
  ber: number
}

export default function MIMOAnalysisAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSNR, setCurrentSNR] = useState(0)
  const [params, setParams] = useState<MIMOParams>({
    maxSNR: 40,
    numRealizations: 100,
    showBER: false,
    selectedConfig: 'all'
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const capacityRef = useRef<HTMLCanvasElement>(null)
  const berRef = useRef<HTMLCanvasElement>(null)
  const configRef = useRef<HTMLCanvasElement>(null)
  
  const [capacityData, setCapacityData] = useState<CapacityData[]>([])
  const [berData, setBERData] = useState<BERData[]>([])

  // Generate complex Gaussian random variable
  const complexGaussian = (rows: number, cols: number): number[][] => {
    const real = Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => Math.random() * 2 - 1)
    )
    const imag = Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => Math.random() * 2 - 1)
    )
    
    // Normalize to have unit variance
    return real.map((row, i) => 
      row.map((val, j) => Math.sqrt(val * val + imag[i][j] * imag[i][j]) / Math.sqrt(2))
    )
  }

  // Calculate matrix norm squared
  const matrixNormSquared = (matrix: number[][]): number => {
    return matrix.reduce((sum, row) => 
      sum + row.reduce((rowSum, val) => rowSum + val * val, 0), 0
    )
  }

  // Calculate MIMO capacity using determinant approximation
  const calculateMIMOCapacity = (snrLinear: number, nt: number, nr: number, realizations: number): number => {
    let totalCapacity = 0
    
    for (let k = 0; k < realizations; k++) {
      const H = complexGaussian(nr, nt)
      
      if (nt === 1 && nr === 1) {
        // SISO
        totalCapacity += Math.log2(1 + snrLinear * matrixNormSquared(H))
      } else if (nt === 1 || nr === 1) {
        // SIMO or MISO
        totalCapacity += Math.log2(1 + snrLinear * matrixNormSquared(H))
      } else {
        // MIMO - simplified calculation
        const normSquared = matrixNormSquared(H)
        // Approximation for 2x2 MIMO capacity
        totalCapacity += Math.log2(1 + (snrLinear / nt) * normSquared * 1.5)
      }
    }
    
    return totalCapacity / realizations
  }

  // Calculate BER for BPSK in Rayleigh fading
  const calculateBER = (snrLinear: number, numBits: number = 10000): number => {
    let errors = 0
    
    for (let i = 0; i < numBits; i++) {
      // Generate random bit and BPSK symbol
      const bit = Math.random() > 0.5 ? 1 : 0
      const symbol = bit === 1 ? 1 : -1
      
      // Rayleigh fading channel
      const h_real = (Math.random() - 0.5) * 2
      const h_imag = (Math.random() - 0.5) * 2
      const h_magnitude = Math.sqrt(h_real * h_real + h_imag * h_imag) / Math.sqrt(2)
      
      // AWGN noise
      const noise = (Math.random() - 0.5) * 2 * Math.sqrt(1 / snrLinear)
      
      // Received signal
      const received = h_magnitude * symbol + noise
      
      // Equalization and detection
      const equalized = received / h_magnitude
      const detected_bit = equalized > 0 ? 1 : 0
      
      if (detected_bit !== bit) {
        errors++
      }
    }
    
    return errors / numBits
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
      
      // Calculate capacities for all configurations
      const siso = calculateMIMOCapacity(snrLinear, 1, 1, params.numRealizations)
      const simo = calculateMIMOCapacity(snrLinear, 1, 2, params.numRealizations)
      const miso = calculateMIMOCapacity(snrLinear, 2, 1, params.numRealizations)
      const mimo = calculateMIMOCapacity(snrLinear, 2, 2, params.numRealizations)
      
      setCapacityData(prevData => [...prevData, {
        snr: newSNR,
        siso,
        simo,
        miso,
        mimo
      }])

      // Calculate BER if enabled
      if (params.showBER) {
        const ber = calculateBER(snrLinear)
        setBERData(prevData => [...prevData, {
          snr: newSNR,
          ber
        }])
      }

      return newSNR
    })
  }

  // Draw capacity chart
  const drawCapacityChart = () => {
    const canvas = capacityRef.current
    if (!canvas || capacityData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Find min/max for scaling
    const snrValues = capacityData.map(d => d.snr)
    const allCapacities = capacityData.flatMap(d => [d.siso, d.simo, d.miso, d.mimo])
    const minSNR = Math.min(...snrValues)
    const maxSNR = Math.max(...snrValues)
    const minCapacity = 0
    const maxCapacity = Math.max(...allCapacities) * 1.1

    // Helper functions
    const toCanvasX = (snr: number) => ((snr - minSNR) / (maxSNR - minSNR)) * (width - 80) + 40
    const toCanvasY = (capacity: number) => height - 40 - ((capacity - minCapacity) / (maxCapacity - minCapacity)) * (height - 80)

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

    // Draw capacity curves
    const configs = [
      { data: 'siso', color: 'red', label: 'SISO (1×1)' },
      { data: 'simo', color: 'blue', label: 'SIMO (1×2)' },
      { data: 'miso', color: 'green', label: 'MISO (2×1)' },
      { data: 'mimo', color: 'orange', label: 'MIMO (2×2)' }
    ]

    configs.forEach(config => {
      if (params.selectedConfig === 'all' || params.selectedConfig === config.data) {
        ctx.strokeStyle = config.color
        ctx.lineWidth = 2
        ctx.beginPath()
        
        capacityData.forEach((point, i) => {
          const x = toCanvasX(point.snr)
          const y = toCanvasY(point[config.data as keyof CapacityData] as number)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // Draw points
        ctx.fillStyle = config.color
        capacityData.forEach(point => {
          const x = toCanvasX(point.snr)
          const y = toCanvasY(point[config.data as keyof CapacityData] as number)
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
    ctx.fillText('Capacity (bits/sec/Hz)', -60, 0)
    ctx.restore()

    // Legend
    let legendY = 50
    configs.forEach(config => {
      if (params.selectedConfig === 'all' || params.selectedConfig === config.data) {
        ctx.strokeStyle = config.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(width - 150, legendY)
        ctx.lineTo(width - 130, legendY)
        ctx.stroke()
        ctx.fillStyle = 'white'
        ctx.fillText(config.label, width - 125, legendY + 4)
        legendY += 20
      }
    })
  }

  // Draw BER chart
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
    const berValues = berData.map(d => d.ber)
    const minSNR = Math.min(...snrValues)
    const maxSNR = Math.max(...snrValues)
    const minBER = Math.min(...berValues)
    const maxBER = Math.max(...berValues)

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

    // Draw BER curve
    ctx.strokeStyle = 'cyan'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    berData.forEach((point, i) => {
      const x = toCanvasX(point.snr)
      const y = toCanvasY(point.ber)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw points
    ctx.fillStyle = 'cyan'
    berData.forEach(point => {
      const x = toCanvasX(point.snr)
      const y = toCanvasY(point.ber)
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('SNR (dB)', width / 2 - 30, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('BER (log scale)', -40, 0)
    ctx.restore()
    ctx.fillText('BPSK BER in Rayleigh Fading', 10, 20)
  }

  // Draw MIMO configuration diagram
  const drawConfigDiagram = () => {
    const canvas = configRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Draw different MIMO configurations
    const configs = [
      { name: 'SISO (1×1)', tx: 1, rx: 1, x: 100, y: 80 },
      { name: 'SIMO (1×2)', tx: 1, rx: 2, x: 300, y: 80 },
      { name: 'MISO (2×1)', tx: 2, rx: 1, x: 100, y: 200 },
      { name: 'MIMO (2×2)', tx: 2, rx: 2, x: 300, y: 200 }
    ]

    configs.forEach(config => {
      const isSelected = params.selectedConfig === config.name.toLowerCase().split(' ')[0] || params.selectedConfig === 'all'
      
      // Draw transmitter antennas
      ctx.fillStyle = isSelected ? 'orange' : 'gray'
      for (let i = 0; i < config.tx; i++) {
        ctx.fillRect(config.x - 40, config.y - 10 + i * 20, 15, 8)
        ctx.fillStyle = 'white'
        ctx.font = '10px Arial'
        ctx.fillText('Tx', config.x - 35, config.y - 5 + i * 20)
        ctx.fillStyle = isSelected ? 'orange' : 'gray'
      }

      // Draw receiver antennas
      ctx.fillStyle = isSelected ? 'lightblue' : 'gray'
      for (let i = 0; i < config.rx; i++) {
        ctx.fillRect(config.x + 40, config.y - 10 + i * 20, 15, 8)
        ctx.fillStyle = 'white'
        ctx.font = '10px Arial'
        ctx.fillText('Rx', config.x + 45, config.y - 5 + i * 20)
        ctx.fillStyle = isSelected ? 'lightblue' : 'gray'
      }

      // Draw signal paths
      ctx.strokeStyle = isSelected ? 'yellow' : 'darkgray'
      ctx.lineWidth = 1
      for (let i = 0; i < config.tx; i++) {
        for (let j = 0; j < config.rx; j++) {
          ctx.beginPath()
          ctx.moveTo(config.x - 25, config.y - 6 + i * 20)
          ctx.lineTo(config.x + 40, config.y - 6 + j * 20)
          ctx.stroke()
        }
      }

      // Label
      ctx.fillStyle = isSelected ? 'white' : 'gray'
      ctx.font = '12px Arial'
      ctx.fillText(config.name, config.x - 30, config.y + 40)
    })
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
    setCapacityData([])
    setBERData([])
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
  }, [isPlaying, currentSNR, params])

  useEffect(() => {
    drawCapacityChart()
  }, [capacityData, currentSNR, params.selectedConfig])

  useEffect(() => {
    drawBERChart()
  }, [berData])

  useEffect(() => {
    drawConfigDiagram()
  }, [params.selectedConfig])

  const progress = currentSNR / params.maxSNR

  return (
    <div className="mimo-analysis-animation">
      <div className="animation-header">
        <h3>Interactive MIMO Systems Analysis</h3>
        <p>Explore channel capacity and BER performance for different MIMO configurations</p>
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
            <label>Max SNR (dB):</label>
            <input 
              type="number" 
              value={params.maxSNR} 
              onChange={(e) => setParams(prev => ({...prev, maxSNR: Number(e.target.value)}))}
              step="5"
              min="20"
              max="50"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Realizations:</label>
            <input 
              type="number" 
              value={params.numRealizations} 
              onChange={(e) => setParams(prev => ({...prev, numRealizations: Number(e.target.value)}))}
              step="50"
              min="50"
              max="500"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Configuration:</label>
            <select 
              value={params.selectedConfig} 
              onChange={(e) => setParams(prev => ({...prev, selectedConfig: e.target.value}))}
              disabled={isPlaying}
            >
              <option value="all">All Configs</option>
              <option value="siso">SISO Only</option>
              <option value="simo">SIMO Only</option>
              <option value="miso">MISO Only</option>
              <option value="mimo">MIMO Only</option>
            </select>
          </div>
          <div className="param-group">
            <label>Show BER:</label>
            <input 
              type="checkbox" 
              checked={params.showBER} 
              onChange={(e) => setParams(prev => ({...prev, showBER: e.target.checked}))}
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
          SNR: {currentSNR} dB / {params.maxSNR} dB ({(progress * 100).toFixed(1)}%)
        </span>
      </div>

      <div className="animation-content">
        <div className="charts-container">
          <div className="chart-item">
            <h4>Channel Capacity vs SNR</h4>
            <canvas 
              ref={capacityRef} 
              width={500} 
              height={350}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <h4>MIMO Configuration Diagram</h4>
            <canvas 
              ref={configRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
          {params.showBER && (
            <div className="chart-item full-width">
              <h4>BER vs SNR (BPSK in Rayleigh Fading)</h4>
              <canvas 
                ref={berRef} 
                width={600} 
                height={250}
                className="chart-canvas"
              />
            </div>
          )}
        </div>

        {capacityData.length > 0 && (
          <div className="statistics-panel">
            <h4>Current Analysis (SNR: {currentSNR} dB)</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">SISO Capacity:</span>
                <span className="stat-value">
                  {capacityData[capacityData.length - 1]?.siso.toFixed(3)} bits/sec/Hz
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">SIMO Capacity:</span>
                <span className="stat-value">
                  {capacityData[capacityData.length - 1]?.simo.toFixed(3)} bits/sec/Hz
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">MISO Capacity:</span>
                <span className="stat-value">
                  {capacityData[capacityData.length - 1]?.miso.toFixed(3)} bits/sec/Hz
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">MIMO Capacity:</span>
                <span className="stat-value">
                  {capacityData[capacityData.length - 1]?.mimo.toFixed(3)} bits/sec/Hz
                </span>
              </div>
              {params.showBER && berData.length > 0 && (
                <div className="stat-item">
                  <span className="stat-label">SISO BER:</span>
                  <span className="stat-value">
                    {berData[berData.length - 1]?.ber.toExponential(2)}
                  </span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-label">MIMO Gain:</span>
                <span className="stat-value">
                  {(capacityData[capacityData.length - 1]?.mimo / capacityData[capacityData.length - 1]?.siso).toFixed(2)}×
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>MIMO systems provide significant capacity gains over SISO</li>
          <li>Multiple antennas enable spatial diversity and multiplexing</li>
          <li>Channel capacity increases logarithmically with SNR</li>
          <li>SIMO and MISO provide similar diversity gains</li>
          <li>BER decreases exponentially with increasing SNR</li>
          <li>Rayleigh fading degrades performance compared to AWGN channels</li>
        </ul>
      </div>
    </div>
  )
}