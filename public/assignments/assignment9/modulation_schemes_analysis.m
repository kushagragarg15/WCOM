% Modulation Schemes BER Analysis
% Assignment 9 - Part 1: BPSK, QPSK, and QAM over AWGN Channel (SISO)

clc; clear; close all;

% Parameters
EbN0_dB = 0:2:20;           % SNR range in dB
EbN0 = 10.^(EbN0_dB/10);    % Convert to linear scale

fprintf('=== MODULATION SCHEMES BER ANALYSIS ===\n');
fprintf('Channel: AWGN (SISO Configuration)\n');
fprintf('SNR Range: %d to %d dB\n', EbN0_dB(1), EbN0_dB(end));
fprintf('Modulation Schemes: BPSK, QPSK, 16-QAM, 64-QAM\n\n');

%% Theoretical BER Calculations

% BPSK - Binary Phase Shift Keying
fprintf('Computing BPSK theoretical BER...\n');
ber_bpsk = qfunc(sqrt(2*EbN0));

% QPSK - Quadrature Phase Shift Keying
fprintf('Computing QPSK theoretical BER...\n');
ber_qpsk = qfunc(sqrt(2*EbN0)); % Same as BPSK in AWGN

% 16-QAM - 16-Quadrature Amplitude Modulation
fprintf('Computing 16-QAM theoretical BER...\n');
M = 16;  % 16-QAM
ber_qam16 = (4/log2(M))*(1-1/sqrt(M)).*qfunc(sqrt(3*log2(M)./(M-1).*EbN0));

% 64-QAM - 64-Quadrature Amplitude Modulation
fprintf('Computing 64-QAM theoretical BER...\n');
M = 64;  % 64-QAM
ber_qam64 = (4/log2(M))*(1-1/sqrt(M)).*qfunc(sqrt(3*log2(M)./(M-1).*EbN0));

%% Plot Results
figure('Position', [100, 100, 800, 600]);
semilogy(EbN0_dB, ber_bpsk, 'b-o', 'LineWidth', 1.5, 'MarkerSize', 6); 
hold on;
semilogy(EbN0_dB, ber_qpsk, 'r-s', 'LineWidth', 1.5, 'MarkerSize', 6);
semilogy(EbN0_dB, ber_qam16, 'g-^', 'LineWidth', 1.5, 'MarkerSize', 6);
semilogy(EbN0_dB, ber_qam64, 'm-x', 'LineWidth', 1.5, 'MarkerSize', 6);

grid on; 
xlabel('E_b/N_0 (dB)', 'FontSize', 12); 
ylabel('Bit Error Rate (BER)', 'FontSize', 12);
title('BER Performance of Modulation Schemes over AWGN (SISO)', 'FontSize', 14);
legend('BPSK','QPSK','16-QAM','64-QAM', 'Location', 'southwest', 'FontSize', 11);

% Set axis limits for better visualization
xlim([EbN0_dB(1), EbN0_dB(end)]);
ylim([1e-8, 1]);

%% Performance Analysis
fprintf('\n=== PERFORMANCE ANALYSIS ===\n');
fprintf('BER Comparison at Different SNR Values:\n');
fprintf('SNR (dB)\t\tBPSK\t\t\tQPSK\t\t\t16-QAM\t\t\t64-QAM\n');
fprintf('---------------------------------------------------------------------------------\n');
for i = 1:3:length(EbN0_dB)
    fprintf('%2d\t\t%.4e\t%.4e\t%.4e\t%.4e\n', ...
            EbN0_dB(i), ber_bpsk(i), ber_qpsk(i), ber_qam16(i), ber_qam64(i));
end

%% Spectral Efficiency Analysis
fprintf('\nSpectral Efficiency Analysis:\n');
fprintf('=============================\n');
fprintf('BPSK:    1 bit/symbol  = 1 bits/s/Hz\n');
fprintf('QPSK:    2 bits/symbol = 2 bits/s/Hz\n');
fprintf('16-QAM:  4 bits/symbol = 4 bits/s/Hz\n');
fprintf('64-QAM:  6 bits/symbol = 6 bits/s/Hz\n');

%% SNR Requirements for Target BER
target_ber = 1e-4;
fprintf('\nSNR Requirements for BER = %.0e:\n', target_ber);
fprintf('=====================================\n');

% Find SNR for target BER
snr_bpsk = interp1(ber_bpsk, EbN0_dB, target_ber, 'linear', 'extrap');
snr_qpsk = interp1(ber_qpsk, EbN0_dB, target_ber, 'linear', 'extrap');
snr_16qam = interp1(ber_qam16, EbN0_dB, target_ber, 'linear', 'extrap');
snr_64qam = interp1(ber_qam64, EbN0_dB, target_ber, 'linear', 'extrap');

fprintf('BPSK:    %.2f dB\n', snr_bpsk);
fprintf('QPSK:    %.2f dB\n', snr_qpsk);
fprintf('16-QAM:  %.2f dB\n', snr_16qam);
fprintf('64-QAM:  %.2f dB\n', snr_64qam);

fprintf('\nSNR Penalty compared to BPSK:\n');
fprintf('QPSK:    %.2f dB\n', snr_qpsk - snr_bpsk);
fprintf('16-QAM:  %.2f dB\n', snr_16qam - snr_bpsk);
fprintf('64-QAM:  %.2f dB\n', snr_64qam - snr_bpsk);

%% Constellation Analysis
fprintf('\nConstellation Properties:\n');
fprintf('========================\n');
fprintf('BPSK:    2 constellation points, minimum distance = 2\n');
fprintf('QPSK:    4 constellation points, minimum distance = √2\n');
fprintf('16-QAM:  16 constellation points, normalized power\n');
fprintf('64-QAM:  64 constellation points, higher peak power\n');

%% Practical Considerations
fprintf('\nPractical Implementation Considerations:\n');
fprintf('=======================================\n');
fprintf('1. BPSK: Simplest demodulator, most robust to noise\n');
fprintf('2. QPSK: Good balance of spectral efficiency and robustness\n');
fprintf('3. 16-QAM: Requires accurate amplitude control\n');
fprintf('4. 64-QAM: Very sensitive to noise and nonlinearities\n');
fprintf('5. Higher order QAM needs better channel estimation\n');

%% Save Results
fprintf('\nSaving results...\n');
save('modulation_schemes_results.mat', 'EbN0_dB', 'ber_bpsk', 'ber_qpsk', ...
     'ber_qam16', 'ber_qam64', 'target_ber', 'snr_bpsk', 'snr_qpsk', ...
     'snr_16qam', 'snr_64qam');

% Export figure
saveas(gcf, 'modulation_schemes_ber.png');
saveas(gcf, 'modulation_schemes_ber.fig');

fprintf('Analysis complete!\n');
fprintf('Results saved to: modulation_schemes_results.mat\n');
fprintf('Figure saved as: modulation_schemes_ber.png\n');

%% Additional Analysis: Constellation Plots
figure('Position', [200, 200, 1000, 300]);

% BPSK Constellation
subplot(1,4,1);
plot([-1, 1], [0, 0], 'bo', 'MarkerSize', 8, 'MarkerFaceColor', 'b');
grid on; axis equal; xlim([-1.5, 1.5]); ylim([-0.5, 0.5]);
title('BPSK'); xlabel('In-phase'); ylabel('Quadrature');

% QPSK Constellation
subplot(1,4,2);
qpsk_I = [1, -1, 1, -1]/sqrt(2);
qpsk_Q = [1, 1, -1, -1]/sqrt(2);
plot(qpsk_I, qpsk_Q, 'ro', 'MarkerSize', 8, 'MarkerFaceColor', 'r');
grid on; axis equal; xlim([-1, 1]); ylim([-1, 1]);
title('QPSK'); xlabel('In-phase'); ylabel('Quadrature');

% 16-QAM Constellation
subplot(1,4,3);
qam16_I = repmat([-3, -1, 1, 3]/sqrt(10), 1, 4);
qam16_Q = reshape(repmat([-3, -1, 1, 3]/sqrt(10), 4, 1), 1, 16);
plot(qam16_I, qam16_Q, 'g^', 'MarkerSize', 6, 'MarkerFaceColor', 'g');
grid on; axis equal; xlim([-1.5, 1.5]); ylim([-1.5, 1.5]);
title('16-QAM'); xlabel('In-phase'); ylabel('Quadrature');

% 64-QAM Constellation
subplot(1,4,4);
qam64_levels = [-7, -5, -3, -1, 1, 3, 5, 7]/sqrt(42);
[qam64_I, qam64_Q] = meshgrid(qam64_levels, qam64_levels);
plot(qam64_I(:), qam64_Q(:), 'mx', 'MarkerSize', 4, 'MarkerFaceColor', 'm');
grid on; axis equal; xlim([-0.5, 0.5]); ylim([-0.5, 0.5]);
title('64-QAM'); xlabel('In-phase'); ylabel('Quadrature');

sgtitle('Modulation Constellation Diagrams', 'FontSize', 14);

% Save constellation figure
saveas(gcf, 'modulation_constellations.png');
saveas(gcf, 'modulation_constellations.fig');

fprintf('Constellation diagrams saved as: modulation_constellations.png\n');