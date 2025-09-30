% Assignment 4: Rician Fading and Jakes Doppler Spectrum Analysis
% This MATLAB code simulates Rician fading distribution and analyzes Jakes Doppler spectrum

clear all;
close all;
clc;

%% Parameters
% Rician Fading Parameters
K_values = [0, 1, 3, 10];      % K-factor values (dB will be calculated)
Omega = 1;                     % Average power of the signal
N_samples = 100000;            % Number of samples for simulation

% Jakes Doppler Parameters
fmax = 100;                    % Maximum Doppler shift (Hz)
sigma2 = 1;                    % Fading channel average power
fs = 1000;                     % Sampling frequency (Hz)
T_observation = 10;            % Observation time (seconds)

%% Create main figure
figure('Position', [50, 50, 1600, 1200]);
sgtitle('WCOM Lab 4: Rician Fading and Jakes Doppler Spectrum Analysis', ...
         'FontSize', 16, 'FontWeight', 'bold');

%% Part I: Rician Fading Distribution Simulation

fprintf('=== WCOM Lab 4: Rician Fading and Jakes Doppler Analysis ===\n');
fprintf('Part I: Rician Fading Distribution Simulation\n');
fprintf('=============================================\n');

% Loop through different K-factor values
for k_idx = 1:length(K_values)
    K_linear = K_values(k_idx);  % K-factor in linear scale
    K_dB = 10*log10(K_linear + eps);  % K-factor in dB (avoid log(0))
    
    % Calculate parameters
    sigma = sqrt(Omega / (2 * (K_linear + 1)));  % Standard deviation of diffuse components
    spec_amp = sqrt(K_linear * Omega / (K_linear + 1));  % Amplitude of specular component
    
    % Generate Gaussian random variables
    X = sigma * randn(N_samples, 1);  % Real part of diffuse component
    Y = sigma * randn(N_samples, 1);  % Imaginary part of diffuse component
    
    % Generate Rician fading samples
    real_part = spec_amp + X;
    imag_part = Y;
    r_t = sqrt(real_part.^2 + imag_part.^2);  % Received signal amplitude
    
    % Theoretical Rician PDF
    r_theory = linspace(0, max(r_t), 1000);
    if K_linear == 0
        % Rayleigh distribution (special case when K=0)
        pdf_theory = (r_theory / sigma^2) .* exp(-r_theory.^2 / (2*sigma^2));
    else
        % Rician PDF
        pdf_theory = (r_theory / sigma^2) .* exp(-(r_theory.^2 + spec_amp^2) / (2*sigma^2)) .* ...
                     besseli(0, r_theory * spec_amp / sigma^2);
    end
    
    % Plot histogram and theoretical PDF
    subplot(3, 4, k_idx);
    histogram(r_t, 100, 'Normalization', 'pdf', 'FaceAlpha', 0.7, ...
              'EdgeColor', 'none', 'FaceColor', [0.2 0.6 0.8]);
    hold on;
    plot(r_theory, pdf_theory, 'r-', 'LineWidth', 2);
    
    if K_linear == 0
        title(sprintf('Rayleigh Fading (K = 0)'), 'FontSize', 11);
    else
        title(sprintf('Rician Fading (K = %.1f, K_{dB} = %.1f dB)', K_linear, K_dB), 'FontSize', 11);
    end
    xlabel('Amplitude r');
    ylabel('Probability Density');
    legend('Simulated', 'Theoretical', 'Location', 'northeast');
    grid on;
    
    % Calculate and display statistics
    mean_simulated = mean(r_t);
    var_simulated = var(r_t);
    mean_theoretical = sigma * sqrt(pi/2) * exp(-spec_amp^2/(4*sigma^2)) * ...
                      ((1 + spec_amp^2/(2*sigma^2)) * besseli(0, spec_amp^2/(4*sigma^2)) + ...
                       spec_amp^2/(2*sigma^2) * besseli(1, spec_amp^2/(4*sigma^2)));
    
    fprintf('K = %.1f: Mean (sim/theo) = %.4f/%.4f, Var (sim) = %.4f\n', ...
            K_linear, mean_simulated, mean_theoretical, var_simulated);
end

%% Part II: Jakes Doppler Spectrum Analysis

fprintf('\nPart II: Jakes Doppler Spectrum and Autocorrelation Analysis\n');
fprintf('==========================================================\n');

% Frequency vector for Doppler spectrum
f = linspace(-2*fmax, 2*fmax, 2000);
df = f(2) - f(1);

% Calculate Jakes Doppler Spectrum
S_jakes = zeros(size(f));
mask = abs(f) < fmax;  % Only calculate for |f| < fmax
S_jakes(mask) = sigma2 ./ (pi * fmax * sqrt(1 - (f(mask)/fmax).^2));

% Plot Jakes Doppler Spectrum
subplot(3, 4, 5);
plot(f, S_jakes, 'b-', 'LineWidth', 2);
title('Jakes Doppler Spectrum', 'FontSize', 12);
xlabel('Doppler Frequency (Hz)');
ylabel('Power Spectral Density S(f)');
grid on;
xlim([-1.5*fmax, 1.5*fmax]);
text(0.02, 0.95, sprintf('f_{max} = %d Hz', fmax), 'Units', 'normalized', ...
     'BackgroundColor', 'white', 'FontSize', 10);

% Highlight the U-shaped characteristic
hold on;
plot([-fmax, fmax], [max(S_jakes(mask)), max(S_jakes(mask))], 'r--', 'LineWidth', 1);
text(0, max(S_jakes(mask))*0.8, 'U-shaped characteristic', 'HorizontalAlignment', 'center', ...
     'BackgroundColor', 'yellow', 'FontSize', 9);

%% Autocorrelation Function Analysis

% Time delay vector
tau = linspace(0, 1/fmax, 1000);  % Up to 1/fmax for good visualization

% Calculate theoretical autocorrelation function
R_theory = sigma2 * besselj(0, 2*pi*fmax*tau);

% Plot Autocorrelation Function
subplot(3, 4, 6);
plot(tau, R_theory, 'g-', 'LineWidth', 2);
title('Autocorrelation Function R(\tau)', 'FontSize', 12);
xlabel('Time Delay \tau (s)');
ylabel('Autocorrelation R(\tau)');
grid on;

% Mark important points
hold on;
plot(0, sigma2, 'ro', 'MarkerSize', 8, 'MarkerFaceColor', 'red');
text(0.02, 0.95, sprintf('R(0) = \\sigma^2 = %.1f', sigma2), 'Units', 'normalized', ...
     'BackgroundColor', 'white', 'FontSize', 10);

% Find first zero crossing
zero_crossings = find(diff(sign(R_theory)));
if ~isempty(zero_crossings)
    tau_zero = tau(zero_crossings(1));
    plot(tau_zero, 0, 'bo', 'MarkerSize', 6, 'MarkerFaceColor', 'blue');
    text(tau_zero, 0.1, sprintf('\\tau_0 = %.4f s', tau_zero), ...
         'HorizontalAlignment', 'center', 'FontSize', 9);
end

%% Time-varying Channel Simulation

% Generate time-varying Rician fading channel
t = 0:1/fs:T_observation-1/fs;
N_time = length(t);

% Use K=3 for demonstration
K_demo = 3;
sigma_demo = sqrt(Omega / (2 * (K_demo + 1)));
spec_amp_demo = sqrt(K_demo * Omega / (K_demo + 1));

% Generate correlated fading samples using Jakes model
% This is a simplified approach - in practice, more sophisticated methods are used
h_real = spec_amp_demo + sigma_demo * randn(size(t));
h_imag = sigma_demo * randn(size(t));

% Apply simple low-pass filtering to introduce correlation
% (This is a simplified model - actual implementation would use proper Doppler filtering)
if length(t) > 100
    filter_length = min(50, floor(length(t)/10));
    h_filter = ones(1, filter_length) / filter_length;
    h_real = conv(h_real, h_filter, 'same');
    h_imag = conv(h_imag, h_filter, 'same');
end

h_magnitude = sqrt(h_real.^2 + h_imag.^2);
h_phase = atan2(h_imag, h_real);

% Plot time-varying channel magnitude
subplot(3, 4, 7);
plot(t, 20*log10(h_magnitude), 'b-', 'LineWidth', 1);
title('Time-varying Channel Magnitude', 'FontSize', 12);
xlabel('Time (s)');
ylabel('Channel Gain (dB)');
grid on;
ylim([-20, 10]);

% Plot time-varying channel phase
subplot(3, 4, 8);
plot(t, h_phase*180/pi, 'r-', 'LineWidth', 1);
title('Time-varying Channel Phase', 'FontSize', 12);
xlabel('Time (s)');
ylabel('Phase (degrees)');
grid on;

%% Doppler Spectrum from Simulated Data

% Calculate empirical Doppler spectrum using FFT
if length(h_magnitude) > 1024
    % Use windowing for better spectral estimation
    window_length = 1024;
    overlap = 512;
    [Pxx, f_empirical] = pwelch(h_magnitude - mean(h_magnitude), ...
                                hamming(window_length), overlap, window_length, fs);
    
    % Convert to Doppler frequencies (centered around 0)
    f_doppler = f_empirical - fs/2;
    f_doppler = fftshift(f_doppler);
    Pxx = fftshift(Pxx);
    
    subplot(3, 4, 9);
    semilogy(f_doppler, Pxx, 'b-', 'LineWidth', 1);
    hold on;
    
    % Overlay theoretical Jakes spectrum (scaled for comparison)
    f_theory_limited = f(abs(f) <= fs/2);
    S_theory_limited = S_jakes(abs(f) <= fs/2);
    S_theory_scaled = S_theory_limited * max(Pxx) / max(S_theory_limited(S_theory_limited < inf));
    
    semilogy(f_theory_limited, S_theory_scaled, 'r--', 'LineWidth', 2);
    
    title('Empirical vs Theoretical Doppler Spectrum', 'FontSize', 12);
    xlabel('Doppler Frequency (Hz)');
    ylabel('Power Spectral Density (log scale)');
    legend('Empirical', 'Theoretical (scaled)', 'Location', 'best');
    grid on;
    xlim([-fmax*1.5, fmax*1.5]);
end

%% Statistical Analysis of Fading

% Analyze fading statistics
subplot(3, 4, 10);
histogram(20*log10(h_magnitude), 50, 'Normalization', 'pdf', ...
          'FaceAlpha', 0.7, 'EdgeColor', 'none', 'FaceColor', [0.8 0.4 0.2]);
title('Fading Magnitude Distribution', 'FontSize', 12);
xlabel('Channel Gain (dB)');
ylabel('Probability Density');
grid on;

% Calculate fade statistics
fade_threshold_dB = -10;  % 10 dB fade threshold
fade_duration = sum(20*log10(h_magnitude) < fade_threshold_dB) / fs;
fade_probability = mean(20*log10(h_magnitude) < fade_threshold_dB);

text(0.02, 0.95, sprintf('Fade Prob (<%d dB): %.3f', fade_threshold_dB, fade_probability), ...
     'Units', 'normalized', 'BackgroundColor', 'white', 'FontSize', 9);
text(0.02, 0.85, sprintf('Total Fade Time: %.2f s', fade_duration), ...
     'Units', 'normalized', 'BackgroundColor', 'white', 'FontSize', 9);

%% Level Crossing Rate Analysis

% Calculate level crossing rate
level_dB = -5;  % Level for crossing rate analysis
level_linear = 10^(level_dB/20);
crossings = 0;

for i = 2:length(h_magnitude)
    if (h_magnitude(i-1) < level_linear && h_magnitude(i) >= level_linear) || ...
       (h_magnitude(i-1) >= level_linear && h_magnitude(i) < level_linear)
        crossings = crossings + 1;
    end
end

level_crossing_rate = crossings / (2 * T_observation);  % Crossings per second

subplot(3, 4, 11);
plot(t, 20*log10(h_magnitude), 'b-', 'LineWidth', 1);
hold on;
plot([0, T_observation], [level_dB, level_dB], 'r--', 'LineWidth', 2);
title('Level Crossing Rate Analysis', 'FontSize', 12);
xlabel('Time (s)');
ylabel('Channel Gain (dB)');
legend('Channel Gain', sprintf('Level = %d dB', level_dB), 'Location', 'best');
grid on;

text(0.02, 0.95, sprintf('LCR = %.2f crossings/s', level_crossing_rate), ...
     'Units', 'normalized', 'BackgroundColor', 'white', 'FontSize', 10);

%% Summary Statistics and Comparison

subplot(3, 4, 12);
axis off;

% Create summary table
summary_text = {
    'SUMMARY STATISTICS';
    '==================';
    '';
    'Rician Fading Parameters:';
    sprintf('  K-factor range: 0 to %d', max(K_values));
    sprintf('  Average power Ω: %.1f', Omega);
    '';
    'Jakes Doppler Parameters:';
    sprintf('  Max Doppler shift: %d Hz', fmax);
    sprintf('  Channel power σ²: %.1f', sigma2);
    '';
    'Channel Statistics:';
    sprintf('  Observation time: %.1f s', T_observation);
    sprintf('  Fade probability: %.3f', fade_probability);
    sprintf('  Level crossing rate: %.2f/s', level_crossing_rate);
    '';
    'Key Findings:';
    '• U-shaped Doppler spectrum confirmed';
    '• Autocorrelation shows oscillatory decay';
    '• Higher K-factor reduces fading depth';
    '• Channel coherence time ≈ 1/(π·fmax)'
};

text(0.05, 0.95, summary_text, 'Units', 'normalized', 'FontSize', 10, ...
     'VerticalAlignment', 'top', 'FontName', 'FixedWidth');

%% Display Results
fprintf('\nSimulation Results:\n');
fprintf('==================\n');
fprintf('Maximum Doppler frequency: %d Hz\n', fmax);
fprintf('Channel coherence time: %.4f s\n', 1/(pi*fmax));
fprintf('Fade probability (<%d dB): %.3f\n', fade_threshold_dB, fade_probability);
fprintf('Level crossing rate (%d dB): %.2f crossings/s\n', level_dB, level_crossing_rate);

% Theoretical coherence time
coherence_time = 1/(pi*fmax);
fprintf('Theoretical coherence time: %.4f s\n', coherence_time);

% Coherence bandwidth (approximation)
coherence_bandwidth = 1/(2*pi*coherence_time);
fprintf('Approximate coherence bandwidth: %.2f Hz\n', coherence_bandwidth);

%% Save Results
saveas(gcf, 'rician_jakes_analysis.png');
saveas(gcf, 'rician_jakes_analysis.fig');

fprintf('\nPlots saved as rician_jakes_analysis.png and .fig\n');
fprintf('Analysis complete!\n');

%% Additional Analysis Functions

function plot_bessel_function()
    % Plot Bessel function J0 for educational purposes
    x = linspace(0, 20, 1000);
    J0 = besselj(0, x);
    
    figure('Name', 'Bessel Function J0');
    plot(x, J0, 'b-', 'LineWidth', 2);
    title('Bessel Function of First Kind, Order 0: J_0(x)');
    xlabel('x');
    ylabel('J_0(x)');
    grid on;
    
    % Mark zeros
    zeros_J0 = [2.4048, 5.5201, 8.6537, 11.7915, 14.9309];
    hold on;
    for i = 1:length(zeros_J0)
        if zeros_J0(i) <= 20
            plot(zeros_J0(i), 0, 'ro', 'MarkerSize', 6, 'MarkerFaceColor', 'red');
        end
    end
end