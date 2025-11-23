# Assignment 8: Diversity Combining Techniques

## Overview
This assignment implements and compares three fundamental diversity combining techniques used in wireless communication systems: Selection Combining (SC), Equal Gain Combining (EGC), and Maximum Ratio Combining (MRC).

## Objective
Implement and compare the performance of Selection Combining (SC), Equal Gain Combining (EGC), and Maximum Ratio Combining (MRC) diversity techniques using MATLAB. Analyze their BER performance in Rayleigh fading channels.

## System Model

### Channel Model
- **Fading Type**: Rayleigh fading (no line-of-sight component)
- **Channel Coefficients**: h_i ~ CN(0,1) complex Gaussian
- **Noise**: AWGN with variance σ² = 1/(2×SNR)
- **Modulation**: BPSK (Binary Phase Shift Keying)

### System Configuration
- **Transmit Antennas (Mt)**: 1
- **Receive Antennas (Mr)**: 2 (configurable)
- **Signal Model**: y_i = h_i × x + n_i

## Diversity Combining Techniques

### 1. Selection Combining (SC)
**Principle**: Select the branch with the highest instantaneous SNR.

**Algorithm**:
1. Calculate |h_i|² for all branches
2. Select branch k* = arg max_i |h_i|²
3. Use only the selected branch: y_SC = y_k*
4. Equalize: x̂ = sign(Re(y_k*/h_k*))

**Advantages**:
- Simple implementation
- Low complexity
- No need for channel phase information

**Disadvantages**:
- Suboptimal performance
- Wastes information from other branches

### 2. Equal Gain Combining (EGC)
**Principle**: Combine all branches with equal weights after phase correction.

**Algorithm**:
1. Correct phase: w_i = h_i*/|h_i|
2. Combine signals: y_EGC = Σ w_i × y_i
3. Detect: x̂ = sign(Re(y_EGC))

**Advantages**:
- Better performance than SC
- Moderate complexity
- Uses all available branches

**Disadvantages**:
- Requires phase estimation
- Not optimal weighting

### 3. Maximum Ratio Combining (MRC)
**Principle**: Optimal combining with weights proportional to branch SNR.

**Algorithm**:
1. Set weights: w_i = h_i*
2. Combine: y_MRC = Σ h_i* × y_i
3. Normalize: y_MRC = y_MRC / Σ|h_i|²
4. Detect: x̂ = sign(Re(y_MRC))

**Advantages**:
- Optimal BER performance
- Maximum SNR at combiner output
- Achieves full diversity gain

**Disadvantages**:
- Highest complexity
- Requires accurate channel estimation

## Performance Metrics

### Bit Error Rate (BER)
The probability of bit error for each combining technique:
- **BER_SC**: Selection combining error rate
- **BER_EGC**: Equal gain combining error rate  
- **BER_MRC**: Maximum ratio combining error rate

### Diversity Gain
The improvement in BER performance compared to no diversity:
- **Diversity Order**: Slope of BER curve in log scale
- **SNR Gain**: dB improvement for target BER

### Output SNR
The effective SNR at the combiner output:
- **SC**: γ_SC = max_i |h_i|² × γ_avg
- **EGC**: γ_EGC = (Σ|h_i|)² × γ_avg  
- **MRC**: γ_MRC = Σ|h_i|² × γ_avg (optimal)

## Expected Results

### BER Performance Ranking
1. **MRC**: Best performance (lowest BER)
2. **EGC**: Intermediate performance
3. **SC**: Worst among diversity techniques
4. **No Diversity**: Baseline (highest BER)

### Diversity Order
All techniques achieve diversity order M_r (number of receive antennas):
- Slope of BER curve ∝ -M_r in high SNR region
- Steeper slope = higher diversity order

### SNR Gain Analysis
At BER = 10⁻³:
- MRC provides 3-4 dB gain over EGC
- EGC provides 2-3 dB gain over SC
- SC provides significant gain over no diversity

## Implementation Details

### MATLAB Code Structure
```matlab
% System parameters
Mt = 1; Mr = 2; numBits = 1e5; SNRdB = 0:2:35;

% Channel generation
h = (randn(Mr, numBits) + 1j*randn(Mr, numBits))/sqrt(2);

% For each SNR value:
for i = 1:length(SNRdB)
    % Generate bits and symbols
    % Add noise
    % Apply combining technique
    % Calculate BER
end
```

### Key Functions
- `max(abs(h).^2)`: Find best branch for SC
- `exp(-1j*angle(h))`: Phase correction for EGC
- `conj(h)`: Optimal weights for MRC
- `mean(xhat ~= bits)`: BER calculation

## Simulation Parameters

### Default Configuration
- **Number of bits**: 100,000
- **SNR range**: 0 to 35 dB (step: 2 dB)
- **Receive antennas**: 2
- **Channel realizations**: Independent per bit
- **Modulation**: BPSK

### Performance Targets
- **Target BER**: 10⁻³ to 10⁻⁵
- **Simulation accuracy**: ±0.1 dB
- **Confidence level**: 95%

## Theoretical Background

### MRC Theoretical BER
For BPSK with MRC in Rayleigh fading:
```
BER = (1/2)^Mr × Σ(k=0 to Mr-1) C(Mr-1+k,k) × (1+γ_avg)^(-k)
```

### High SNR Approximation
```
BER_MRC ≈ (1/(4×γ_avg))^Mr
BER_EGC ≈ (1/(4×γ_avg))^Mr × (constant factor)
BER_SC ≈ (1/(4×γ_avg))^Mr × (larger constant)
```

## Applications

### Practical Systems
- **Cellular Base Stations**: Multiple receive antennas
- **WiFi Access Points**: Antenna diversity
- **Satellite Receivers**: Spatial diversity
- **Mobile Handsets**: Receive diversity
- **Radar Systems**: Multiple receiver arrays

### Standards Implementation
- **LTE/5G**: MRC in MIMO receivers
- **WiFi 802.11**: Antenna selection and combining
- **Bluetooth**: Diversity for improved range
- **GPS**: Multiple antenna receivers

## Analysis Questions

### Performance Comparison
1. **Why does MRC outperform EGC and SC?**
   - Optimal SNR-based weighting
   - Maximum combiner output SNR
   - Full utilization of channel information

2. **What is the complexity trade-off?**
   - SC: Low complexity, moderate performance
   - EGC: Medium complexity, good performance  
   - MRC: High complexity, optimal performance

3. **How does diversity order affect performance?**
   - Higher Mr → steeper BER slope
   - More antennas → better diversity gain
   - Diminishing returns at very high Mr

### Design Considerations
1. **When to use each technique?**
   - SC: Power-limited, simple receivers
   - EGC: Balanced complexity/performance
   - MRC: Performance-critical applications

2. **Impact of channel estimation errors?**
   - MRC most sensitive to estimation errors
   - EGC moderately affected
   - SC least sensitive (only needs SNR comparison)

## Conclusion
Diversity combining techniques provide significant performance improvements in fading channels. MRC offers optimal performance at the cost of complexity, while SC provides a simple alternative with reasonable performance. The choice depends on system requirements and implementation constraints.