% MIMO Channel Capacity Analysis
% Assignment 7 - Task 1: Calculate Channel Capacity for SISO, SIMO, MISO, MIMO

clc; clear; close all;

% Parameters
SNR_dB = 0:5:40;
SNR_linear = 10.^(SNR_dB/10);
numRealizations = 1000;

% Antenna configurations
Nt_SISO = 1; Nr_SISO = 1;  % SISO (1x1)
Nt_SIMO = 1; Nr_SIMO = 2;  % SIMO (1x2)
Nt_MISO = 2; Nr_MISO = 1;  % MISO (2x1)
Nt_MIMO = 2; Nr_MIMO = 2;  % MIMO (2x2)

% Initialize capacity arrays
C_SISO = zeros(size(SNR_linear));
C_SIMO = zeros(size(SNR_linear));
C_MISO = zeros(size(SNR_linear));
C_MIMO = zeros(size(SNR_linear));

% Calculate capacity for each SNR value
for i = 1:length(SNR_linear)
    snr = SNR_linear(i);
    
    % Temporary variables for averaging
    temp_siso = 0;
    temp_simo = 0;
    temp_miso = 0;
    temp_mimo = 0;
    
    % Monte Carlo simulation
    for k = 1:numRealizations
        % SISO Channel (1x1)
        H = (1/sqrt(2))*(randn(Nr_SISO,Nt_SISO)+1i*randn(Nr_SISO,Nt_SISO));
        temp_siso = temp_siso + log2(1 + snr * abs(H)^2);
        
        % SIMO Channel (1x2)
        H = (1/sqrt(2))*(randn(Nr_SIMO,Nt_SIMO)+1i*randn(Nr_SIMO,Nt_SIMO));
        temp_simo = temp_simo + log2(1 + snr * norm(H)^2);
        
        % MISO Channel (2x1)
        H = (1/sqrt(2))*(randn(Nr_MISO,Nt_MISO)+1i*randn(Nr_MISO,Nt_MISO));
        temp_miso = temp_miso + log2(1 + snr * norm(H)^2);
        
        % MIMO Channel (2x2)
        H = (1/sqrt(2))*(randn(Nr_MIMO,Nt_MIMO)+1i*randn(Nr_MIMO,Nt_MIMO));
        temp_mimo = temp_mimo + real(log2(det(eye(Nr_MIMO) + (snr/Nt_MIMO)*(H*H'))));
    end
    
    % Average over realizations
    C_SISO(i) = temp_siso / numRealizations;
    C_SIMO(i) = temp_simo / numRealizations;
    C_MISO(i) = temp_miso / numRealizations;
    C_MIMO(i) = temp_mimo / numRealizations;
end

% Plot results
figure;
plot(SNR_dB, C_SISO, '-o','LineWidth',2, 'MarkerSize', 6); hold on;
plot(SNR_dB, C_SIMO, '-s','LineWidth',2, 'MarkerSize', 6);
plot(SNR_dB, C_MISO, '-^','LineWidth',2, 'MarkerSize', 6);
plot(SNR_dB, C_MIMO, '-d','LineWidth',2, 'MarkerSize', 6);

grid on;
xlabel('Average SNR (dB)');
ylabel('Average Capacity (bits/sec/Hz)');
title('Average Channel Capacity vs Average SNR');
legend( sprintf('SISO (%dx%d)', Nt_SISO, Nr_SISO), ...
        sprintf('SIMO (%dx%d)', Nt_SIMO, Nr_SIMO), ...
        sprintf('MISO (%dx%d)', Nt_MISO, Nr_MISO), ...
        sprintf('MIMO (%dx%d)', Nt_MIMO, Nr_MIMO), ...
        'Location', 'NorthWest');

% Display capacity values at specific SNR points
fprintf('\nChannel Capacity Analysis Results:\n');
fprintf('=====================================\n');
for i = 1:5:length(SNR_dB)
    fprintf('SNR = %2d dB:\n', SNR_dB(i));
    fprintf('  SISO: %.3f bits/sec/Hz\n', C_SISO(i));
    fprintf('  SIMO: %.3f bits/sec/Hz\n', C_SIMO(i));
    fprintf('  MISO: %.3f bits/sec/Hz\n', C_MISO(i));
    fprintf('  MIMO: %.3f bits/sec/Hz\n', C_MIMO(i));
    fprintf('  MIMO Gain over SISO: %.2fx\n\n', C_MIMO(i)/C_SISO(i));
end

% Calculate and display diversity gains
fprintf('Diversity Gain Analysis:\n');
fprintf('========================\n');
high_snr_idx = length(SNR_dB);
fprintf('At SNR = %d dB:\n', SNR_dB(high_snr_idx));
fprintf('SIMO gain over SISO: %.2fx\n', C_SIMO(high_snr_idx)/C_SISO(high_snr_idx));
fprintf('MISO gain over SISO: %.2fx\n', C_MISO(high_snr_idx)/C_SISO(high_snr_idx));
fprintf('MIMO gain over SISO: %.2fx\n', C_MIMO(high_snr_idx)/C_SISO(high_snr_idx));