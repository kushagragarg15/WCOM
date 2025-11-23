% Alamouti Space-Time Block Coding with QPSK
% Assignment 10 - Part 2: Baseline 1×1 vs Alamouti 2×1 STBC (QPSK)

clc; clear; close all;

%% 1. System Setup
N_bits = 200000;           % Total number of bits
k = 2;                     % Bits per symbol (QPSK: log2(4)=2)
N_symbols = N_bits / k;    % Total number of QPSK symbols
SNR_dB = 0:2:20;          % Range of SNR in dB

fprintf('=== ALAMOUTI SPACE-TIME BLOCK CODING ANALYSIS (QPSK) ===\n');
fprintf('Modulation: QPSK\n');
fprintf('Channel: Rayleigh Fading\n');
fprintf('Number of bits: %d\n', N_bits);
fprintf('Number of symbols: %d\n', N_symbols);
fprintf('SNR Range: %d to %d dB\n\n', SNR_dB(1), SNR_dB(end));

% Generate random bits and QPSK symbols (normalized to Es=1)
bits_tx = randi([0 1], 1, N_bits);

% QPSK Mapping: Bit 0 -> -1, Bit 1 -> +1 (for I and Q components)
I_map = 2 * bits_tx(1:2:end) - 1;
Q_map = 2 * bits_tx(2:2:end) - 1;
s_tx = (I_map + 1i * Q_map) / sqrt(2);  % Normalized QPSK symbols

BER_Baseline = zeros(size(SNR_dB));
BER_Alamouti = zeros(size(SNR_dB));

%% 2. BASELINE 1×1 SIMULATION (Uncoded)
fprintf('Computing Baseline 1×1 System...\n');
for ii = 1:length(SNR_dB)
    snr_lin = 10^(SNR_dB(ii)/10);
    noise_var = 1 / (k * snr_lin); % Noise variance N0/2 (Es=1)
    
    % Rayleigh channel (1Tx, 1Rx)
    h_base = (randn(1, N_symbols) + 1i * randn(1, N_symbols)) / sqrt(2);
    
    % AWGN noise
    n_base = sqrt(noise_var/2) * (randn(1, N_symbols) + 1i * randn(1, N_symbols));
    
    % Received signal
    r_base = h_base .* s_tx + n_base;
    
    % Detection (Zero-forcing equalization)
    s_rx_base = (conj(h_base) ./ abs(h_base).^2) .* r_base;
    
    % QPSK Demodulation
    % Decision: If real/imag part > 0 (closer to +1), guess bit 1
    bits_rx_I = real(s_rx_base) > 0;
    bits_rx_Q = imag(s_rx_base) > 0;
    
    % Interleave bits
    bits_rx_base = zeros(1, N_bits);
    bits_rx_base(1:2:end) = bits_rx_I;
    bits_rx_base(2:2:end) = bits_rx_Q;
    
    % Calculate BER
    BER_Baseline(ii) = mean(bits_rx_base ~= bits_tx);
    
    if mod(ii, 3) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', SNR_dB(ii), BER_Baseline(ii));
    end
end

%% 3. ALAMOUTI 2×1 STBC SIMULATION
fprintf('\nComputing Alamouti 2×1 STBC...\n');

% Alamouti encoding: process symbols in pairs
s1 = s_tx(1:2:end);  % Symbol pair 1
s2 = s_tx(2:2:end);  % Symbol pair 2
N_pairs = length(s1);

for ii = 1:length(SNR_dB)
    snr_lin = 10^(SNR_dB(ii)/10);
    noise_var = 1 / (k * snr_lin); % Noise variance N0/2
    
    % Alamouti Space-Time Block Code:
    % Time 1: [s1, s2] transmitted from [Tx1, Tx2]
    % Time 2: [-s2*, s1*] transmitted from [Tx1, Tx2]
    
    % Transmitted symbols with power normalization (1/sqrt(2) per antenna)
    x1 = s1 / sqrt(2);        % Tx1 at time 1
    x2 = s2 / sqrt(2);        % Tx2 at time 1
    x3 = -conj(s2) / sqrt(2); % Tx1 at time 2
    x4 = conj(s1) / sqrt(2);  % Tx2 at time 2
    
    % Rayleigh fading channels (constant for two time slots)
    h1 = (randn(1, N_pairs) + 1i * randn(1, N_pairs)) / sqrt(2); % Tx1 to Rx
    h2 = (randn(1, N_pairs) + 1i * randn(1, N_pairs)) / sqrt(2); % Tx2 to Rx
    
    % Complex noise for time 1 and time 2
    n1 = sqrt(noise_var/2) * (randn(1, N_pairs) + 1i * randn(1, N_pairs));
    n2 = sqrt(noise_var/2) * (randn(1, N_pairs) + 1i * randn(1, N_pairs));
    
    % Received signals
    r1 = h1 .* x1 + h2 .* x2 + n1; % Time 1: r1 = h1*x1 + h2*x2 + n1
    r2 = h1 .* x3 + h2 .* x4 + n2; % Time 2: r2 = h1*x3 + h2*x4 + n2
    
    % Alamouti Combining (MRC at receiver) - compensates for the 1/sqrt(2) Tx scaling
    s1_hat_combined = (conj(h1) .* r1 + h2 .* conj(r2)) * sqrt(2);
    s2_hat_combined = (conj(h2) .* r1 - h1 .* conj(r2)) * sqrt(2);
    
    % Channel Gain Normalization
    H_squared = abs(h1).^2 + abs(h2).^2;
    s1_rx = s1_hat_combined ./ H_squared;
    s2_rx = s2_hat_combined ./ H_squared;
    
    % Aggregate received symbols
    s_rx_Alamouti = zeros(1, N_symbols);
    s_rx_Alamouti(1:2:end) = s1_rx;
    s_rx_Alamouti(2:2:end) = s2_rx;
    
    % QPSK Demodulation
    bits_rx_I = real(s_rx_Alamouti) > 0;
    bits_rx_Q = imag(s_rx_Alamouti) > 0;
    
    % Interleave bits
    bits_rx_Alamouti = zeros(1, N_bits);
    bits_rx_Alamouti(1:2:end) = bits_rx_I;
    bits_rx_Alamouti(2:2:end) = bits_rx_Q;
    
    % Calculate BER
    BER_Alamouti(ii) = mean(bits_rx_Alamouti ~= bits_tx);
    
    if mod(ii, 3) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', SNR_dB(ii), BER_Alamouti(ii));
    end
end

%% 4. Plot Results
figure('Position', [100, 100, 800, 600]);
semilogy(SNR_dB, BER_Baseline, 'b-o', 'LineWidth', 2, 'MarkerSize', 6); 
hold on;
semilogy(SNR_dB, BER_Alamouti, 'r-s', 'LineWidth', 2, 'MarkerSize', 6);

% --- Added Theoretical Curves for Validation ---
EbNo_lin = 10.^(SNR_dB/10);

% Theoretical BER for 1×1 Rayleigh fading (Diversity Order 1)
BER_theory_1x1 = 0.5 * (1 - sqrt(EbNo_lin ./ (1 + EbNo_lin)));
semilogy(SNR_dB, BER_theory_1x1, 'g--', 'LineWidth', 1.5);

% Theoretical BER for 2×1 Alamouti (Diversity Order 2)
mu = sqrt(EbNo_lin ./ (1 + EbNo_lin));
BER_theory_Alamouti = (0.5 .* (1 - mu)).^2 .* (1 + 2 .* mu);
semilogy(SNR_dB, BER_theory_Alamouti, 'm--', 'LineWidth', 1.5);

% ------------------------------------------------
grid on;
xlabel('SNR (E_b/N_0) [dB]', 'FontSize', 12);
ylabel('Bit Error Rate (BER)', 'FontSize', 12);
title('BER Performance of Alamouti 2×1 STBC vs. Baseline 1×1 (QPSK)', 'FontSize', 14);
legend('Simulated Baseline 1×1', 'Simulated Alamouti 2×1', ...
       'Theoretical Baseline 1×1', 'Theoretical Alamouti 2×1', ...
       'Location', 'southwest', 'FontSize', 11);

% Adjusted y-axis limits to clearly show low BER
xlim([min(SNR_dB) max(SNR_dB)]);
ylim([1e-5 1]);

%% Performance Analysis
fprintf('\n=== PERFORMANCE ANALYSIS ===\n');
fprintf('BER Comparison at Different SNR Values:\n');
fprintf('SNR (dB)\t\tBaseline 1×1\t\tAlamouti 2×1\n');
fprintf('-------------------------------------------------------\n');
for i = 1:3:length(SNR_dB)
    fprintf('%2d\t\t%.4e\t%.4e\n', SNR_dB(i), BER_Baseline(i), BER_Alamouti(i));
end

%% Diversity Gain Analysis
fprintf('\nDiversity Gain Analysis:\n');
fprintf('========================\n');

% Find SNR for target BER = 1e-3
target_ber = 1e-3;
snr_baseline = interp1(BER_Baseline, SNR_dB, target_ber, 'linear', 'extrap');
snr_alamouti = interp1(BER_Alamouti, SNR_dB, target_ber, 'linear', 'extrap');

fprintf('SNR required for BER = %.0e:\n', target_ber);
fprintf('Baseline 1×1: %.2f dB\n', snr_baseline);
fprintf('Alamouti 2×1: %.2f dB\n', snr_alamouti);
fprintf('Alamouti Gain: %.2f dB\n', snr_baseline - snr_alamouti);

% Estimate diversity order from slope at high SNR
high_snr_range = SNR_dB >= 10;
if sum(high_snr_range) >= 3
    p_baseline = polyfit(SNR_dB(high_snr_range), log10(BER_Baseline(high_snr_range)), 1);
    p_alamouti = polyfit(SNR_dB(high_snr_range), log10(BER_Alamouti(high_snr_range)), 1);
    
    div_baseline = -p_baseline(1) * 10/log(10);
    div_alamouti = -p_alamouti(1) * 10/log(10);
    
    fprintf('\nEstimated Diversity Orders (from slope):\n');
    fprintf('Baseline 1×1: %.2f\n', div_baseline);
    fprintf('Alamouti 2×1: %.2f\n', div_alamouti);
    fprintf('Expected Alamouti: 2 (number of transmit antennas)\n');
end

%% QPSK Constellation Analysis
fprintf('\nQPSK Modulation Analysis:\n');
fprintf('=========================\n');
fprintf('Constellation Points: 4\n');
fprintf('Bits per Symbol: 2\n');
fprintf('Symbol Energy: Es = 1 (normalized)\n');
fprintf('Bit Energy: Eb = Es/2 = 0.5\n');
fprintf('Spectral Efficiency: 2 bits/s/Hz\n');

% QPSK constellation mapping
fprintf('\nQPSK Bit-to-Symbol Mapping:\n');
fprintf('00 -> (-1-j)/√2\n');
fprintf('01 -> (-1+j)/√2\n');
fprintf('10 -> (+1-j)/√2\n');
fprintf('11 -> (+1+j)/√2\n');

%% Alamouti Code Analysis for QPSK
fprintf('\nAlamouti STBC for QPSK:\n');
fprintf('=======================\n');
fprintf('Input: Two QPSK symbols s1, s2\n');
fprintf('Code Matrix: [s1  s2 ]\n');
fprintf('             [-s2* s1*]\n');
fprintf('Transmission:\n');
fprintf('  Time 1: Tx1 -> s1, Tx2 -> s2\n');
fprintf('  Time 2: Tx1 -> -s2*, Tx2 -> s1*\n');
fprintf('Properties:\n');
fprintf('  - Orthogonal design: S*S† = (|s1|² + |s2|²)*I\n');
fprintf('  - Full diversity order: 2\n');
fprintf('  - Code rate: 1 (no bandwidth expansion)\n');
fprintf('  - Linear ML decoding complexity\n');

%% Save Results
fprintf('\nSaving results...\n');
save('alamouti_qpsk_results.mat', 'SNR_dB', 'BER_Baseline', 'BER_Alamouti', ...
     'BER_theory_1x1', 'BER_theory_Alamouti', 'N_bits', 'N_symbols', ...
     'target_ber', 'snr_baseline', 'snr_alamouti');

% Export figure
saveas(gcf, 'alamouti_qpsk_ber.png');
saveas(gcf, 'alamouti_qpsk_ber.fig');

fprintf('Analysis complete!\n');
fprintf('Results saved to: alamouti_qpsk_results.mat\n');
fprintf('Figure saved as: alamouti_qpsk_ber.png\n');

%% Additional Visualization: QPSK Constellation and Alamouti Encoding
figure('Position', [200, 200, 1000, 400]);

% QPSK Constellation
subplot(1,3,1);
qpsk_I = [-1, -1, 1, 1]/sqrt(2);
qpsk_Q = [-1, 1, -1, 1]/sqrt(2);
plot(qpsk_I, qpsk_Q, 'bo', 'MarkerSize', 8, 'MarkerFaceColor', 'b');
grid on; axis equal; 
xlim([-1, 1]); ylim([-1, 1]);
xlabel('In-phase (I)'); ylabel('Quadrature (Q)');
title('QPSK Constellation');

% Add bit labels
text(qpsk_I(1)-0.1, qpsk_Q(1)-0.1, '00', 'FontSize', 10);
text(qpsk_I(2)-0.1, qpsk_Q(2)+0.1, '01', 'FontSize', 10);
text(qpsk_I(3)+0.05, qpsk_Q(3)-0.1, '10', 'FontSize', 10);
text(qpsk_I(4)+0.05, qpsk_Q(4)+0.1, '11', 'FontSize', 10);

% Alamouti Encoding Example
subplot(1,3,2);
text(0.1, 0.9, 'Alamouti Encoding:', 'FontSize', 12, 'FontWeight', 'bold');
text(0.1, 0.8, 'Input: s₁, s₂', 'FontSize', 11);
text(0.1, 0.7, 'Time 1: [s₁, s₂]', 'FontSize', 11);
text(0.1, 0.6, 'Time 2: [-s₂*, s₁*]', 'FontSize', 11);
text(0.1, 0.4, 'Code Matrix:', 'FontSize', 11, 'FontWeight', 'bold');
text(0.1, 0.3, '[s₁   s₂ ]', 'FontSize', 11, 'FontFamily', 'monospace');
text(0.1, 0.2, '[-s₂* s₁*]', 'FontSize', 11, 'FontFamily', 'monospace');
title('Space-Time Block Code');
axis([0 1 0 1]); axis off;

% Performance Comparison
subplot(1,3,3);
bar([1, 2], [snr_baseline, snr_alamouti]);
set(gca, 'XTickLabel', {'Baseline 1×1', 'Alamouti 2×1'});
ylabel('SNR (dB) for BER = 10⁻³');
title('SNR Requirement Comparison');
grid on;

% Add values on bars
text(1, snr_baseline + 0.5, sprintf('%.1f dB', snr_baseline), ...
     'HorizontalAlignment', 'center');
text(2, snr_alamouti + 0.5, sprintf('%.1f dB', snr_alamouti), ...
     'HorizontalAlignment', 'center');

sgtitle('QPSK Alamouti STBC Analysis', 'FontSize', 14);

% Save constellation and encoding figure
saveas(gcf, 'qpsk_alamouti_analysis.png');
saveas(gcf, 'qpsk_alamouti_analysis.fig');

fprintf('QPSK analysis figure saved as: qpsk_alamouti_analysis.png\n');

%% Complexity Analysis
fprintf('\nComplexity Analysis:\n');
fprintf('===================\n');
fprintf('Baseline 1×1 System:\n');
fprintf('  - Encoding: Direct QPSK mapping\n');
fprintf('  - Decoding: Zero-forcing equalization\n');
fprintf('  - Complexity: O(1) per symbol\n');
fprintf('  - Diversity: None (order 1)\n\n');

fprintf('Alamouti 2×1 STBC:\n');
fprintf('  - Encoding: Space-time block coding\n');
fprintf('  - Decoding: Linear ML detection\n');
fprintf('  - Complexity: O(M) where M = constellation size\n');
fprintf('  - Diversity: Full transmit diversity (order 2)\n');
fprintf('  - Trade-off: Slight complexity increase for significant gain\n');