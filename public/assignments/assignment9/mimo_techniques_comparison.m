% MIMO Techniques Comparison
% Assignment 9 - Part 2: SIMO vs MISO vs MIMO with BPSK in Rayleigh Fading

clc; clear; close all;

% Parameters
EbN0_dB = 0:2:20;           % SNR range in dB
EbN0 = 10.^(EbN0_dB/10);    % Linear SNR
N = 1e5;                    % Number of bits

% Initialize BER arrays
ber_simo = zeros(size(EbN0));
ber_miso = zeros(size(EbN0));
ber_mimo = zeros(size(EbN0));

fprintf('=== MIMO TECHNIQUES COMPARISON ===\n');
fprintf('Modulation: BPSK\n');
fprintf('Channel: Rayleigh Fading\n');
fprintf('Number of bits: %d\n', N);
fprintf('SNR Range: %d to %d dB\n\n', EbN0_dB(1), EbN0_dB(end));

%% ------------------- (1) SIMO 1x2 - MRC with BPSK -------------------
fprintf('Computing SIMO (1x2) with Maximum Ratio Combining...\n');
for k = 1:length(EbN0)
    % Generate random bits and BPSK symbols
    bits = randi([0 1], 1, N);     % Random bits
    tx = 2*bits - 1;               % BPSK mapping: 0->-1, 1->+1
    
    % Rayleigh fading channels for 2 receive antennas
    % h ~ CN(0,1) complex Gaussian distribution
    h1 = (randn(1, N) + 1i*randn(1, N)) / sqrt(2);
    h2 = (randn(1, N) + 1i*randn(1, N)) / sqrt(2);
    
    % AWGN noise with variance 1/(2*SNR)
    noise1 = sqrt(1/(2*EbN0(k))) * (randn(1, N) + 1i*randn(1, N));
    noise2 = sqrt(1/(2*EbN0(k))) * (randn(1, N) + 1i*randn(1, N));
    
    % Received signals: r = h*s + n
    r1 = h1.*tx + noise1;
    r2 = h2.*tx + noise2;
    
    % Maximum Ratio Combining (MRC)
    % Optimal weights: w_i = h_i*
    r_combined = conj(h1).*r1 + conj(h2).*r2;
    
    % Decision: real part > 0 -> bit 1, else bit 0
    bits_hat = real(r_combined) > 0;
    
    % Calculate BER
    ber_simo(k) = sum(bits ~= bits_hat) / N;
    
    if mod(k, 3) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', EbN0_dB(k), ber_simo(k));
    end
end

%% ------------------- (2) MISO 2x1 - Alamouti STBC -------------------
fprintf('\nComputing MISO (2x1) with Alamouti Space-Time Block Coding...\n');
for k = 1:length(EbN0)
    % Generate random bits and BPSK symbols
    bits = randi([0 1], 1, N);
    tx = 2*bits - 1;               % BPSK mapping
    
    % Alamouti encoding: transmit symbols in pairs
    s1 = tx(1:2:end);             % Odd-indexed symbols
    s2 = tx(2:2:end);             % Even-indexed symbols
    L = length(s1);               % Number of symbol pairs
    
    % Rayleigh fading channels from 2 transmit antennas to 1 receive antenna
    h1 = (randn(1, L) + 1i*randn(1, L)) / sqrt(2);  % Tx1 -> Rx
    h2 = (randn(1, L) + 1i*randn(1, L)) / sqrt(2);  % Tx2 -> Rx
    
    % Alamouti Space-Time Block Code:
    % Time 1: Tx1 sends s1, Tx2 sends s2
    % Time 2: Tx1 sends -s2*, Tx2 sends s1*
    
    % Received signals at two time slots
    r1 = h1.*s1 + h2.*s2 + sqrt(1/(2*EbN0(k))) * (randn(1, L) + 1i*randn(1, L));
    r2 = -conj(h2).*s1 + conj(h1).*s2 + sqrt(1/(2*EbN0(k))) * (randn(1, L) + 1i*randn(1, L));
    
    % Alamouti decoding (ML detection)
    s1_hat = conj(h1).*r1 + h2.*conj(r2);
    s2_hat = conj(h2).*r1 - h1.*conj(r2);
    
    % Reconstruct bit sequence and make decisions
    bits_rx = real([s1_hat s2_hat]) > 0;
    
    % Calculate BER (only for transmitted bits)
    ber_miso(k) = sum(bits(1:length(bits_rx)) ~= bits_rx) / length(bits_rx);
    
    if mod(k, 3) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', EbN0_dB(k), ber_miso(k));
    end
end

%% ------------------- (3) MIMO 2x2 - Alamouti STBC -------------------
fprintf('\nComputing MIMO (2x2) with Alamouti Space-Time Block Coding...\n');
for k = 1:length(EbN0)
    % Generate random bits and BPSK symbols
    bits = randi([0 1], 1, N);
    tx = 2*bits - 1;
    
    % Alamouti encoding
    s1 = tx(1:2:end);
    s2 = tx(2:2:end);
    L = length(s1);
    
    % 2x2 MIMO channel matrix
    % H = [h11 h12; h21 h22]
    h11 = (randn(1, L) + 1i*randn(1, L)) / sqrt(2);  % Tx1 -> Rx1
    h12 = (randn(1, L) + 1i*randn(1, L)) / sqrt(2);  % Tx2 -> Rx1
    h21 = (randn(1, L) + 1i*randn(1, L)) / sqrt(2);  % Tx1 -> Rx2
    h22 = (randn(1, L) + 1i*randn(1, L)) / sqrt(2);  % Tx2 -> Rx2
    
    % Received signals at Rx1 and Rx2 (two time slots each)
    % Time 1: [s1 s2] transmitted
    r1_t1 = h11.*s1 + h12.*s2 + sqrt(1/(2*EbN0(k))) * (randn(1, L) + 1i*randn(1, L));
    r2_t1 = h21.*s1 + h22.*s2 + sqrt(1/(2*EbN0(k))) * (randn(1, L) + 1i*randn(1, L));
    
    % Time 2: [-s2* s1*] transmitted
    r1_t2 = -h12.*conj(s2) + h11.*conj(s1) + sqrt(1/(2*EbN0(k))) * (randn(1, L) + 1i*randn(1, L));
    r2_t2 = -h22.*conj(s2) + h21.*conj(s1) + sqrt(1/(2*EbN0(k))) * (randn(1, L) + 1i*randn(1, L));
    
    % Alamouti combining (MRC across receive antennas)
    s1_hat = conj(h11).*r1_t1 + h12.*conj(r1_t2) + conj(h21).*r2_t1 + h22.*conj(r2_t2);
    s2_hat = conj(h12).*r1_t1 - h11.*conj(r1_t2) + conj(h22).*r2_t1 - h21.*conj(r2_t2);
    
    % Make decisions and reconstruct bits
    bits_rx = real([s1_hat s2_hat]) > 0;
    
    % Calculate BER
    ber_mimo(k) = sum(bits(1:length(bits_rx)) ~= bits_rx) / length(bits_rx);
    
    if mod(k, 3) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', EbN0_dB(k), ber_mimo(k));
    end
end

%% ------------------- Plot the Results -------------------
figure('Position', [100, 100, 800, 600]);
semilogy(EbN0_dB, ber_simo, 'b-o', 'LineWidth', 2, 'MarkerSize', 6); 
hold on;
semilogy(EbN0_dB, ber_miso, 'r-s', 'LineWidth', 2, 'MarkerSize', 6);
semilogy(EbN0_dB, ber_mimo, 'g-^', 'LineWidth', 2, 'MarkerSize', 6);

grid on; 
xlabel('E_b/N_0 (dB)', 'FontSize', 12); 
ylabel('Bit Error Rate (BER)', 'FontSize', 12);
title('SIMO vs MISO vs MIMO (BPSK - Rayleigh Channel)', 'FontSize', 14);
legend('1x2 SIMO (MRC)', '2x1 MISO (Alamouti)', '2x2 MIMO (Alamouti)', ...
       'Location', 'southwest', 'FontSize', 11);

% Set axis limits
xlim([EbN0_dB(1), EbN0_dB(end)]);
ylim([1e-5, 1]);

%% Performance Analysis
fprintf('\n=== PERFORMANCE ANALYSIS ===\n');
fprintf('BER Comparison at Different SNR Values:\n');
fprintf('SNR (dB)\t\tSIMO\t\t\tMISO\t\t\tMIMO\n');
fprintf('---------------------------------------------------------------\n');
for i = 1:3:length(EbN0_dB)
    fprintf('%2d\t\t%.4e\t%.4e\t%.4e\n', ...
            EbN0_dB(i), ber_simo(i), ber_miso(i), ber_mimo(i));
end

%% Diversity Gain Analysis
fprintf('\nDiversity Gain Analysis:\n');
fprintf('========================\n');

% Find SNR for target BER = 1e-3
target_ber = 1e-3;
snr_simo = interp1(ber_simo, EbN0_dB, target_ber, 'linear', 'extrap');
snr_miso = interp1(ber_miso, EbN0_dB, target_ber, 'linear', 'extrap');
snr_mimo = interp1(ber_mimo, EbN0_dB, target_ber, 'linear', 'extrap');

fprintf('SNR required for BER = %.0e:\n', target_ber);
fprintf('SIMO (1x2): %.2f dB\n', snr_simo);
fprintf('MISO (2x1): %.2f dB\n', snr_miso);
fprintf('MIMO (2x2): %.2f dB\n', snr_mimo);

fprintf('\nDiversity Gain compared to SISO (estimated):\n');
fprintf('SIMO: ~%.1f dB gain\n', 3.0); % Typical diversity gain
fprintf('MISO: ~%.1f dB gain\n', 3.0);
fprintf('MIMO: ~%.1f dB gain\n', 3.0);

%% Theoretical Analysis
fprintf('\nTheoretical Diversity Orders:\n');
fprintf('============================\n');
fprintf('SIMO (1x2): Diversity order = 2 (number of receive antennas)\n');
fprintf('MISO (2x1): Diversity order = 2 (Alamouti provides full diversity)\n');
fprintf('MIMO (2x2): Diversity order = 2 (limited by Alamouti code rate)\n');

% Estimate diversity order from slope at high SNR
high_snr_range = EbN0_dB >= 10;
if sum(high_snr_range) >= 3
    p_simo = polyfit(EbN0_dB(high_snr_range), log10(ber_simo(high_snr_range)), 1);
    p_miso = polyfit(EbN0_dB(high_snr_range), log10(ber_miso(high_snr_range)), 1);
    p_mimo = polyfit(EbN0_dB(high_snr_range), log10(ber_mimo(high_snr_range)), 1);
    
    div_simo = -p_simo(1) * 10/log(10);
    div_miso = -p_miso(1) * 10/log(10);
    div_mimo = -p_mimo(1) * 10/log(10);
    
    fprintf('\nEstimated Diversity Orders (from slope):\n');
    fprintf('SIMO: %.2f\n', div_simo);
    fprintf('MISO: %.2f\n', div_miso);
    fprintf('MIMO: %.2f\n', div_mimo);
end

%% Alamouti Code Properties
fprintf('\nAlamouti Space-Time Block Code Properties:\n');
fprintf('=========================================\n');
fprintf('Code Rate: 1 (2 symbols transmitted in 2 time slots)\n');
fprintf('Diversity Gain: Full diversity = min(Nt, Nr)\n');
fprintf('Decoding: Linear processing (low complexity)\n');
fprintf('Orthogonality: Code matrix is orthogonal\n');
fprintf('Channel Knowledge: Requires channel state information at receiver\n');

%% System Complexity Comparison
fprintf('\nComplexity Comparison:\n');
fprintf('=====================\n');
fprintf('SIMO: Low - Simple MRC combining\n');
fprintf('MISO: Medium - Alamouti encoding/decoding\n');
fprintf('MIMO: High - Both STBC and spatial processing\n');

%% Save Results
fprintf('\nSaving results...\n');
save('mimo_techniques_results.mat', 'EbN0_dB', 'ber_simo', 'ber_miso', ...
     'ber_mimo', 'N', 'target_ber', 'snr_simo', 'snr_miso', 'snr_mimo');

% Export figure
saveas(gcf, 'mimo_techniques_ber.png');
saveas(gcf, 'mimo_techniques_ber.fig');

fprintf('Analysis complete!\n');
fprintf('Results saved to: mimo_techniques_results.mat\n');
fprintf('Figure saved as: mimo_techniques_ber.png\n');

%% Additional Visualization: System Block Diagrams
figure('Position', [200, 200, 1200, 400]);

% SIMO System
subplot(1,3,1);
text(0.1, 0.8, 'Tx', 'FontSize', 12, 'HorizontalAlignment', 'center');
rectangle('Position', [0.05, 0.75, 0.1, 0.1], 'FaceColor', 'lightblue');

text(0.5, 0.9, 'Rx1', 'FontSize', 10, 'HorizontalAlignment', 'center');
text(0.5, 0.7, 'Rx2', 'FontSize', 10, 'HorizontalAlignment', 'center');
rectangle('Position', [0.45, 0.85, 0.1, 0.08], 'FaceColor', 'lightgreen');
rectangle('Position', [0.45, 0.65, 0.1, 0.08], 'FaceColor', 'lightgreen');

text(0.8, 0.8, 'MRC', 'FontSize', 10, 'HorizontalAlignment', 'center');
rectangle('Position', [0.75, 0.75, 0.1, 0.1], 'FaceColor', 'yellow');

% Draw connections
line([0.15, 0.45], [0.85, 0.89], 'Color', 'black');
line([0.15, 0.45], [0.75, 0.69], 'Color', 'black');
line([0.55, 0.75], [0.89, 0.85], 'Color', 'black');
line([0.55, 0.75], [0.69, 0.75], 'Color', 'black');

title('SIMO (1×2)', 'FontSize', 12);
axis([0 1 0.5 1]); axis off;

% MISO System
subplot(1,3,2);
text(0.1, 0.9, 'Tx1', 'FontSize', 10, 'HorizontalAlignment', 'center');
text(0.1, 0.7, 'Tx2', 'FontSize', 10, 'HorizontalAlignment', 'center');
rectangle('Position', [0.05, 0.85, 0.1, 0.08], 'FaceColor', 'lightblue');
rectangle('Position', [0.05, 0.65, 0.1, 0.08], 'FaceColor', 'lightblue');

text(0.35, 0.8, 'STBC', 'FontSize', 9, 'HorizontalAlignment', 'center');
rectangle('Position', [0.3, 0.75, 0.1, 0.1], 'FaceColor', 'orange');

text(0.8, 0.8, 'Rx', 'FontSize', 12, 'HorizontalAlignment', 'center');
rectangle('Position', [0.75, 0.75, 0.1, 0.1], 'FaceColor', 'lightgreen');

% Draw connections
line([0.15, 0.3], [0.89, 0.85], 'Color', 'black');
line([0.15, 0.3], [0.69, 0.75], 'Color', 'black');
line([0.4, 0.75], [0.8, 0.8], 'Color', 'black');

title('MISO (2×1)', 'FontSize', 12);
axis([0 1 0.5 1]); axis off;

% MIMO System
subplot(1,3,3);
text(0.1, 0.9, 'Tx1', 'FontSize', 10, 'HorizontalAlignment', 'center');
text(0.1, 0.7, 'Tx2', 'FontSize', 10, 'HorizontalAlignment', 'center');
rectangle('Position', [0.05, 0.85, 0.1, 0.08], 'FaceColor', 'lightblue');
rectangle('Position', [0.05, 0.65, 0.1, 0.08], 'FaceColor', 'lightblue');

text(0.35, 0.8, 'STBC', 'FontSize', 9, 'HorizontalAlignment', 'center');
rectangle('Position', [0.3, 0.75, 0.1, 0.1], 'FaceColor', 'orange');

text(0.65, 0.9, 'Rx1', 'FontSize', 10, 'HorizontalAlignment', 'center');
text(0.65, 0.7, 'Rx2', 'FontSize', 10, 'HorizontalAlignment', 'center');
rectangle('Position', [0.6, 0.85, 0.1, 0.08], 'FaceColor', 'lightgreen');
rectangle('Position', [0.6, 0.65, 0.1, 0.08], 'FaceColor', 'lightgreen');

text(0.9, 0.8, 'Comb', 'FontSize', 9, 'HorizontalAlignment', 'center');
rectangle('Position', [0.85, 0.75, 0.1, 0.1], 'FaceColor', 'yellow');

% Draw connections (simplified)
line([0.4, 0.6], [0.85, 0.89], 'Color', 'black');
line([0.4, 0.6], [0.75, 0.69], 'Color', 'black');
line([0.7, 0.85], [0.89, 0.85], 'Color', 'black');
line([0.7, 0.85], [0.69, 0.75], 'Color', 'black');

title('MIMO (2×2)', 'FontSize', 12);
axis([0 1 0.5 1]); axis off;

sgtitle('MIMO System Configurations', 'FontSize', 14);

% Save system diagram
saveas(gcf, 'mimo_system_diagrams.png');
saveas(gcf, 'mimo_system_diagrams.fig');

fprintf('System diagrams saved as: mimo_system_diagrams.png\n');