'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

interface User {
  id: number
  x: number
  y: number
  distance: number
  pathLoss: number
  receivedPower: number
  snr: number
  rateNoFading: number
  rateH4Fading: number
  velocity: number
  coherenceTime: number
}

interface NetworkParams {
  numUsers: number
  cellRadius: number
  frequency: number // GHz
  txPower: number // dBm
  pathLossExp: number
  shadowingStd: number
}

export default function CellularNetworkAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentUser, setCurrentUser] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [params, setParams] = useState<NetworkParams>({
    numUsers: 10,
    cellRadius: 1000,
    frequency: 20,
    txPower: 46,
    pathLossExp: 3.5,
    shadowingStd: 8
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const cellularRef = useRef<HTMLCanvasElement>(null)
  const rateRef = useRef<HTMLCanvasElement>(null)
  const velocityRef = useRef<HTMLCanvasElement>(null)

  // Generate H4 cascaded fading
  const generateH4Fading = (): number => {
    // Generate 4 independent Rayleigh fading coefficients
    // Each coefficient has real and imaginary parts (Gaussian distributed)
    const generateRayleighMagnitude = () => {
      const real = (Math.random() - 0.5) * 2 // Gaussian approximation
      const imag = (Math.random() - 0.5) * 2 // Gaussian approximation
      return Math.sqrt(real * real + imag * imag) / Math.sqrt(2)
    }
    
    // Generate magnitudes of 4 Rayleigh fading coefficients
    const magnitude1 = generateRayleighMagnitude()
    const magnitude2 = generateRayleighMagnitude()
    const magnitude3 = generateRayleighMagnitude()
    const magnitude4 = generateRayleighMagnitude()
    
    // Return |h1*h2*h3*h4|^2 for H4 cascaded fading
    return Math.pow(magnitude1 * magnitude2 * magnitude3 * magnitude4, 2)
  }

  // Generate users with cellular network calculations
  const generateUsers = (): User[] => {
    const newUsers: User[] = []
    const c = 3e8 // speed of light
    const lambda = c / (params.frequency * 1e9)
    const k = 1.38e-23 // Boltzmann constant
    const T0 = 240 // Noise temperature
    const BW = 10e6 // Bandwidth
    const d0 = 1 // Reference distance
    
    // Calculate reference path loss
    const PL_d0 = 20 * Math.log10(4 * Math.PI * d0 / lambda)
    
    // Noise power
    const noiseW = k * T0 * BW
    const noisedBm = 10 * Math.log10(noiseW) + 30
    
    for (let i = 0; i < params.numUsers; i++) {
      // Random position within cell
      const theta = 2 * Math.PI * Math.random()
      const r = params.cellRadius * Math.sqrt(Math.random())
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)
      const distance = Math.max(r, d0)
      
      // Path loss calculation
      const pathLossLogDist = PL_d0 + 10 * params.pathLossExp * Math.log10(distance / d0)
      const shadowing = params.shadowingStd * (Math.random() - 0.5) * 2 * 1.5 // Approximate Gaussian
      const totalPathLoss = pathLossLogDist + shadowing
      
      // Received power (assuming unit antenna gains)
      const receivedPower = params.txPower - totalPathLoss
      
      // SNR and rate without fading
      const snr = receivedPower - noisedBm
      const snrLinear = Math.pow(10, snr / 10)
      const rateNoFading = BW * Math.log2(1 + snrLinear) / 1e6 // Mbps
      
      // H4 fading effect
      const h4Magnitude = generateH4Fading()
      const receivedPowerFading = receivedPower + 10 * Math.log10(h4Magnitude)
      const snrFading = receivedPowerFading - noisedBm
      const snrFadingLinear = Math.pow(10, snrFading / 10)
      const rateH4Fading = BW * Math.log2(1 + Math.max(0.01, snrFadingLinear)) / 1e6 // Mbps
      
      // Velocity and coherence time
      const velocity = 1 + 24 * Math.random() // 1-25 m/s
      const fd = velocity / lambda
      const coherenceTime = 0.423 / fd
      
      newUsers.push({
        id: i + 1,
        x,
        y,
        distance,
        pathLoss: totalPathLoss,
        receivedPower,
        snr,
        rateNoFading,
        rateH4Fading,
        velocity,
        coherenceTime
      })
    }
    
    return newUsers
  }

  // Draw cellular scenario
  const drawCellularScenario = () => {
    const canvas = cellularRef.current
    if (!canvas || users.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const scale = Math.min(width, height) / (2 * params.cellRadius * 1.2)
    
    ctx.clearRect(0, 0, width, height)

    // Draw coverage area
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 5])
    ctx.beginPath()
    ctx.arc(centerX, centerY, params.cellRadius * scale, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw base station
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI)
    ctx.fill()
    
    // Base station label
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Base Station', centerX + 15, centerY - 10)

    // Draw users
    users.forEach((user, index) => {
      const userX = centerX + user.x * scale
      const userY = centerY - user.y * scale // Flip Y for canvas coordinates
      
      // User color based on rate
      const maxRate = Math.max(...users.map(u => u.rateNoFading))
      const rateRatio = user.rateNoFading / maxRate
      const blue = Math.floor(255 * (1 - rateRatio))
      const green = Math.floor(255 * rateRatio)
      
      // Highlight current user
      if (index === currentUser) {
        ctx.strokeStyle = 'yellow'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(userX, userY, 12, 0, 2 * Math.PI)
        ctx.stroke()
      }
      
      // Draw user
      ctx.fillStyle = `rgb(${blue}, ${green}, 100)`
      ctx.beginPath()
      ctx.arc(userX, userY, 6, 0, 2 * Math.PI)
      ctx.fill()
      
      // User label
      ctx.fillStyle = 'white'
      ctx.font = '10px Arial'
      ctx.fillText(`U${user.id}`, userX + 10, userY - 5)
      
      // Connection line to base station
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(userX, userY)
      ctx.stroke()
      ctx.setLineDash([])
    })

    // Legend
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.fillText('Cellular Scenario: Base Station and Users', 10, 20)
    ctx.font = '10px Arial'
    ctx.fillText('Color: Green = High Rate, Blue = Low Rate', 10, 35)
    ctx.fillText('Yellow Circle = Current User', 10, 50)
  }

  // Draw rate comparison chart
  const drawRateComparison = () => {
    const canvas = rateRef.current
    if (!canvas || users.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const maxRate = Math.max(...users.flatMap(u => [u.rateNoFading, u.rateH4Fading])) * 1.1
    const barWidth = (width - 80) / (params.numUsers * 2.5)
    const chartHeight = height - 80

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = 60 + (i / 5) * chartHeight
      ctx.beginPath()
      ctx.moveTo(50, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
    }

    // Draw bars
    users.forEach((user, index) => {
      const x = 50 + index * (barWidth * 2.5)
      
      // No fading bar
      const noFadingHeight = (user.rateNoFading / maxRate) * chartHeight
      ctx.fillStyle = index === currentUser ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 0.8)'
      ctx.fillRect(x, height - 40 - noFadingHeight, barWidth, noFadingHeight)
      
      // H4 fading bar
      const h4FadingHeight = (user.rateH4Fading / maxRate) * chartHeight
      ctx.fillStyle = index === currentUser ? 'rgba(239, 68, 68, 1)' : 'rgba(239, 68, 68, 0.8)'
      ctx.fillRect(x + barWidth, height - 40 - h4FadingHeight, barWidth, h4FadingHeight)
      
      // User label
      ctx.fillStyle = 'white'
      ctx.font = '10px Arial'
      ctx.fillText(`${user.id}`, x + barWidth / 2, height - 25)
    })

    // Labels and title
    ctx.fillStyle = 'white'
    ctx.font = '14px Arial'
    ctx.fillText('Rate Comparison: Without Fading vs H4 Fading', 10, 20)
    
    ctx.font = '12px Arial'
    ctx.fillText('Achievable Rate (Mbps)', 10, height / 2)
    ctx.fillText('User Index', width / 2 - 30, height - 5)
    
    // Legend
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
    ctx.fillRect(width - 150, 30, 15, 10)
    ctx.fillStyle = 'white'
    ctx.fillText('No Fading', width - 130, 40)
    
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'
    ctx.fillRect(width - 150, 45, 15, 10)
    ctx.fillStyle = 'white'
    ctx.fillText('H4 Fading', width - 130, 55)
  }

  // Draw velocity vs coherence time
  const drawVelocityCoherence = () => {
    const canvas = velocityRef.current
    if (!canvas || users.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const maxVelocity = Math.max(...users.map(u => u.velocity)) * 1.1
    const maxCoherence = Math.max(...users.map(u => u.coherenceTime)) * 1.1

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = 50 + (i / 10) * (width - 80)
      const y = 40 + (i / 10) * (height - 80)
      ctx.beginPath()
      ctx.moveTo(x, 40)
      ctx.lineTo(x, height - 40)
      ctx.moveTo(50, y)
      ctx.lineTo(width - 30, y)
      ctx.stroke()
    }

    // Draw points
    users.forEach((user, index) => {
      const x = 50 + (user.velocity / maxVelocity) * (width - 80)
      const y = height - 40 - (user.coherenceTime / maxCoherence) * (height - 80)
      
      ctx.fillStyle = index === currentUser ? 'yellow' : 'rgba(34, 211, 238, 0.8)'
      ctx.beginPath()
      ctx.arc(x, y, index === currentUser ? 8 : 6, 0, 2 * Math.PI)
      ctx.fill()
      
      if (index === currentUser) {
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '14px Arial'
    ctx.fillText('Velocity vs Coherence Time', 10, 20)
    
    ctx.font = '12px Arial'
    ctx.fillText('Velocity (m/s)', width / 2 - 30, height - 10)
    
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Coherence Time (s)', -50, 0)
    ctx.restore()
  }

  // Animation step
  const animationStep = () => {
    setCurrentUser(prev => {
      const next = (prev + 1) % params.numUsers
      if (next === 0) {
        // Generate new users when cycle completes
        setUsers(generateUsers())
      }
      return next
    })
  }

  // Control functions
  const startAnimation = () => {
    setIsPlaying(true)
  }

  const pauseAnimation = () => {
    setIsPlaying(false)
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentUser(0)
    setUsers(generateUsers())
  }

  // Effects
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(animationStep, 1000)
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
  }, [isPlaying, params.numUsers])

  useEffect(() => {
    drawCellularScenario()
  }, [users, currentUser, params])

  useEffect(() => {
    drawRateComparison()
  }, [users, currentUser])

  useEffect(() => {
    drawVelocityCoherence()
  }, [users, currentUser])

  // Initialize
  useEffect(() => {
    setUsers(generateUsers())
  }, [])

  return (
    <div className="cellular-network-animation">
      <div className="animation-header">
        <h3>Interactive Cellular Network Analysis</h3>
        <p>Explore cellular network performance with H4 fading and user mobility effects</p>
      </div>

      <div className="animation-controls">
        <div className="control-buttons">
          <button 
            onClick={isPlaying ? pauseAnimation : startAnimation}
            className="control-btn primary"
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
            <label>Users:</label>
            <input 
              type="number" 
              value={params.numUsers} 
              onChange={(e) => setParams(prev => ({...prev, numUsers: Math.max(5, Math.min(20, Number(e.target.value)))}))}
              step="1"
              min="5"
              max="20"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Cell Radius (m):</label>
            <input 
              type="number" 
              value={params.cellRadius} 
              onChange={(e) => setParams(prev => ({...prev, cellRadius: Number(e.target.value)}))}
              step="100"
              min="500"
              max="2000"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Frequency (GHz):</label>
            <input 
              type="number" 
              value={params.frequency} 
              onChange={(e) => setParams(prev => ({...prev, frequency: Number(e.target.value)}))}
              step="1"
              min="1"
              max="100"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Path Loss Exp:</label>
            <input 
              type="number" 
              value={params.pathLossExp} 
              onChange={(e) => setParams(prev => ({...prev, pathLossExp: Number(e.target.value)}))}
              step="0.1"
              min="2"
              max="6"
              disabled={isPlaying}
            />
          </div>
        </div>
      </div>

      <div className="animation-content">
        <div className="charts-container">
          <div className="chart-item">
            <h4>Cellular Network Layout</h4>
            <canvas 
              ref={cellularRef} 
              width={400} 
              height={400}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <h4>Data Rate Analysis</h4>
            <canvas 
              ref={rateRef} 
              width={500} 
              height={300}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <h4>Velocity Impact</h4>
            <canvas 
              ref={velocityRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
        </div>

        {users.length > 0 && currentUser < users.length && (
          <div className="statistics-panel">
            <h4>Current User Analysis: User {users[currentUser]?.id}</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Distance:</span>
                <span className="stat-value">{users[currentUser]?.distance.toFixed(1)} m</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Path Loss:</span>
                <span className="stat-value">{users[currentUser]?.pathLoss.toFixed(2)} dB</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">SNR:</span>
                <span className="stat-value">{users[currentUser]?.snr.toFixed(2)} dB</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rate (No Fading):</span>
                <span className="stat-value">{users[currentUser]?.rateNoFading.toFixed(2)} Mbps</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rate (H4 Fading):</span>
                <span className="stat-value">{users[currentUser]?.rateH4Fading.toFixed(2)} Mbps</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Velocity:</span>
                <span className="stat-value">{users[currentUser]?.velocity.toFixed(1)} m/s</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Coherence Time:</span>
                <span className="stat-value">{users[currentUser]?.coherenceTime.toFixed(3)} s</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rate Degradation:</span>
                <span className="stat-value">
                  {((1 - users[currentUser]?.rateH4Fading / users[currentUser]?.rateNoFading) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>Cellular network topology affects user performance significantly</li>
          <li>H4 cascaded fading causes severe rate degradation compared to no fading</li>
          <li>User distance from base station is critical for received power</li>
          <li>Higher velocities lead to shorter coherence times</li>
          <li>Path loss exponent depends on environment characteristics</li>
          <li>Shadowing adds random variations to received power</li>
        </ul>
      </div>
    </div>
  )
}