'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

interface Channel {
  index: number
  gain: number
  gamma: number
  invGamma: number
  power: number
  waterLevel: number
}

interface WFParams {
  numChannels: number
  totalPower: number
  noisePower: number
  convergenceError: number
}

export default function WaterFillingAnimation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [channels, setChannels] = useState<Channel[]>([])
  const [muCutoff, setMuCutoff] = useState(0)
  const [capacityWF, setCapacityWF] = useState(0)
  const [capacityEqual, setCapacityEqual] = useState(0)
  const [params, setParams] = useState<WFParams>({
    numChannels: 6,
    totalPower: 5,
    noisePower: 1,
    convergenceError: 1e-6
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const waterFillingRef = useRef<HTMLCanvasElement>(null)
  const capacityRef = useRef<HTMLCanvasElement>(null)
  const [iterationHistory, setIterationHistory] = useState<{iteration: number, muLow: number, muHigh: number, muMid: number}[]>([])

  // Generate Rayleigh fading channels
  const generateChannels = (): Channel[] => {
    const newChannels: Channel[] = []
    
    for (let i = 0; i < params.numChannels; i++) {
      // Generate complex Gaussian channel coefficient
      const hReal = (Math.random() - 0.5) * 2 // Gaussian approximation
      const hImag = (Math.random() - 0.5) * 2 // Gaussian approximation
      
      // Channel gain |h|^2 (exponentially distributed for Rayleigh fading)
      const gain = (hReal * hReal + hImag * hImag) / 2
      
      // SNR per channel
      const gamma = gain / params.noisePower
      const invGamma = 1 / gamma
      
      newChannels.push({
        index: i + 1,
        gain,
        gamma,
        invGamma,
        power: 0,
        waterLevel: 0
      })
    }
    
    return newChannels
  }

  // Water-filling algorithm using bisection search
  const performWaterFilling = (channels: Channel[]): { channels: Channel[], muCutoff: number, history: any[] } => {
    const invGammas = channels.map(ch => ch.invGamma)
    const history: any[] = []
    
    let muLow = Math.min(...channels.map(ch => ch.gamma))
    let muHigh = Math.max(...channels.map(ch => ch.gamma))
    let iteration = 0
    const maxIterations = 1000
    
    while (iteration < maxIterations) {
      const muMid = (muLow + muHigh) / 2
      const invMuMid = 1 / muMid
      
      // Calculate power allocation
      const powers = invGammas.map(invGamma => Math.max(invMuMid - invGamma, 0))
      const totalAllocated = powers.reduce((sum, p) => sum + p, 0)
      
      const fMid = totalAllocated - params.totalPower
      
      history.push({
        iteration: iteration + 1,
        muLow,
        muHigh,
        muMid,
        fMid,
        totalAllocated
      })
      
      if (Math.abs(fMid) < params.convergenceError) {
        break
      } else if (fMid > 0) {
        muLow = muMid
      } else {
        muHigh = muMid
      }
      
      iteration++
    }
    
    const finalMu = (muLow + muHigh) / 2
    const invFinalMu = 1 / finalMu
    
    // Final power allocation
    const updatedChannels = channels.map((ch, i) => ({
      ...ch,
      power: Math.max(invFinalMu - ch.invGamma, 0),
      waterLevel: ch.invGamma + Math.max(invFinalMu - ch.invGamma, 0)
    }))
    
    return { channels: updatedChannels, muCutoff: finalMu, history }
  }

  // Calculate capacities
  const calculateCapacities = (channels: Channel[]) => {
    // Water-filling capacity
    const wfCapacity = channels.reduce((sum, ch) => {
      return sum + (ch.power > 0 ? Math.log2(1 + ch.power * ch.gamma) : 0)
    }, 0)
    
    // Equal power allocation capacity
    const equalPower = params.totalPower / params.numChannels
    const equalCapacity = channels.reduce((sum, ch) => {
      return sum + Math.log2(1 + equalPower * ch.gamma)
    }, 0)
    
    return { wfCapacity, equalCapacity }
  }

  // Draw water-filling visualization
  const drawWaterFilling = () => {
    const canvas = waterFillingRef.current
    if (!canvas || channels.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const barWidth = (width - 100) / params.numChannels
    const maxWaterLevel = Math.max(...channels.map(ch => ch.waterLevel)) * 1.2
    const chartHeight = height - 100

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const y = 60 + (i / 10) * chartHeight
      ctx.beginPath()
      ctx.moveTo(50, y)
      ctx.lineTo(width - 30, y)
      ctx.stroke()
    }

    // Draw bars for each channel
    channels.forEach((channel, index) => {
      const x = 50 + index * barWidth
      
      // Channel bottom (1/gamma_i) - orange/red bars
      const bottomHeight = (channel.invGamma / maxWaterLevel) * chartHeight
      ctx.fillStyle = 'rgba(255, 87, 34, 0.8)'
      ctx.fillRect(x + 5, height - 50 - bottomHeight, barWidth - 10, bottomHeight)
      
      // Water level (power allocation) - blue bars on top
      if (channel.power > 0) {
        const powerHeight = (channel.power / maxWaterLevel) * chartHeight
        ctx.fillStyle = 'rgba(33, 150, 243, 0.8)'
        ctx.fillRect(x + 5, height - 50 - bottomHeight - powerHeight, barWidth - 10, powerHeight)
      }
      
      // Channel index labels
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${channel.index}`, x + barWidth / 2, height - 25)
    })

    // Draw water level line (1/mu_cutoff)
    if (muCutoff > 0) {
      const waterLevelY = height - 50 - (1/muCutoff / maxWaterLevel) * chartHeight
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 3
      ctx.setLineDash([10, 5])
      ctx.beginPath()
      ctx.moveTo(50, waterLevelY)
      ctx.lineTo(width - 30, waterLevelY)
      ctx.stroke()
      ctx.setLineDash([])
      
      // Water level label
      ctx.fillStyle = 'red'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`Water Level (1/μ = ${(1/muCutoff).toFixed(3)})`, width - 200, waterLevelY - 10)
    }

    // Title and labels
    ctx.fillStyle = 'white'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Water-filling Visualization', width / 2, 30)
    
    ctx.font = '12px Arial'
    ctx.fillText('Channel Index', width / 2, height - 5)
    
    ctx.save()
    ctx.translate(20, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Water Level (1/γₖ + Pₖ)', -50, 0)
    ctx.restore()

    // Legend
    ctx.fillStyle = 'rgba(33, 150, 243, 0.8)'
    ctx.fillRect(width - 180, 50, 15, 10)
    ctx.fillStyle = 'white'
    ctx.font = '10px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Total Water Level', width - 160, 60)
    
    ctx.fillStyle = 'rgba(255, 87, 34, 0.8)'
    ctx.fillRect(width - 180, 65, 15, 10)
    ctx.fillText('Channel Bottom (1/γₖ)', width - 160, 75)
    
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(width - 180, 85)
    ctx.lineTo(width - 165, 85)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillText('Water Level', width - 160, 90)
  }

  // Draw capacity comparison
  const drawCapacityComparison = () => {
    const canvas = capacityRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    const maxCapacity = Math.max(capacityWF, capacityEqual) * 1.2
    const barWidth = 80
    const chartHeight = height - 100

    // Water-filling capacity bar
    const wfHeight = (capacityWF / maxCapacity) * chartHeight
    ctx.fillStyle = 'rgba(76, 175, 80, 0.8)'
    ctx.fillRect(width / 2 - 100, height - 50 - wfHeight, barWidth, wfHeight)
    
    // Equal power capacity bar
    const equalHeight = (capacityEqual / maxCapacity) * chartHeight
    ctx.fillStyle = 'rgba(255, 152, 0, 0.8)'
    ctx.fillRect(width / 2 + 20, height - 50 - equalHeight, barWidth, equalHeight)

    // Labels
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Water-filling', width / 2 - 60, height - 25)
    ctx.fillText('Equal Power', width / 2 + 60, height - 25)
    
    // Values
    ctx.font = '14px Arial'
    ctx.fillText(`${capacityWF.toFixed(3)}`, width / 2 - 60, height - 60 - wfHeight)
    ctx.fillText(`${capacityEqual.toFixed(3)}`, width / 2 + 60, height - 60 - equalHeight)
    
    // Title
    ctx.font = '16px Arial'
    ctx.fillText('Capacity Comparison (bits/s/Hz)', width / 2, 30)
    
    // Improvement percentage
    if (capacityEqual > 0) {
      const improvement = ((capacityWF - capacityEqual) / capacityEqual * 100)
      ctx.font = '12px Arial'
      ctx.fillStyle = 'lightgreen'
      ctx.fillText(`Improvement: ${improvement.toFixed(1)}%`, width / 2, height - 10)
    }
  }

  // Animation step
  const animationStep = () => {
    setCurrentIteration(prev => {
      if (prev >= iterationHistory.length - 1) {
        setIsPlaying(false)
        return prev
      }
      return prev + 1
    })
  }

  // Control functions
  const startAnimation = () => {
    if (currentIteration >= iterationHistory.length - 1) return
    setIsPlaying(true)
  }

  const pauseAnimation = () => {
    setIsPlaying(false)
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentIteration(0)
    generateNewChannels()
  }

  const generateNewChannels = () => {
    const newChannels = generateChannels()
    const result = performWaterFilling(newChannels)
    const capacities = calculateCapacities(result.channels)
    
    setChannels(result.channels)
    setMuCutoff(result.muCutoff)
    setCapacityWF(capacities.wfCapacity)
    setCapacityEqual(capacities.equalCapacity)
    setIterationHistory(result.history)
    setCurrentIteration(0)
  }

  // Effects
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(animationStep, 800)
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
  }, [isPlaying, currentIteration, iterationHistory.length])

  useEffect(() => {
    drawWaterFilling()
  }, [channels, muCutoff])

  useEffect(() => {
    drawCapacityComparison()
  }, [capacityWF, capacityEqual])

  // Initialize
  useEffect(() => {
    generateNewChannels()
  }, [params])

  return (
    <div className="waterfilling-animation">
      <div className="animation-header">
        <h3>Interactive Water-filling Algorithm Visualization</h3>
        <p>Watch the iterative optimization process and see how power is optimally allocated</p>
      </div>

      <div className="animation-controls">
        <div className="control-buttons">
          <button 
            onClick={isPlaying ? pauseAnimation : startAnimation}
            className="control-btn primary"
            disabled={currentIteration >= iterationHistory.length - 1}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={resetAnimation} className="control-btn secondary">
            <RotateCcw size={16} />
            New Channels
          </button>
        </div>

        <div className="parameters">
          <div className="param-group">
            <label>Channels:</label>
            <input 
              type="number" 
              value={params.numChannels} 
              onChange={(e) => setParams(prev => ({...prev, numChannels: Math.max(3, Math.min(10, Number(e.target.value)))}))}
              step="1"
              min="3"
              max="10"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Total Power:</label>
            <input 
              type="number" 
              value={params.totalPower} 
              onChange={(e) => setParams(prev => ({...prev, totalPower: Number(e.target.value)}))}
              step="1"
              min="1"
              max="20"
              disabled={isPlaying}
            />
          </div>
          <div className="param-group">
            <label>Noise Power:</label>
            <input 
              type="number" 
              value={params.noisePower} 
              onChange={(e) => setParams(prev => ({...prev, noisePower: Number(e.target.value)}))}
              step="0.1"
              min="0.1"
              max="5"
              disabled={isPlaying}
            />
          </div>
        </div>
      </div>

      {iterationHistory.length > 0 && (
        <div className="iteration-info">
          <h4>Iteration Progress: {currentIteration + 1} / {iterationHistory.length}</h4>
          {currentIteration < iterationHistory.length && (
            <div className="iteration-stats">
              <span>μ_low: {iterationHistory[currentIteration]?.muLow.toFixed(4)}</span>
              <span>μ_high: {iterationHistory[currentIteration]?.muHigh.toFixed(4)}</span>
              <span>μ_mid: {iterationHistory[currentIteration]?.muMid.toFixed(4)}</span>
              <span>Error: {Math.abs(iterationHistory[currentIteration]?.fMid || 0).toFixed(6)}</span>
            </div>
          )}
        </div>
      )}

      <div className="animation-content">
        <div className="charts-container">
          <div className="chart-item">
            <h4>Water-filling Algorithm Visualization</h4>
            <canvas 
              ref={waterFillingRef} 
              width={600} 
              height={400}
              className="chart-canvas"
            />
          </div>
          <div className="chart-item">
            <h4>Channel Capacity Analysis</h4>
            <canvas 
              ref={capacityRef} 
              width={400} 
              height={300}
              className="chart-canvas"
            />
          </div>
        </div>

        {channels.length > 0 && (
          <div className="statistics-panel">
            <h4>Water-filling Results</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Optimal Water Level (μ):</span>
                <span className="stat-value">{muCutoff.toFixed(4)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Water-filling Capacity:</span>
                <span className="stat-value">{capacityWF.toFixed(3)} bits/s/Hz</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Equal Power Capacity:</span>
                <span className="stat-value">{capacityEqual.toFixed(3)} bits/s/Hz</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Capacity Gain:</span>
                <span className="stat-value">
                  {capacityEqual > 0 ? ((capacityWF - capacityEqual) / capacityEqual * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Power Used:</span>
                <span className="stat-value">
                  {channels.reduce((sum, ch) => sum + ch.power, 0).toFixed(3)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Channels:</span>
                <span className="stat-value">
                  {channels.filter(ch => ch.power > 0.001).length} / {channels.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-points">
        <h4>Key Learning Points:</h4>
        <ul>
          <li>Water-filling optimally distributes power based on channel quality</li>
          <li>Poor channels may receive zero power allocation</li>
          <li>The algorithm finds optimal water level μ through bisection search</li>
          <li>Water-filling always achieves higher capacity than equal power allocation</li>
          <li>Visual metaphor: "water" fills "channels" up to optimal level</li>
          <li>Critical for OFDM, MIMO, and adaptive communication systems</li>
        </ul>
      </div>
    </div>
  )
}