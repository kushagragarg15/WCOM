# Assignment 7: MIMO Systems and Channel Capacity Analysis

## Overview
This assignment explores Multiple Input Multiple Output (MIMO) wireless communication systems, focusing on channel capacity analysis and Bit Error Rate (BER) performance evaluation.

## Tasks

### Task 1: Channel Capacity Analysis
Calculate and compare channel capacity for different MIMO configurations:
- **SISO (1×1)**: Single Input Single Output
- **SIMO (1×2)**: Single Input Multiple Output  
- **MISO (2×1)**: Multiple Input Single Output
- **MIMO (2×2)**: Multiple Input Multiple Output

### Task 2: BER Analysis
Evaluate Bit Error Rate performance for BPSK modulation in SISO Rayleigh fading channel.

## Key Concepts

### MIMO Channel Model
- **Channel Matrix H**: Complex Gaussian random matrix
- **Received Signal**: r = Hs + n
- **Noise**: AWGN with variance σ²

### Channel Capacity Formulas

#### SISO System
```
C_SISO = log₂(1 + SNR × |h|²)
```

#### SIMO System  
```
C_SIMO = log₂(1 + SNR × ||h||²)
```

#### MISO System
```
C_MISO = log₂(1 + SNR × ||h||²)
```

#### MIMO System
```
C_MIMO = log₂(det(I + (SNR/Nₜ) × H × H†))
```

### BER Analysis
- **Modulation**: BPSK (Binary Phase Shift Keying)
- **Channel**: Rayleigh fading with AWGN
- **Detection**: Zero-forcing equalization

## Expected Results

### Capacity Performance
1. **MIMO > SIMO ≈ MISO > SISO**
2. **Capacity increases logarithmically with SNR**
3. **MIMO provides highest capacity due to spatial multiplexing**

### BER Performance
1. **BER decreases exponentially with SNR**
2. **Rayleigh fading causes performance degradation**
3. **Higher SNR required compared to AWGN channels**

## Parameters Used

### Simulation Parameters
- **SNR Range**: 0 to 40 dB (capacity), 0 to 20 dB (BER)
- **Monte Carlo Realizations**: 1000 (capacity), 100,000 bits (BER)
- **Channel Model**: Rayleigh fading (complex Gaussian)

### Antenna Configurations
- **SISO**: 1 transmit, 1 receive antenna
- **SIMO**: 1 transmit, 2 receive antennas  
- **MISO**: 2 transmit, 1 receive antenna
- **MIMO**: 2 transmit, 2 receive antennas

## Files Description

### MATLAB Files
1. **mimo_capacity_analysis.m**: Channel capacity calculation and plotting
2. **siso_ber_analysis.m**: BER simulation for BPSK in Rayleigh fading

### Key Functions
- `randn()`: Gaussian random number generation
- `det()`: Matrix determinant calculation
- `norm()`: Matrix/vector norm calculation
- `erfc()`: Complementary error function

## Applications

### Practical Systems
- **4G/5G Cellular Networks**: LTE, NR standards
- **WiFi Standards**: 802.11n/ac/ax with MIMO
- **Satellite Communications**: Multiple antenna systems
- **Radar Systems**: MIMO radar for improved resolution

### Benefits of MIMO
1. **Increased Capacity**: Spatial multiplexing gains
2. **Improved Reliability**: Spatial diversity gains  
3. **Better Coverage**: Beamforming capabilities
4. **Interference Mitigation**: Spatial filtering

## Analysis Questions

1. **Why does MIMO provide higher capacity than SISO?**
   - Multiple parallel data streams
   - Spatial multiplexing gains
   - Better utilization of spatial resources

2. **What is the difference between SIMO and MISO?**
   - SIMO: Receive diversity, improved reliability
   - MISO: Transmit diversity, better coverage
   - Similar capacity gains in rich scattering

3. **How does Rayleigh fading affect BER?**
   - Deep fades cause error bursts
   - Higher average SNR required
   - Diversity helps combat fading effects

## Performance Metrics

### Channel Capacity
- **Units**: bits/sec/Hz (spectral efficiency)
- **Trend**: Logarithmic increase with SNR
- **MIMO Advantage**: Linear increase with min(Nₜ, Nᵣ)

### Bit Error Rate
- **Units**: Probability (dimensionless)
- **Trend**: Exponential decrease with SNR  
- **Diversity Order**: Slope of BER curve in log scale

## Conclusion
MIMO systems provide significant performance improvements over SISO systems through spatial diversity and multiplexing gains. The capacity analysis demonstrates the benefits of multiple antennas, while BER analysis shows the impact of fading on system performance.