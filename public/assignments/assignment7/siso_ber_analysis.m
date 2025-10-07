% SISO BER Analysis in Rayleigh Fading Channel
% Assignment 7 - Task 2: BER vs SNR of SISO with BPSK Modulation

clc; clear; close all;

% Parameters
N = 1e5;                    % Number of bits to simulate
snr_dB = 0:2:20;           % SNR range in dB
snr = 10.^(snr_dB/10);     % Convert to linear scale

% Generate random bits
bits = randi([0 1], 1, N);

% BPSK modulation (0 -> -1, 1 -> +1)
bpskSymbols = 2*bits - 1;

% Initialize BER array
ber_sim = zeros(size(snr_dB));

% Simulate for each SNR value
for k = 1:length(snr_dB)
    snr_linear = snr(k);
    
    % Generate Rayleigh fading channel coefficients
    % h ~ CN(0,1) complex Gaussian
    h = (randn(1,N) + 1i*randn(1,N))/sqrt(2);
    
    % Generate AWGN noise
    % Noise power is normalized to 1/SNR
    noise = (randn(1,N) + 1i*randn(1,N))/sqrt(2) * sqrt(1/snr_linear);
    
    % Received signal: r = h*s + n
    r = h .* bpskSymbols + noise;
    
    % Zero-forcing equalization: r_eq = r/h
    r_eq = r ./ h;
    
    % BPSK detection (real part > 0 -> bit 1, else bit 0)
    bits_hat = real(r_eq) > 0;
    
    % Calculate BER
    ber_sim(k) = sum(bits ~= bits_hat) / N;
    
    % Display progress
    fprintf('SNR = %2d dB, BER = %.4e\n', snr_dB(k), ber_sim(k));
end

% Theoretical BER for BPSK in Rayleigh fading (for comparison)
% BER_theory = 0.5 * (1 - sqrt(snr./(1+snr)));
ber_theory = 0.5 * (1 - sqrt(snr./(1+snr)));

% Plot results
figure;
semilogy(snr_dB, ber_sim, '-o', 'LineWidth', 2, 'MarkerSize', 6);
hold on;
semilogy(snr_dB, ber_theory, '--r', 'LineWidth', 2);
xlabel('SNR (dB)');
ylabel('Bit Error Rate (BER)');
title('BPSK BER vs. SNR for SISO Rayleigh Fading Channel');
legend('Simulation', 'Theory', 'Location', 'southwest');
grid on;

% Display BER values
fprintf('\nBER Analysis Results:\n');
fprintf('=====================\n');
fprintf('SNR (dB)\tSimulated BER\tTheoretical BER\n');
fprintf('----------------------------------------\n');
for i = 1:length(snr_dB)
    fprintf('%2d\t\t%.4e\t%.4e\n', snr_dB(i), ber_sim(i), ber_theory(i));
end

% Calculate coding gain requirements
fprintf('\nCoding Gain Analysis:\n');
fprintf('====================\n');
target_ber = 1e-3;
snr_required_idx = find(ber_sim <= target_ber, 1);
if ~isempty(snr_required_idx)
    fprintf('SNR required for BER = 1e-3: %d dB\n', snr_dB(snr_required_idx));
else
    fprintf('BER = 1e-3 not achieved in simulated SNR range\n');
end

% Performance comparison with AWGN
% Theoretical BER for BPSK in AWGN: BER = Q(sqrt(2*SNR))
ber_awgn = 0.5 * erfc(sqrt(snr));

% Plot comparison
figure;
semilogy(snr_dB, ber_sim, '-o', 'LineWidth', 2, 'MarkerSize', 6);
hold on;
semilogy(snr_dB, ber_awgn, '--g', 'LineWidth', 2);
semilogy(snr_dB, ber_theory, '--r', 'LineWidth', 2);
xlabel('SNR (dB)');
ylabel('Bit Error Rate (BER)');
title('BPSK BER Comparison: Rayleigh Fading vs AWGN');
legend('Rayleigh (Simulation)', 'AWGN (Theory)', 'Rayleigh (Theory)', 'Location', 'southwest');
grid on;

% Calculate diversity order from slope
fprintf('\nDiversity Analysis:\n');
fprintf('==================\n');
% Diversity order can be estimated from the slope of BER curve at high SNR
high_snr_range = snr_dB >= 10;
if sum(high_snr_range) >= 2
    p = polyfit(snr_dB(high_snr_range), log10(ber_sim(high_snr_range)), 1);
    diversity_order = -p(1);
    fprintf('Estimated diversity order: %.2f\n', diversity_order);
    fprintf('Expected diversity order for SISO: 1\n');
end