% Diversity Combining Techniques Analysis
% Assignment 8: Selection Combining (SC), Equal Gain Combining (EGC), Maximum Ratio Combining (MRC)

clc; clear; close all;

% System Parameters
Mt = 1;                    % Number of transmit antennas
Mr = 2;                    % Number of receive antennas
numBits = 1e5;            % Number of bits to simulate
SNRdB = 0:2:35;           % SNR range in dB

% Initialize BER arrays
BER_SC = zeros(size(SNRdB));
BER_EGC = zeros(size(SNRdB));
BER_MRC = zeros(size(SNRdB));

% Generate channel coefficients (same for all SNR values for fair comparison)
h = (randn(Mr, numBits) + 1j*randn(Mr, numBits))/sqrt(2);

fprintf('Starting Diversity Combining Analysis...\n');
fprintf('Configuration: %dx%d (Mt x Mr)\n', Mt, Mr);
fprintf('Number of bits: %d\n', numBits);
fprintf('SNR range: %d to %d dB\n\n', SNRdB(1), SNRdB(end));

%% Selection Combining (SC)
fprintf('Computing Selection Combining (SC)...\n');
for i = 1:length(SNRdB)
    snr = 10^(SNRdB(i)/10);
    
    % Generate random bits and BPSK symbols
    bits = randi([0 1], 1, numBits);
    x = 2*bits - 1;  % BPSK modulation
    
    % Generate noise
    n = (randn(Mr, numBits) + 1j*randn(Mr, numBits))/sqrt(2*snr);
    
    % Received signal
    y = h.*x + n;
    
    % Selection Combining: Choose branch with maximum |h|^2
    [~, best] = max(abs(h).^2);
    idx = sub2ind(size(y), best, 1:numBits);
    y_best = y(idx);
    h_best = h(idx);
    
    % Zero-forcing equalization and detection
    xhat = real(y_best ./ h_best) > 0;
    
    % Calculate BER
    BER_SC(i) = mean(xhat ~= bits);
    
    if mod(i, 5) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', SNRdB(i), BER_SC(i));
    end
end

%% Equal Gain Combining (EGC)
fprintf('\nComputing Equal Gain Combining (EGC)...\n');
for i = 1:length(SNRdB)
    snr = 10^(SNRdB(i)/10);
    
    % Generate random bits and BPSK symbols
    bits = randi([0 1], 1, numBits);
    x = 2*bits - 1;  % BPSK modulation
    
    % Generate noise
    n = (randn(Mr, numBits) + 1j*randn(Mr, numBits))/sqrt(2*snr);
    
    % Received signal
    y = h.*x + n;
    
    % Equal Gain Combining: Equal weights with phase correction
    y_egc = sum(y .* exp(-1j*angle(h)), 1);
    
    % Detection
    xhat = real(y_egc) > 0;
    
    % Calculate BER
    BER_EGC(i) = mean(xhat ~= bits);
    
    if mod(i, 5) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', SNRdB(i), BER_EGC(i));
    end
end

%% Maximum Ratio Combining (MRC)
fprintf('\nComputing Maximum Ratio Combining (MRC)...\n');
for i = 1:length(SNRdB)
    snr = 10^(SNRdB(i)/10);
    
    % Generate random bits and BPSK symbols
    bits = randi([0 1], 1, numBits);
    x = 2*bits - 1;  % BPSK modulation
    
    % Generate noise
    n = (randn(Mr, numBits) + 1j*randn(Mr, numBits))/sqrt(2*snr);
    
    % Received signal
    y = h.*x + n;
    
    % Maximum Ratio Combining: Optimal weights
    y_mrc = sum(conj(h).*y, 1);
    h_eq = sum(abs(h).^2, 1);
    
    % Detection
    xhat = real(y_mrc./h_eq) > 0;
    
    % Calculate BER
    BER_MRC(i) = mean(xhat ~= bits);
    
    if mod(i, 5) == 0
        fprintf('  SNR = %2d dB, BER = %.4e\n', SNRdB(i), BER_MRC(i));
    end
end

%% Plot Results
figure('Position', [100, 100, 800, 600]);
semilogy(SNRdB, BER_SC, 'r-o', 'LineWidth', 2, 'MarkerSize', 6);
hold on;
semilogy(SNRdB, BER_EGC, 'b-s', 'LineWidth', 2, 'MarkerSize', 6);
semilogy(SNRdB, BER_MRC, 'c-^', 'LineWidth', 2, 'MarkerSize', 6);

grid on;
xlabel('SNR (dB)', 'FontSize', 12);
ylabel('BER', 'FontSize', 12);
title(['Performance Comparison (M_t = ', num2str(Mt), ', M_r = ', num2str(Mr), ')'], 'FontSize', 14);
legend('Selection Combining (SC)', 'Equal Gain Combining (EGC)', 'Maximal Ratio Combining (MRC)', ...
       'Location', 'southwest', 'FontSize', 11);

% Set axis limits for better visualization
xlim([SNRdB(1), SNRdB(end)]);
ylim([1e-5, 1e-1]);

%% Performance Analysis
fprintf('\n=== PERFORMANCE ANALYSIS ===\n');
fprintf('BER Comparison at Different SNR Values:\n');
fprintf('SNR (dB)\t\tSC\t\t\tEGC\t\t\tMRC\n');
fprintf('-------------------------------------------------------\n');
for i = 1:5:length(SNRdB)
    fprintf('%2d\t\t%.4e\t%.4e\t%.4e\n', SNRdB(i), BER_SC(i), BER_EGC(i), BER_MRC(i));
end

% Calculate diversity gains
fprintf('\nDiversity Gain Analysis:\n');
fprintf('========================\n');

% Find SNR for target BER = 1e-3
target_ber = 1e-3;
snr_sc = interp1(BER_SC, SNRdB, target_ber, 'linear', 'extrap');
snr_egc = interp1(BER_EGC, SNRdB, target_ber, 'linear', 'extrap');
snr_mrc = interp1(BER_MRC, SNRdB, target_ber, 'linear', 'extrap');

fprintf('SNR required for BER = 1e-3:\n');
fprintf('  SC:  %.2f dB\n', snr_sc);
fprintf('  EGC: %.2f dB\n', snr_egc);
fprintf('  MRC: %.2f dB\n', snr_mrc);

fprintf('\nSNR Gain of MRC over other techniques:\n');
fprintf('  MRC vs SC:  %.2f dB\n', snr_sc - snr_mrc);
fprintf('  MRC vs EGC: %.2f dB\n', snr_egc - snr_mrc);

% Estimate diversity order from slope
high_snr_range = SNRdB >= 15;
if sum(high_snr_range) >= 3
    % Fit linear regression to log(BER) vs SNR
    p_sc = polyfit(SNRdB(high_snr_range), log10(BER_SC(high_snr_range)), 1);
    p_egc = polyfit(SNRdB(high_snr_range), log10(BER_EGC(high_snr_range)), 1);
    p_mrc = polyfit(SNRdB(high_snr_range), log10(BER_MRC(high_snr_range)), 1);
    
    diversity_sc = -p_sc(1) * 10/log(10);  % Convert to natural log
    diversity_egc = -p_egc(1) * 10/log(10);
    diversity_mrc = -p_mrc(1) * 10/log(10);
    
    fprintf('\nEstimated Diversity Orders:\n');
    fprintf('  SC:  %.2f\n', diversity_sc);
    fprintf('  EGC: %.2f\n', diversity_egc);
    fprintf('  MRC: %.2f\n', diversity_mrc);
    fprintf('  Expected: %.0f (number of receive antennas)\n', Mr);
end

%% Theoretical BER for comparison (MRC in Rayleigh fading)
% For BPSK with MRC in Rayleigh fading:
% BER = (1/2)^Mr * sum_{k=0}^{Mr-1} C(Mr-1+k,k) * (1+gamma_avg)^(-k)
% Simplified approximation for high SNR: BER ≈ (1/(4*gamma_avg))^Mr

gamma_avg = 10.^(SNRdB/10);
BER_theory_MRC = zeros(size(SNRdB));

for i = 1:length(SNRdB)
    gamma = gamma_avg(i);
    ber_sum = 0;
    for k = 0:Mr-1
        ber_sum = ber_sum + nchoosek(Mr-1+k, k) * (1+gamma)^(-k);
    end
    BER_theory_MRC(i) = (0.5)^Mr * ber_sum;
end

% Add theoretical curve to plot
semilogy(SNRdB, BER_theory_MRC, 'c--', 'LineWidth', 1.5);
legend('Selection Combining (SC)', 'Equal Gain Combining (EGC)', 'Maximal Ratio Combining (MRC)', ...
       'MRC (Theory)', 'Location', 'southwest', 'FontSize', 11);

%% Save results
fprintf('\nSaving results...\n');
save('diversity_combining_results.mat', 'SNRdB', 'BER_SC', 'BER_EGC', 'BER_MRC', ...
     'BER_theory_MRC', 'Mt', 'Mr', 'numBits');

% Export figure
saveas(gcf, 'diversity_combining_performance.png');
saveas(gcf, 'diversity_combining_performance.fig');

fprintf('Analysis complete!\n');
fprintf('Results saved to: diversity_combining_results.mat\n');
fprintf('Figure saved as: diversity_combining_performance.png\n');