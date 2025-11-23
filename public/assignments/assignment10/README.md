# Assignment 10: Alamouti Space-Time Block Coding

## Overview
This assignment implements the Alamouti Space-Time Block Coding (STBC) scheme using BPSK and QPSK modulation. Students will compare the performance of Alamouti 2×1 STBC against normal 2×1 MISO systems, understanding how space-time coding provides transmit diversity without requiring channel state information at the transmitter.

## Objectives
1. **Implement Alamouti STBC**: Understand encoding and decoding algorithms
2. **Compare modulation schemes**: Analyze BPSK and QPSK performance with STBC
3. **Evaluate transmit diversity**: Study diversity gains in fading channels
4. **Analyze complexity trade-offs**: Compare simple repetition vs. space-time coding

## Alamouti Space-Time Block Code

### Historical Context
The Alamouti scheme, proposed by Siavash Alamouti in 1998, was the first space-time block code that achieved:
- **Full transmit diversity** without channel feedback
- **Linear decoding complexity** (instead of exponential)
- **Full code rate** (no bandwidth expansion)

### Mathematical Foundation

#### Code Matrix
For two input symbols s₁ and s₂, the Alamouti code matrix is:
```
S = [s₁  s₂ ]
    [-s₂* s₁*]
```

#### Orthogonality Property
The key property that enables linear decoding:
```
S · S† = (|s₁|² + |s₂|²) · I
```
This orthogonality allows the receiver to separate the transmitted symbols using linear processing.

#### Transmission Scheme
- **Time 1**: Tx1 transmits s₁, Tx2 transmits s₂
- **Time 2**: Tx1 transmits -s₂*, Tx2 transmits s₁*

### System Models

#### Normal 2×1 MISO (Repetition Coding)
**Transmission**: Both antennas transmit the same symbol
```matlab
% Power normalization
tx = s / sqrt(2);  % Split power between antennas

% Received signal
r = h1.*tx + h2.*tx + noise;

% MRC combining
h_combined = h1 + h2;
y = conj(h_combined).*r ./ abs(h_combined).^2;
```

**Characteristics**:
- Simple implementation
- Limited diversity gain
- Correlation between transmitted signals

#### Alamouti 2×1 STBC
**Encoding**: Process symbols in pairs
```matlab
% Symbol pairs
s1 = s(1:2:end);
s2 = s(2:2:end);

% Alamouti encoding with power normalization
x1 = s1/sqrt(2);        % Tx1 at time 1
x2 = s2/sqrt(2);        % Tx2 at time 1
x3 = -conj(s2)/sqrt(2); % Tx1 at time 2
x4 = conj(s1)/sqrt(2);  % Tx2 at time 2
```

**Decoding**: Linear maximum likelihood detection
```matlab
% Received signals
r1 = h1.*x1 + h2.*x2 + n1;  % Time 1
r2 = h1.*x3 + h2.*x4 + n2;  % Time 2

% Alamouti combining
y1 = conj(h1).*r1 + h2.*conj(r2);
y2 = conj(h2).*r1 - h1.*conj(r2);

% Channel energy normalization
h_eq = abs(h1).^2 + abs(h2).^2;
s1_hat = y1 ./ h_eq;
s2_hat = y2 ./ h_eq;
```

## Part 1: BPSK Implementation

### System Parameters
- **Modulation**: BPSK (0 → -1, 1 → +1)
- **Channel**: Rayleigh fading
- **Bits**: 100,000
- **SNR Range**: 0 to 20 dB

### BPSK Characteristics
- **Constellation**: 2 points {-1, +1}
- **Bits per symbol**: 1
- **Detection**: Real part threshold (> 0)
- **Robustness**: Most robust to noise

### Expected Results (BPSK)
1. **Alamouti advantage**: Significant BER improvement over normal MISO
2. **Diversity order**: Alamouti achieves order 2, normal MISO limited
3. **SNR gain**: ~3 dB improvement at target BER = 10⁻³

## Part 2: QPSK Implementation

### System Parameters
- **Modulation**: QPSK (2 bits per symbol)
- **Channel**: Rayleigh fading
- **Bits**: 200,000
- **SNR Range**: 0 to 20 dB

### QPSK Characteristics
- **Constellation**: 4 points {(±1±j)/√2}
- **Bits per symbol**: 2
- **Detection**: I/Q component thresholds
- **Spectral efficiency**: 2 bits/s/Hz

### QPSK Mapping
```
Bits → Symbol
00 → (-1-j)/√2
01 → (-1+j)/√2
10 → (+1-j)/√2
11 → (+1+j)/√2
```

### Expected Results (QPSK)
1. **Similar diversity gains** as BPSK
2. **Higher spectral efficiency** (2× BPSK)
3. **Theoretical validation** with simulation results

## Implementation Details

### MATLAB Code Structure

#### Common Elements
```matlab
% System setup
N = 1e5;  % Number of bits
SNR_dB = 0:2:20;
bits = randi([0 1], N, 1);

% Channel generation
h1 = (randn(N,1) + 1j*randn(N,1))/sqrt(2);
h2 = (randn(N,1) + 1j*randn(N,1))/sqrt(2);

% Noise generation
noise_var = 1/(2*snr_lin);
noise = sqrt(noise_var)*(randn(N,1) + 1j*randn(N,1));
```

#### Power Normalization
Critical for fair comparison between systems:
```matlab
% Both systems use same total power
tx_normal = s / sqrt(2);    % Normal MISO
tx_alamouti = s / sqrt(2);  % Alamouti per antenna per time slot
```

### Key Functions
- `randi([0 1], N, 1)`: Random bit generation
- `randn() + 1j*randn()`: Complex Gaussian channel
- `conj()`: Complex conjugate for combining
- `abs().^2`: Channel energy calculation

## Performance Metrics

### Bit Error Rate (BER)
- **Calculation**: `mean(bits_rx ~= bits_tx)`
- **Target values**: 10⁻³ to 10⁻⁵
- **Log scale plotting**: `semilogy()`

### Diversity Order
- **Definition**: Slope of BER curve in high SNR region
- **Estimation**: Linear regression on log(BER) vs SNR
- **Expected**: Order 2 for Alamouti, Order 1 for normal MISO

### SNR Gain
- **Measurement**: dB difference at target BER
- **Typical values**: 2-4 dB for Alamouti over normal MISO

## Theoretical Analysis

### BER Formulas

#### BPSK in Rayleigh Fading
**1×1 System (Baseline)**:
```
BER = 0.5 × (1 - √(γ/(1+γ)))
```

**2×1 Alamouti**:
```
μ = √(γ/(1+γ))
BER = (0.5 × (1-μ))² × (1 + 2μ)
```

#### QPSK Performance
Similar expressions to BPSK, with appropriate scaling for 2 bits per symbol.

### Diversity Analysis
- **Normal MISO**: Limited diversity due to signal correlation
- **Alamouti STBC**: Full diversity order equal to number of Tx antennas
- **High SNR behavior**: BER ∝ (SNR)⁻ᵈ where d is diversity order

## Applications

### Standards Implementation
- **3G Systems**: WCDMA with transmit diversity
- **4G LTE**: STBC for 2-antenna transmission
- **WiFi**: 802.11n/ac with optional STBC
- **WiMAX**: MIMO-OFDM with space-time coding
- **DVB-T2**: Digital TV with STBC

### Practical Benefits
1. **No feedback required**: CSI only needed at receiver
2. **Backward compatibility**: Can coexist with single-antenna receivers
3. **Robust performance**: Works well with channel estimation errors
4. **Implementation simplicity**: Linear decoding complexity

## Complexity Analysis

### Computational Complexity

#### Normal 2×1 MISO
- **Encoding**: O(1) - simple repetition
- **Decoding**: O(1) - MRC combining
- **Total**: Very low complexity

#### Alamouti 2×1 STBC
- **Encoding**: O(1) - matrix operations
- **Decoding**: O(M) - linear in constellation size
- **Total**: Low to moderate complexity

### Memory Requirements
- **Normal MISO**: Single symbol buffer
- **Alamouti STBC**: Two time slot buffer
- **Trade-off**: Minimal memory increase for significant gain

## Design Considerations

### Channel Estimation
- **Requirement**: Accurate CSI at receiver
- **Impact**: Estimation errors degrade performance
- **Mitigation**: Pilot symbols, channel tracking

### Synchronization
- **Time synchronization**: Critical for coherent combining
- **Frequency offset**: Affects channel estimation
- **Phase noise**: Degrades orthogonality

### Hardware Implementation
- **RF chains**: Two transmit chains required
- **Power amplifiers**: Balanced power allocation
- **Antenna spacing**: Sufficient decorrelation needed

## Extensions and Variations

### Higher Order STBC
- **3×3, 4×4 systems**: More complex codes
- **Rate vs. diversity trade-off**: Cannot achieve both optimally
- **Quasi-orthogonal codes**: Practical compromises

### MIMO-OFDM Integration
- **Frequency selective channels**: OFDM with per-subcarrier STBC
- **Spatial-frequency coding**: Extended diversity dimensions
- **Practical systems**: LTE, WiFi implementations

## Conclusion
The Alamouti STBC represents a fundamental breakthrough in wireless communications, providing an elegant solution to achieve transmit diversity with minimal complexity increase. Its widespread adoption in modern wireless standards demonstrates the practical value of space-time coding techniques.