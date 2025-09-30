'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

interface ModelParams {
  frequency: number // MHz
  txHeight: number // meters
  rxHeight: number // meters
  environment: 'urban' | 'suburban' | 'rural'
}

export default function HataTwoRayAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentDistance, setCurrentDistance] = useState(1)
  const [maxDistance, setMaxDistance] = useState(20)
  const [params, setParams] = useState<ModelParams>({
    frequency: 900,
    txHeight: 50,
    rxHeight: 1.5,
    environment: 'urban'
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const comparisonRef = useRef<HTMLCanvasElement>(null)
  const [modelData, setModelData] = useState<{distance: number, hata: number, twoRay: number, receivedPower: number}[]>([])

  // Calculate Hata-Okumura Path Loss
  const calculateHataPathLoss = (distance: number, params: ModelParams): number => {
    const { frequency, txHeight, rxHeight, environment } = params
    
    // Correction factor for mobile antenna height
    let a_hr: number
    if (frequency >= 150 && frequency <= 1000) {
      a_hr = (1.1 * Math.log10(frequency) - 0.7) * rxHeight - (1.56 * Math.log10(frequency) - 0.8)
    } else {
      a_hr = 3.2 * Math.pow(Math.log10(11.75 * rxHeight), 2) - 4.97
    }
    
    // Basic path loss
    let pathLoss = 69.55 + 26.16 * Math.log10(frequency) - 13.82 * Math.log10(txHeight) - a_hr + 
                   (44.9 - 6.55 * Math.log10(txHeight)) * Math.log10(distance)
    
    // Environment correction
    switch (environment) {
      case 'suburban':
        pathLoss -= 2 * Math.pow(Math.log10(frequency / 28), 2) + 5.4
        break
      case 'rural':
        pathLoss -= 4.78 * Math.pow(Math.log10(frequency), 2) + 18.33 * Math.log10(frequency) - 40.94
        break
      // urban is the base case
    }
    
    return pathLoss
  }

  // Calculate Two-Ray Ground Reflection Model
  const calculateTwoRayModel = (distance: number, params: ModelParams): { pathLoss: number, receivedPower: number } => {
    const { frequency, txHeight, rxHeight } = params
    const c = 3e8 // speed of light
    const lambda = c / (frequency * 1e6)
    const distanceM = distance * 1000 // convert km to meters
    
    // Received power (assuming unit antenna gains and 1W transmit power)
    const Gt = 1, Gr = 1, Pt = 1 // Watts
    const Pr = (Gt * Gr * Math.pow(txHeight * rxHeight, 2)) / Math.pow(distanceM, 4)
    
    // Path loss in dB
    const pathLoss = -10 * Math.log10(Pr / Pt)
    const receivedPowerDb = 10 * Math.log10(Pr * 1000) // in dBm
    
    return { pathLoss, receivedPower: receivedPowerDb }
  }

  // Draw model comparison
  const drawModelComparison = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    if (modelData.length === 0) return

    // Find min/max for scaling
    const distances = modelData.map(d => d.distance)
    const allPathLoss = modelData.flatMap(d => [d.hata, d.twoRay])
    const minDistance = Math.min(...distances)
    const maxDistanceData = Math.max(...distances)
    const minPathLoss = Math.min(...allPathLoss) - 10
    const maxPathLoss = Math.max(...allPathLoss) + 10

    // Helper function to convert to canvas coordinates
    const toCanvasX = (distance: number) => ((distance - minDistance) / (maxDistanceData - minDistance)) * (width - 80) + 40
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

    // Draw Hata-Okumura Model
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 3
    ctx.beginPath()
    modelData.forEach((point, i) => {
      const x = toCanvasX(point.distance)
      const y = toCanvasY(point.hata)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw Two-Ray Model
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 3
    ctx.beginPath()
    modelData.forEach((point, i) => {
      const x = toCanvasX(point.distance)
      const y = toCanvasY(point.twoRay)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

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
    ctx.font = '14px Arial'
    ctx.fillText(`Path Loss Models Comparison (${params.environment})`, 10, 20)
    
    // Legend
    const legendY = 50
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(width - 180, legendY)
    ctx.lineTo(width - 150, legendY)
    ctx.stroke()
    ctx.fillText('Hata-Okumura', width - 145, legendY + 5)

    ctx.strokeStyle = 'red'
    ctx.beginPath()
    ctx.moveTo(width - 180, legendY + 25)
    ctx.lineTo(width - 150, legendY + 25)
    ctx.stroke()
    ctx.fillText('Two-Ray Ground', width - 145, legendY + 30)

    // Axes labels
    ctx.fillText('Distance (km)', width / 2 - 30, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Path Loss (dB)', -40, 0)
    ctx.restore()

    // Add validity ranges
    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)'
    ctx.fillRect(40, 40, (toCanvasX(20) - 40), height - 80)
    ctx.fillStyle = 'white'
    ctx.font = '10px Arial'
    ctx.fillText('Hata Valid Range: 1-20km', 45, height - 50)
  }

  // Draw received power comparison
  const drawReceivedPowerComparison = () => {
    const canvas = comparisonRef.current
    if (!canvas || modelData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    // Calculate received power for both models (assuming 1W transmit power)
    const distances = modelData.map(d => d.distance)
    const hataReceivedPower = modelData.map(d => 30 - d.hata) // 30 dBm = 1W
    const twoRayReceivedPower = modelData.map(d => d.receivedPower)

    const minDistance = Math.min(...distances)
    const maxDistanceData = Math.max(...distances)
    const allPowers = [...hataReceivedPower, ...twoRayReceivedPower]
    const minPower = Math.min(...allPowers) - 10
    const maxPower = Math.max(...allPowers) + 10

    // Helper functions
    const toCanvasX = (distance: number) => ((distance - minDistance) / (maxDistanceData - minDistance)) * (width - 80) + 40
    const toCanvasY = (power: number) => height - 40 - ((power - minPower) / (maxPower - minPower)) * (height - 80)

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

    // Draw Hata received power
    ctx.strokeStyle = 'cyan'
    ctx.lineWidth = 2
    ctx.beginPath()
    hataReceivedPower.forEach((power, i) => {
      const x = toCanvasX(distances[i])
      const y = toCanvasY(power)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw Two-Ray received power
    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 2
    ctx.beginPath()
    twoRayReceivedPower.forEach((power, i) => {
      const x = toCanvasX(distances[i])
      const y = toCanvasY(power)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Received Power Comparison', 10, 20)
    
    // Legend
    ctx.strokeStyle = 'cyan'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(10, 35)
    ctx.lineTo(30, 35)
    ctx.stroke()
    ctx.fillText('Hata Model', 35, 40)

    ctx.strokeStyle = 'orange'
    ctx.beginPath()
    ctx.moveTo(10, 50)
    ctx.lineTo(30, 50)
    ctx.stroke()
    ctx.fillText('Two-Ray Model', 35, 55)

    // Axes labels
    ctx.fillText('Distance (km)', width / 2 - 30, height - 10)
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Received Power (dBm)', -50, 0)
    ctx.restore()
  }

  // Animation step
  const animationStep = () => {
    setCurrentDistance(prevDistance => {
      if (prevDistance >= maxDistance) {
        setIsPlaying(false)
        return prevDistance
      }

      const newDistance = prevDistance + 0.5
      
      // Calculate model values
      const hata = calculateHataPathLoss(newDistance, params)
      const twoRayResult = calculateTwoRayModel(newDistance, params)

      setModelData(prevData => [...prevData, {
        distance: newDistance,
        hata,
        twoRay: twoRayResult.pathLoss,
        receivedPower: twoRayResult.receivedPower
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
    setCurrentDistance(1)
    setModelData([])
  }

  // Effects
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(animationStep, 150)
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
    drawModelComparison()
  }, [modelData, currentDistance, params])

  useEffect(() => {
    drawReceivedPowerComparison()
  }, [modelData, params])

  // Initialize with some data
  useEffect(() => {
    const initialData = []
    for (let d = 1; d <= 3; d += 0.5) {
      const hata = calculateHataPathLoss(d, params)
      const twoRayResult = calculateTwoRayModel(d, params)
      
      initialData.push({ 
        distance: d, 
        hata, 
        twoRay: twoRayResult.pathLoss,
        receivedPower: twoRayResult.receivedPower
      })
    }
    setModelData(initialData)
    setCurrentDistance(3)
  }, [])

  const progress = currentDistance / maxDistance

  return (
    <div className="hata-tworay-animation">
      <div className="animation-header">
        <h3>Interactive Hata-Okumura and Two-Ray Models Animation</h3>
        <p>Compare empirical and theoretical propagation models for different environments</p>
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
              min="150"
              max="1500"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Tx Height (m):</label>
            <input 
              type="number" 
              value={params.txHeight} 
              onChange={(e) => setParams(prev => ({...prev, txHeight: Number(e.target.value)}))}
              step="10"
              min="30"
              max="200"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Rx Height (m):</label>
            <input 
              type="number" 
              value={params.rxHeight} 
              onChange={(e) => setParams(prev => ({...prev, rxHeight: Number(e.target.value)}))}
              step="0.5"
              min="1"
              max="10"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Environment:</label>
            <select 
              value={params.environment} 
              onChange={(e) => setParams(prev => ({...prev, environment: e.target.value as 'urban' | 'suburban' | 'rural'}))}
              disabled={isPlaying}
            >
              <option value="urban">Urban</option>
              <option value="suburban">Suburban</option>
              <option value="rural">Rural</option>
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
          Distance: {currentDistance.toFixed(1)}km / {maxDistance}km ({(progress * 100).toFixed(1)}%)
        </span>
      </div>

      <div className="animation-content">
        <div className="charts-container">
          <div className="chart-item">
            <canvas 
              ref={canvasRef} 
              width={500} 
              height={350}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <canvas 
              ref={comparisonRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
        </div>

        {modelData.length > 0 && (
          <div className="statistics-panel">
            <h4>Current Analysis (Distance: {currentDistance.toFixed(1)}km)</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Hata Path Loss:</span>
                <span className="stat-value">
                  {modelData[modelData.length - 1]?.hata.toFixed(2)} dB
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Two-Ray Path Loss:</span>
                <span className="stat-value">
                  {modelData[modelData.length - 1]?.twoRay.toFixed(2)} dB
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Model Difference:</span>
                <span className="stat-value">
                  {(modelData[modelData.length - 1]?.hata - modelData[modelData.length - 1]?.twoRay).toFixed(2)} dB
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Two-Ray Rx Power:</span>
                <span className="stat-value">
                  {modelData[modelData.length - 1]?.receivedPower.toFixed(2)} dBm
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Environment:</span>
                <span className="stat-value">{params.environment}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Frequency:</span>
                <span className="stat-value">{params.frequency} MHz</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>Hata-Okumura is empirical model based on measurements in Tokyo</li>
          <li>Two-Ray model is theoretical, considering direct and reflected paths</li>
          <li>Environment significantly affects propagation characteristics</li>
          <li>Antenna heights have different impacts in each model</li>
          <li>Models have specific validity ranges for accurate predictions</li>
          <li>Critical for cellular network planning and coverage estimation</li>
        </ul>
      </div>
    </div>
  )
}