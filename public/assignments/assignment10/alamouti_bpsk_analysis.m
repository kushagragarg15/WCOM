% Alamouti Space-Time Block Coding with BPSK
% Assignment 10 - Part 1: Normal 2×1 MISO vs Alamouti 2×1 STBC (BPSK)

clc; clear; close all;

% System Parameters
N = 1e5;                    % Number of bits
SNR_dB = 0:2:20;           % SNR range in dB
BER_normal = zeros(size(SNR_dB));
BER_stbc = zeros(size(SNR_dB));

fprintf('=== ALAMOUTI SPACE-TIME BLOCK CODING ANALYSIS (BPSK) ===\n');
fprintf('Modulation: BPSK\n');
fprintf('Channel: Rayleigh Fading\n');
fprintf('Number of bits: %d\n', N);
fprintf('SNR Range: %d to %d dB\n\n', SNR_dB(1), SNR_dB(end));

% Generate random bits and BPSK mapping
bits = randi([0 1], N, 1);
s = 2*bits - 1;  % BPSK mapping: 0 -> -1, 1 -> +1

%% ============ NORMAL 2×1 MISO (Repetition with Power Normalization) ============
fprintf('Computing Normal 2×1 MISO (Repetition Coding)...\n');
for ii = 1:length(SNR_dB)
    snr_lin = 10^(SNR_dB(ii)/10);
    noise_var = 1/(2*snr_lin); % Per dimension (complex noise)
    
    % Rayleigh fading channels
    h1 = (randn(N,1)+1j*randn(N,1))/sqrt(2);
    h2 = (randn(N,1)+1j*randn(N,1))/sqrt(2);
    
    % Power normalization: split power between both antennas
    tx = s/sqrt(2);
    
    % Received signal (both antennas transmit same symbol)
    noise = sqrt(noise_var)*(randn(N,1)+1j*randn(N,1));
    r = h1.*tx + h2.*tx + noise;
    
    % MRC combining
    h_combined = h1 + h2;
    y = conj(h_combined).*r ./ (abs(h_combined).^2);
    
    % Decision
    recv_bits = real(y) > 0;
    BER_normal(ii) = mean(recv_bits ~= bits);
    
    if mod(ii, 3) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', SNR_dB(ii), BER_normal(ii));
    end
end

%% ========================= 2×1 STBC Alamouti ==============================
fprintf('\nComputing Alamouti 2×1 STBC...\n');

% Alamouti encoding: process symbols in pairs
s1 = s(1:2:end);
s2 = s(2:2:end);

for ii = 1:length(SNR_dB)
    snr_lin = 10^(SNR_dB(ii)/10);
    noise_var = 1/(2*snr_lin);
    
    % Rayleigh channel (constant for two time slots)
    h1 = (randn(length(s1),1)+1j*randn(length(s1),1))/sqrt(2);
    h2 = (randn(length(s1),1)+1j*randn(length(s1),1))/sqrt(2);
    
    % Alamouti Space-Time Block Code:
    % Time 1: [s1, s2] transmitted from [Tx1, Tx2]
    % Time 2: [-s2*, s1*] transmitted from [Tx1, Tx2]
    
    % Power normalization (two antennas active)
    x1 = s1/sqrt(2);        % Tx1 at time 1
    x2 = s2/sqrt(2);        % Tx2 at time 1
    x3 = -conj(s2)/sqrt(2); % Tx1 at time 2
    x4 = conj(s1)/sqrt(2);  % Tx2 at time 2
    
    % Noise for two time slots
    n1 = sqrt(noise_var)*(randn(length(s1),1)+1j*randn(length(s1),1));
    n2 = sqrt(noise_var)*(randn(length(s1),1)+1j*randn(length(s1),1));
    
    % Received signals
    r1 = h1.*x1 + h2.*x2 + n1;  % Time 1: r1 = h1*s1 + h2*s2 + n1
    r2 = h1.*x3 + h2.*x4 + n2;  % Time 2: r2 = h1*(-s2*) + h2*s1* + n2
    
    % Alamouti combining (Maximum Likelihood decoding)
    y1 = conj(h1).*r1 + h2.*conj(r2);
    y2 = conj(h2).*r1 - h1.*conj(r2);
    
    % Channel energy normalization
    h_eq = abs(h1).^2 + abs(h2).^2;
    y1 = y1 ./ h_eq;
    y2 = y2 ./ h_eq;
    
    % Reconstruct received bits
    recv_bits = zeros(N,1);
    recv_bits(1:2:end) = real(y1) > 0;
    recv_bits(2:2:end) = real(y2) > 0;
    
    % Calculate BER
    BER_stbc(ii) = mean(recv_bits ~= bits);
    
    if mod(ii, 3) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', SNR_dB(ii), BER_stbc(ii));
    end
end

%% ============================ PLOT RESULTS ==============================
figure('Position', [100, 100, 800, 600]);
semilogy(SNR_dB, BER_normal, 'b-s', 'LineWidth', 2, 'MarkerSize', 6); 
hold on;
semilogy(SNR_dB, BER_stbc, 'r-o', 'LineWidth', 2, 'MarkerSize', 6);

grid on;
xlabel('SNR (dB)', 'FontSize', 12);
ylabel('BER', 'FontSize', 12);
title('BER Comparison: Normal 2×1 MISO Vs Alamouti 2×1 STBC (BPSK)', 'FontSize', 14);
legend('Normal 2×1 MISO', 'Alamouti 2×1 STBC', 'Location', 'southwest', 'FontSize', 11);

% Set axis limits
xlim([SNR_dB(1), SNR_dB(end)]);
ylim([1e-5, 1]);

%% Performance Analysis
fprintf('\n=== PERFORMANCE ANALYSIS ===\n');
fprintf('BER Comparison at Different SNR Values:\n');
fprintf('SNR (dB)\t\tNormal MISO\t\tAlamouti STBC\n');
fprintf('-------------------------------------------------------\n');
for i = 1:3:length(SNR_dB)
    fprintf('%2d\t\t%.4e\t%.4e\n', SNR_dB(i), BER_normal(i), BER_stbc(i));
end

%% Diversity Gain Analysis
fprintf('\nDiversity Gain Analysis:\n');
fprintf('========================\n');

% Find SNR for target BER = 1e-3
target_ber = 1e-3;
snr_normal = interp1(BER_normal, SNR_dB, target_ber, 'linear', 'extrap');
snr_stbc = interp1(BER_stbc, SNR_dB, target_ber, 'linear', 'extrap');

fprintf('SNR required for BER = %.0e:\n', target_ber);
fprintf('Normal MISO: %.2f dB\n', snr_normal);
fprintf('Alamouti STBC: %.2f dB\n', snr_stbc);
fprintf('Alamouti Gain: %.2f dB\n', snr_normal - snr_stbc);

% Estimate diversity order from slope at high SNR
high_snr_range = SNR_dB >= 10;
if sum(high_snr_range) >= 3
    p_normal = polyfit(SNR_dB(high_snr_range), log10(BER_normal(high_snr_range)), 1);
    p_stbc = polyfit(SNR_dB(high_snr_range), log10(BER_stbc(high_snr_range)), 1);
    
    div_normal = -p_normal(1) * 10/log(10);
    div_stbc = -p_stbc(1) * 10/log(10);
    
    fprintf('\nEstimated Diversity Orders (from slope):\n');
    fprintf('Normal MISO: %.2f\n', div_normal);
    fprintf('Alamouti STBC: %.2f\n', div_stbc);
    fprintf('Expected Alamouti: 2 (number of transmit antennas)\n');
end

%% Alamouti Code Properties
fprintf('\nAlamouti Space-Time Block Code Properties:\n');
fprintf('=========================================\n');
fprintf('Code Matrix: [s1  s2 ]\n');
fprintf('             [-s2* s1*]\n');
fprintf('Orthogonality: S*S† = (|s1|² + |s2|²)*I\n');
fprintf('Code Rate: 1 (2 symbols in 2 time slots)\n');
fprintf('Diversity Order: 2 (full transmit diversity)\n');
fprintf('Decoding Complexity: Linear (O(M) instead of O(M²))\n');
fprintf('Channel Knowledge: CSI required at receiver only\n');

%% Theoretical BER (for validation)
fprintf('\nTheoretical BER Analysis:\n');
fprintf('=========================\n');

% Theoretical BER for BPSK in Rayleigh fading
EbNo_lin = 10.^(SNR_dB/10);

% 1x1 SISO Rayleigh fading
BER_theory_1x1 = 0.5 * (1 - sqrt(EbNo_lin ./ (1 + EbNo_lin)));

% 2x1 Alamouti (diversity order 2)
mu = sqrt(EbNo_lin ./ (1 + EbNo_lin));
BER_theory_alamouti = (0.5 .* (1 - mu)).^2 .* (1 + 2 .* mu);

% Add theoretical curves to plot
semilogy(SNR_dB, BER_theory_1x1, 'g--', 'LineWidth', 1.5);
semilogy(SNR_dB, BER_theory_alamouti, 'm--', 'LineWidth', 1.5);

legend('Normal 2×1 MISO', 'Alamouti 2×1 STBC', 'Theory 1×1', 'Theory Alamouti', ...
       'Location', 'southwest', 'FontSize', 11);

fprintf('Theoretical curves added to plot for validation.\n');

%% System Complexity Comparison
fprintf('\nComplexity Comparison:\n');
fprintf('=====================\n');
fprintf('Normal MISO:\n');
fprintf('  - Encoding: Simple repetition\n');
fprintf('  - Decoding: MRC combining\n');
fprintf('  - Complexity: Very low\n');
fprintf('  - Performance: Limited diversity\n\n');

fprintf('Alamouti STBC:\n');
fprintf('  - Encoding: Space-time block coding\n');
fprintf('  - Decoding: Linear ML detection\n');
fprintf('  - Complexity: Low to moderate\n');
fprintf('  - Performance: Full transmit diversity\n');

%% Save Results
fprintf('\nSaving results...\n');
save('alamouti_bpsk_results.mat', 'SNR_dB', 'BER_normal', 'BER_stbc', ...
     'BER_theory_1x1', 'BER_theory_alamouti', 'N', 'target_ber', ...
     'snr_normal', 'snr_stbc');

% Export figure
saveas(gcf, 'alamouti_bpsk_ber.png');
saveas(gcf, 'alamouti_bpsk_ber.fig');

fprintf('Analysis complete!\n');
fprintf('Results saved to: alamouti_bpsk_results.mat\n');
fprintf('Figure saved as: alamouti_bpsk_ber.png\n');

%% Additional Analysis: Code Matrix Visualization
figure('Position', [200, 200, 600, 400]);

% Alamouti encoding example
subplot(2,2,1);
text(0.1, 0.8, 'Input Symbols:', 'FontSize', 12, 'FontWeight', 'bold');
text(0.1, 0.6, 's₁ = +1', 'FontSize', 11);
text(0.1, 0.4, 's₂ = -1', 'FontSize', 11);
title('Example Input', 'FontSize', 12);
axis([0 1 0 1]); axis off;

subplot(2,2,2);
text(0.1, 0.8, 'Alamouti Matrix:', 'FontSize', 12, 'FontWeight', 'bold');
text(0.1, 0.6, '[+1  -1]', 'FontSize', 11, 'FontFamily', 'monospace');
text(0.1, 0.4, '[+1  +1]', 'FontSize', 11, 'FontFamily', 'monospace');
title('Space-Time Code', 'FontSize', 12);
axis([0 1 0 1]); axis off;

subplot(2,2,3);
text(0.1, 0.8, 'Time 1:', 'FontSize', 12, 'FontWeight', 'bold');
text(0.1, 0.6, 'Tx1 → +1', 'FontSize', 11);
text(0.1, 0.4, 'Tx2 → -1', 'FontSize', 11);
title('First Time Slot', 'FontSize', 12);
axis([0 1 0 1]); axis off;

subplot(2,2,4);
text(0.1, 0.8, 'Time 2:', 'FontSize', 12, 'FontWeight', 'bold');
text(0.1, 0.6, 'Tx1 → +1', 'FontSize', 11);
text(0.1, 0.4, 'Tx2 → +1', 'FontSize', 11);
title('Second Time Slot', 'FontSize', 12);
axis([0 1 0 1]); axis off;

sgtitle('Alamouti STBC Encoding Example (BPSK)', 'FontSize', 14);

% Save encoding example
saveas(gcf, 'alamouti_encoding_example.png');
saveas(gcf, 'alamouti_encoding_example.fig');

fprintf('Encoding example saved as: alamouti_encoding_example.png\n');