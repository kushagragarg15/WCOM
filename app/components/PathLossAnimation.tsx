'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface PathLossParams {
  frequency: number // MHz
  txHeight: number // meters
  rxHeight: number // meters
  pathLossExponent: number
  shadowingStd: number // dB
  referenceDistance: number // meters
}

export default function PathLossAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentDistance, setCurrentDistance] = useState(100)
  const [maxDistance, setMaxDistance] = useState(10000)
  const [params, setParams] = useState<PathLossParams>({
    frequency: 900,
    txHeight: 50,
    rxHeight: 1.5,
    pathLossExponent: 2.0,
    shadowingStd: 8.0,
    referenceDistance: 100
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shadowingRef = useRef<HTMLCanvasElement>(null)
  const [pathLossData, setPathLossData] = useState<{distance: number, freeSpace: number, logDistance: number, withShadowing: number}[]>([])

  // Calculate Free Space Path Loss
  const calculateFreeSpacePathLoss = (distance: number, frequency: number): number => {
    // FSPL = 20*log10(d) + 20*log10(f) + 32.45 (d in km, f in MHz)
    const distanceKm = distance / 1000
    return 20 * Math.log10(distanceKm) + 20 * Math.log10(frequency) + 32.45
  }

  // Calculate Log-Distance Path Loss
  const calculateLogDistancePathLoss = (distance: number, params: PathLossParams): number => {
    const fspl0 = calculateFreeSpacePathLoss(params.referenceDistance, params.frequency)
    return fspl0 + 10 * params.pathLossExponent * Math.log10(distance / params.referenceDistance)
  }

  // Generate log-normal shadowing
  const generateShadowing = (std: number): number => {
    // Box-Muller transform for Gaussian random number
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return z0 * std
  }

  // Draw path loss curves
  const drawPathLoss = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    if (pathLossData.length === 0) return

    // Find min/max for scaling
    const distances = pathLossData.map(d => d.distance)
    const allPathLoss = pathLossData.flatMap(d => [d.freeSpace, d.logDistance, d.withShadowing])
    const minDistance = Math.min(...distances)
    const maxDistanceData = Math.max(...distances)
    const minPathLoss = Math.min(...allPathLoss) - 10
    const maxPathLoss = Math.max(...allPathLoss) + 10

    // Helper function to convert to canvas coordinates
    const toCanvasX = (distance: number) => ((Math.log10(distance) - Math.log10(minDistance)) / (Math.log10(maxDistanceData) - Math.log10(minDistance))) * (width - 80) + 40
    const toCanvasY = (pathLoss: number) => height - 40 - ((pathLoss - minPathLoss) / (maxPathLoss - minPathLoss)) * (height - 80)

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

    // Draw Free Space Path Loss
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 2
    ctx.beginPath()
    pathLossData.forEach((point, i) => {
      const x = toCanvasX(point.distance)
      const y = toCanvasY(point.freeSpace)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw Log-Distance Path Loss
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 2
    ctx.beginPath()
    pathLossData.forEach((point, i) => {
      const x = toCanvasX(point.distance)
      const y = toCanvasY(point.logDistance)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw Path Loss with Shadowing
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    pathLossData.forEach((point, i) => {
      const x = toCanvasX(point.distance)
      const y = toCanvasY(point.withShadowing)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    // Current distance marker
    if (currentDistance <= maxDistanceData) {
      const currentX = toCanvasX(currentDistance)
      ctx.strokeStyle = 'yellow'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(currentX, 40)
      ctx.lineTo(currentX, height - 40)
      ctx.stroke()
    }

    // Labels and legend
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Path Loss vs Distance', 10, 20)
    
    // Legend
    const legendY = 40
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(width - 150, legendY)
    ctx.lineTo(width - 130, legendY)
    ctx.stroke()
    ctx.fillText('Free Space', width - 125, legendY + 5)

    ctx.strokeStyle = 'green'
    ctx.beginPath()
    ctx.moveTo(width - 150, legendY + 20)
    ctx.lineTo(width - 130, legendY + 20)
    ctx.stroke()
    ctx.fillText('Log-Distance', width - 125, legendY + 25)

    ctx.strokeStyle = 'red'
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(width - 150, legendY + 40)
    ctx.lineTo(width - 130, legendY + 40)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillText('With Shadowing', width - 125, legendY + 45)

    // Axes labels
    ctx.fillText('Distance (m)', width / 2 - 30, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Path Loss (dB)', -40, 0)
    ctx.restore()
  }

  // Draw shadowing distribution
  const drawShadowingDistribution = () => {
    const canvas = shadowingRef.current
    if (!canvas || pathLossData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Get shadowing values (difference between with/without shadowing)
    const shadowingValues = pathLossData.map(d => d.withShadowing - d.logDistance)
    
    if (shadowingValues.length === 0) return

    // Create histogram
    const numBins = 20
    const minVal = Math.min(...shadowingValues)
    const maxVal = Math.max(...shadowingValues)
    const binWidth = (maxVal - minVal) / numBins
    const bins = new Array(numBins).fill(0)

    shadowingValues.forEach(val => {
      const binIndex = Math.floor((val - minVal) / binWidth)
      if (binIndex >= 0 && binIndex < numBins) {
        bins[binIndex]++
      }
    })

    // Draw histogram
    const maxCount = Math.max(...bins)
    const barWidth = (width - 80) / numBins
    
    ctx.fillStyle = 'rgba(255, 165, 0, 0.7)'
    ctx.strokeStyle = 'rgba(255, 140, 0, 0.9)'
    ctx.lineWidth = 1

    bins.forEach((count, i) => {
      const barHeight = (count / maxCount) * (height - 80)
      const x = 40 + i * barWidth
      const y = height - 40 - barHeight
      
      ctx.fillRect(x, y, barWidth - 1, barHeight)
      ctx.strokeRect(x, y, barWidth - 1, barHeight)
    })

    // Draw theoretical Gaussian curve
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    for (let i = 0; i <= width - 80; i++) {
      const x = minVal + (i / (width - 80)) * (maxVal - minVal)
      const gaussianValue = (1 / (params.shadowingStd * Math.sqrt(2 * Math.PI))) * 
                           Math.exp(-0.5 * Math.pow(x / params.shadowingStd, 2))
      const normalizedValue = (gaussianValue / (1 / (params.shadowingStd * Math.sqrt(2 * Math.PI)))) * maxCount
      const y = height - 40 - (normalizedValue / maxCount) * (height - 80)
      
      if (i === 0) ctx.moveTo(40 + i, y)
      else ctx.lineTo(40 + i, y)
    }
    ctx.stroke()

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Shadowing Distribution', 10, 20)
    ctx.fillText('Empirical', 10, 40)
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(10, 50)
    ctx.lineTo(30, 50)
    ctx.stroke()
    ctx.fillText('Theoretical', 35, 55)
  }

  // Animation step
  const animationStep = () => {
    setCurrentDistance(prevDistance => {
      if (prevDistance >= maxDistance) {
        setIsPlaying(false)
        return prevDistance
      }

      const newDistance = prevDistance + 100
      
      // Calculate path loss values
      const freeSpace = calculateFreeSpacePathLoss(newDistance, params.frequency)
      const logDistance = calculateLogDistancePathLoss(newDistance, params)
      const shadowing = generateShadowing(params.shadowingStd)
      const withShadowing = logDistance + shadowing

      setPathLossData(prevData => [...prevData, {
        distance: newDistance,
        freeSpace,
        logDistance,
        withShadowing
      }])

      return newDistance
    })
  }

  // Control functions
  const startAnimation = () => {
    if (currentDistance >= maxDistance) return
    setIsPlaying(true)
  }

  const pauseAnimation = () => {
    setIsPlaying(false)
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentDistance(100)
    setPathLossData([])
  }

  // Effects
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(animationStep, 200)
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
  }, [isPlaying, currentDistance, maxDistance, params])

  useEffect(() => {
    drawPathLoss()
  }, [pathLossData, currentDistance])

  useEffect(() => {
    drawShadowingDistribution()
  }, [pathLossData, params.shadowingStd])

  // Initialize with some data
  useEffect(() => {
    const initialData = []
    for (let d = 100; d <= 500; d += 100) {
      const freeSpace = calculateFreeSpacePathLoss(d, params.frequency)
      const logDistance = calculateLogDistancePathLoss(d, params)
      const shadowing = generateShadowing(params.shadowingStd)
      const withShadowing = logDistance + shadowing
      
      initialData.push({ distance: d, freeSpace, logDistance, withShadowing })
    }
    setPathLossData(initialData)
    setCurrentDistance(500)
  }, [])

  const progress = currentDistance / maxDistance

  return (
    <div className="path-loss-animation">
      <div className="animation-header">
        <h3>Interactive Path Loss and Shadowing Animation</h3>
        <p>Explore how signal strength decreases with distance and the impact of shadowing effects</p>
      </div>

      <div className="animation-controls">
        <div className="control-buttons">
          <button 
            onClick={isPlaying ? pauseAnimation : startAnimation}
            className="control-btn primary"
            disabled={currentDistance >= maxDistance}
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
            <label>Frequency (MHz):</label>
            <input 
              type="number" 
              value={params.frequency} 
              onChange={(e) => setParams(prev => ({...prev, frequency: Number(e.target.value)}))}
              step="100"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Path Loss Exp (n):</label>
            <input 
              type="number" 
              value={params.pathLossExponent} 
              onChange={(e) => setParams(prev => ({...prev, pathLossExponent: Number(e.target.value)}))}
              step="0.1"
              min="1.5"
              max="6"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Shadowing σ (dB):</label>
            <input 
              type="number" 
              value={params.shadowingStd} 
              onChange={(e) => setParams(prev => ({...prev, shadowingStd: Number(e.target.value)}))}
              step="1"
              min="1"
              max="15"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Max Distance (m):</label>
            <input 
              type="number" 
              value={maxDistance} 
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              step="1000"
              min="1000"
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
          Distance: {currentDistance}m / {maxDistance}m ({(progress * 100).toFixed(1)}%)
        </span>
      </div>

      <div className="animation-content">
        <div className="charts-container">
          <div className="chart-item">
            <h4>Path Loss vs Distance</h4>
            <canvas 
              ref={canvasRef} 
              width={500} 
              height={350}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <h4>Shadowing Distribution</h4>
            <canvas 
              ref={shadowingRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
        </div>

        {pathLossData.length > 0 && (
          <div className="statistics-panel">
            <h4>Current Path Loss Analysis (Distance: {currentDistance}m)</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Free Space Path Loss:</span>
                <span className="stat-value">
                  {pathLossData[pathLossData.length - 1]?.freeSpace.toFixed(2)} dB
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Log-Distance Path Loss:</span>
                <span className="stat-value">
                  {pathLossData[pathLossData.length - 1]?.logDistance.toFixed(2)} dB
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">With Shadowing:</span>
                <span className="stat-value">
                  {pathLossData[pathLossData.length - 1]?.withShadowing.toFixed(2)} dB
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Shadowing Effect:</span>
                <span className="stat-value">
                  {(pathLossData[pathLossData.length - 1]?.withShadowing - pathLossData[pathLossData.length - 1]?.logDistance).toFixed(2)} dB
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Frequency:</span>
                <span className="stat-value">{params.frequency} MHz</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Path Loss Exponent:</span>
                <span className="stat-value">{params.pathLossExponent}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>Free space path loss increases with distance and frequency</li>
          <li>Path loss exponent depends on environment (urban: 3-5, rural: 2-3)</li>
          <li>Shadowing adds random variation due to obstacles</li>
          <li>Log-normal shadowing follows Gaussian distribution in dB scale</li>
          <li>Critical for cellular network coverage planning</li>
        </ul>
      </div>
    </div>
  )
}