# Assignment 9: Modulation Schemes and MIMO Techniques

## Overview
This assignment implements and compares various digital modulation schemes (BPSK, QPSK, QAM) under different MIMO configurations (SISO, SIMO, MISO, MIMO). The analysis covers both AWGN and Rayleigh fading channels to understand the trade-offs between spectral efficiency and error performance.

## Objectives
1. **Implement digital modulation schemes**: BPSK, QPSK, 16-QAM, 64-QAM
2. **Compare BER performance** in AWGN channels (SISO configuration)
3. **Analyze MIMO techniques**: SIMO, MISO, MIMO with BPSK in Rayleigh fading
4. **Study Alamouti Space-Time Block Coding** for transmit diversity
5. **Evaluate spectral efficiency vs. robustness trade-offs**

## Part 1: Modulation Schemes Analysis (SISO-AWGN)

### System Model
- **Channel**: Additive White Gaussian Noise (AWGN)
- **Configuration**: SISO (Single Input Single Output)
- **SNR Range**: 0 to 20 dB
- **Performance Metric**: Bit Error Rate (BER)

### Modulation Schemes

#### 1. BPSK (Binary Phase Shift Keying)
**Characteristics**:
- **Constellation Points**: 2 (±1)
- **Bits per Symbol**: 1
- **Spectral Efficiency**: 1 bit/s/Hz
- **BER Formula**: BER = Q(√(2Eb/N0))

**Advantages**:
- Most robust to noise and interference
- Simplest demodulator implementation
- Constant envelope (good for nonlinear amplifiers)

**Applications**:
- Satellite communications
- Deep space communications
- Control channels in cellular systems

#### 2. QPSK (Quadrature Phase Shift Keying)
**Characteristics**:
- **Constellation Points**: 4
- **Bits per Symbol**: 2
- **Spectral Efficiency**: 2 bits/s/Hz
- **BER Formula**: BER = Q(√(2Eb/N0)) (same as BPSK in AWGN)

**Advantages**:
- Double spectral efficiency compared to BPSK
- Same BER performance as BPSK
- Widely used in practice

**Applications**:
- WiFi (802.11)
- Bluetooth
- Satellite TV (DVB-S)

#### 3. 16-QAM (16-Quadrature Amplitude Modulation)
**Characteristics**:
- **Constellation Points**: 16 (4×4 grid)
- **Bits per Symbol**: 4
- **Spectral Efficiency**: 4 bits/s/Hz
- **BER Formula**: Complex expression involving Q-function

**Advantages**:
- High spectral efficiency
- Good balance of data rate and robustness

**Disadvantages**:
- Requires accurate amplitude control
- More sensitive to noise than PSK

**Applications**:
- Cable modems
- Digital TV (DVB-C)
- Microwave links

#### 4. 64-QAM (64-Quadrature Amplitude Modulation)
**Characteristics**:
- **Constellation Points**: 64 (8×8 grid)
- **Bits per Symbol**: 6
- **Spectral Efficiency**: 6 bits/s/Hz
- **Performance**: Requires high SNR

**Advantages**:
- Very high spectral efficiency
- Maximum data throughput

**Disadvantages**:
- Very sensitive to noise and nonlinearities
- Requires excellent channel conditions
- Complex receiver implementation

**Applications**:
- Cable TV (DOCSIS 3.0)
- WiFi (802.11n/ac/ax)
- 4G/5G cellular (good channel conditions)

### Expected Results (Part 1)
1. **BER Performance Order**: BPSK = QPSK < 16-QAM < 64-QAM
2. **SNR Requirements**: Higher order modulation needs more SNR
3. **Spectral Efficiency Trade-off**: More bits/symbol = higher SNR requirement

## Part 2: MIMO Techniques Analysis (BPSK-Rayleigh)

### System Model
- **Modulation**: BPSK only
- **Channel**: Rayleigh Fading
- **SNR Range**: 0 to 20 dB
- **Performance Metric**: Bit Error Rate (BER)

### MIMO Configurations

#### 1. SIMO (1×2) - Single Input Multiple Output
**Configuration**: 1 transmit antenna, 2 receive antennas

**Technique**: Maximum Ratio Combining (MRC)
- **Principle**: Optimal combining of received signals
- **Weights**: w_i = h_i* (conjugate of channel coefficient)
- **Output SNR**: γ = Σ|h_i|² × γ_avg (sum of branch SNRs)

**Implementation**:
```matlab
% MRC combining
r_combined = conj(h1).*r1 + conj(h2).*r2;
bits_hat = real(r_combined) > 0;
```

**Advantages**:
- Receive diversity gain
- Simple implementation at transmitter
- No feedback required

#### 2. MISO (2×1) - Multiple Input Single Output
**Configuration**: 2 transmit antennas, 1 receive antenna

**Technique**: Alamouti Space-Time Block Coding (STBC)
- **Encoding Matrix**: [s₁ s₂; -s₂* s₁*]
- **Transmission**: 2 symbols over 2 time slots
- **Code Rate**: 1 (full rate)

**Alamouti Encoding Process**:
1. **Time 1**: Tx1 sends s₁, Tx2 sends s₂
2. **Time 2**: Tx1 sends -s₂*, Tx2 sends s₁*

**Alamouti Decoding Process**:
```matlab
% Received signals
r1 = h1.*s1 + h2.*s2 + noise1;
r2 = -conj(h2).*s1 + conj(h1).*s2 + noise2;

% ML decoding
s1_hat = conj(h1).*r1 + h2.*conj(r2);
s2_hat = conj(h2).*r1 - h1.*conj(r2);
```

**Advantages**:
- Transmit diversity without feedback
- Full diversity gain
- Linear decoding complexity

#### 3. MIMO (2×2) - Multiple Input Multiple Output
**Configuration**: 2 transmit antennas, 2 receive antennas

**Technique**: Alamouti STBC + MRC
- **Combines**: Transmit diversity (Alamouti) + Receive diversity (MRC)
- **Diversity Order**: 2 (limited by Alamouti code)
- **Maximum Gain**: Both spatial dimensions utilized

**Implementation**:
```matlab
% Alamouti + MRC combining
s1_hat = conj(h11).*r1_t1 + h12.*conj(r1_t2) + 
         conj(h21).*r2_t1 + h22.*conj(r2_t2);
```

**Advantages**:
- Maximum diversity gain
- Best BER performance
- Robust to fading

**Disadvantages**:
- Highest complexity
- Requires accurate channel estimation

### Alamouti Space-Time Block Code

#### Mathematical Formulation
**Channel Matrix**:
```
H = [h₁ h₂]  (1×2 for MISO)
H = [h₁₁ h₁₂; h₂₁ h₂₂]  (2×2 for MIMO)
```

**Alamouti Code Matrix**:
```
S = [s₁  s₂ ]
    [-s₂* s₁*]
```

**Orthogonality Property**:
```
S·S† = (|s₁|² + |s₂|²)·I
```

#### Diversity Analysis
- **Diversity Order**: min(Nt, Nr) for Alamouti code
- **Coding Gain**: Additional gain from code structure
- **Array Gain**: Power gain from multiple antennas

### Expected Results (Part 2)
1. **Performance Order**: SIMO ≈ MISO ≈ MIMO > SISO
2. **Diversity Gain**: ~3 dB improvement over SISO
3. **Alamouti Effectiveness**: Provides full transmit diversity

## Implementation Details

### MATLAB Code Structure

#### Part 1: Modulation Schemes
```matlab
% Theoretical BER calculations
ber_bpsk = qfunc(sqrt(2*EbN0));
ber_qpsk = qfunc(sqrt(2*EbN0));
ber_qam16 = (4/log2(M))*(1-1/sqrt(M)).*qfunc(...);
ber_qam64 = (4/log2(M))*(1-1/sqrt(M)).*qfunc(...);
```

#### Part 2: MIMO Techniques
```matlab
% Channel generation
h = (randn(Nr, N) + 1i*randn(Nr, N)) / sqrt(2);

% AWGN noise
noise = sqrt(1/(2*EbN0)) * (randn(Nr, N) + 1i*randn(Nr, N));

% Received signal
r = h.*tx + noise;
```

### Key Functions
- `qfunc()`: Q-function for theoretical BER
- `randn()`: Gaussian random number generation
- `conj()`: Complex conjugate operation
- `real()`: Real part extraction

## Performance Metrics

### Bit Error Rate (BER)
- **Definition**: Probability of bit error
- **Calculation**: errors/total_bits
- **Target Values**: 10⁻³ to 10⁻⁶

### Spectral Efficiency
- **Units**: bits/s/Hz
- **BPSK**: 1 bit/s/Hz
- **QPSK**: 2 bits/s/Hz
- **16-QAM**: 4 bits/s/Hz
- **64-QAM**: 6 bits/s/Hz

### Diversity Gain
- **Definition**: SNR improvement due to diversity
- **Measurement**: dB difference at target BER
- **Typical Values**: 2-4 dB for 2-antenna diversity

## Applications

### Modulation Schemes
- **BPSK/QPSK**: Control channels, robust links
- **16-QAM**: Balanced performance applications
- **64-QAM**: High-speed data in good channels

### MIMO Techniques
- **SIMO**: Base station receivers, WiFi access points
- **MISO**: Broadcast systems, downlink transmission
- **MIMO**: 4G/5G cellular, WiFi 802.11n/ac/ax

## Practical Considerations

### Implementation Challenges
1. **Channel Estimation**: Accurate CSI required for optimal performance
2. **Synchronization**: Timing and frequency synchronization critical
3. **Hardware Impairments**: Phase noise, I/Q imbalance effects
4. **Computational Complexity**: Real-time processing requirements

### Design Trade-offs
1. **Spectral Efficiency vs. Robustness**: Higher order modulation vs. error rate
2. **Complexity vs. Performance**: Simple schemes vs. optimal performance
3. **Power vs. Data Rate**: Transmission power vs. achievable throughput

## Conclusion
This assignment demonstrates the fundamental trade-offs in wireless communication system design. Modulation schemes offer different spectral efficiency vs. robustness trade-offs, while MIMO techniques provide diversity gains to combat fading. The combination of appropriate modulation and MIMO techniques enables modern high-speed wireless systems.