% Assignment 5: Cellular Network Analysis with H4 Fading
% WCOM Lab - LNMIIT
% This MATLAB code simulates a cellular network scenario with multiple users,
% incorporating path loss, shadowing, and H4 cascaded fading effects.

clc; clear; close all;

%% System Parameters
R = 1000;                    % Cell radius (m)
N_users = 10;                % Number of users
BS = [0, 0];                 % Base station position
fc = 20e9;                   % Carrier frequency (Hz)
c = 3e8;                     % Speed of light (m/s)
lambda = c / fc;             % Wavelength (m)
d0 = 1;                      % Reference distance (m)

% RF Parameters
Pt_dBm = 46;                 % Transmit power (dBm)
Gt_dBi = 15;                 % Transmitter antenna gain (dBi)
Gr_dBi = 0;                  % Receiver antenna gain (dBi)
pl_exp = 3.5;                % Path loss exponent
sigma_db = 8;                % Shadowing standard deviation (dB)

% Noise Parameters
To = 240;                    % Noise temperature (K)
k = 1.38e-23;                % Boltzmann constant (J/K)
BW = 10e6;                   % Bandwidth (Hz)

%% User Distribution
% Generate random user positions within the cell
theta = 2*pi*rand(1, N_users);
r = R*sqrt(rand(1, N_users));
x_users = r .* cos(theta);
y_users = r .* sin(theta);

%% Path Loss Calculation
% Free space path loss at reference distance
PL_d0 = 20*log10(4*pi*d0/lambda);

% Distance from base station to each user
distances = max(r, d0);

% Log-distance path loss
PL_logdist = PL_d0 + 10*pl_exp.*log10(distances./d0);

% Add shadowing (log-normal fading)
shadowing = sigma_db .* randn(size(distances));
PL_total = PL_logdist + shadowing;

%% Received Power and SNR Calculation
% Received power without fading
Pr_dBm = Pt_dBm + Gt_dBi + Gr_dBi - PL_total;

% Noise power
Noise_W = k * To * BW;
Noise_dBm = 10*log10(Noise_W) + 30;

% SNR without fading
SNR_dB = Pr_dBm - Noise_dBm;
SNR_linear = 10.^(SNR_dB/10);

% Achievable rate without fading (Shannon capacity)
Rate_bps = BW * log2(1 + SNR_linear);
Rate_Mbps = Rate_bps / 1e6;

%% H4 Cascaded Fading Model
% Generate four independent Rayleigh fading coefficients
h1 = (randn(1,N_users)+1i*randn(1,N_users))/sqrt(2);
h2 = (randn(1,N_users)+1i*randn(1,N_users))/sqrt(2);
h3 = (randn(1,N_users)+1i*randn(1,N_users))/sqrt(2);
h4 = (randn(1,N_users)+1i*randn(1,N_users))/sqrt(2);

% Cascaded channel coefficient
h_cascaded = h1.*h2.*h3.*h4;

% Received power with H4 fading
Pr_fading_W = (10.^((Pr_dBm-30)/10)) .* abs(h_cascaded).^2;

% SNR with H4 fading
SNR_fading = Pr_fading_W ./ (10^((Noise_dBm-30)/10));

% Achievable rate with H4 fading
Rate_fading_bps = BW * log2(1 + SNR_fading);
Rate_fading_Mbps = Rate_fading_bps / 1e6;

%% Velocity and Coherence Time Analysis
% Random user velocities (1-25 m/s)
velocities = 1 + (25-1).*rand(1,N_users);

% Maximum Doppler frequency
fd = velocities ./ lambda;

% Coherence time (approximate)
Tc = 0.423 ./ fd;

%% Results Table
T = table((1:N_users)', distances', PL_total', Pr_dBm', SNR_dB', Rate_Mbps', ...
          Rate_fading_Mbps', velocities', Tc', ...
          'VariableNames', {'User', 'Distance_m', 'PathLoss_dB', 'Pr_dBm', ...
          'SNR_dB', 'Rate_NoFading_Mbps', 'Rate_H4Fading_Mbps', ...
          'Velocity_mps', 'CoherenceTime_s'});

disp('=== Cellular Network Analysis Results ===');
disp(T);

%% Visualization 1: Cellular Scenario
figure('Position', [100, 100, 800, 600]);
hold on; grid on; axis equal;

% Draw cell coverage area
rectangle('Position', [-R -R 2*R 2*R], 'Curvature', [1 1], ...
          'EdgeColor', 'b', 'LineStyle', '--', 'LineWidth', 2);

% Plot base station
plot(BS(1), BS(2), 'ro', 'MarkerSize', 12, 'MarkerFaceColor', 'r');
text(BS(1)+20, BS(2), 'Base Station', 'Color', 'r', 'FontWeight', 'bold');

% Plot users and connections
for i = 1:N_users
    plot(x_users(i), y_users(i), 'bo', 'MarkerSize', 8, 'MarkerFaceColor', 'c');
    text(x_users(i)+15, y_users(i), sprintf('U%d', i), 'FontSize', 8);
    plot([BS(1) x_users(i)], [BS(2) y_users(i)], ':k');
end

title('Cellular Scenario: Base Station and Users');
xlabel('X Position (m)');
ylabel('Y Position (m)');
legend('Coverage Area', 'Base Station', 'Users', 'Location', 'bestoutside');

%% Visualization 2: Rate Comparison
figure('Position', [200, 200, 900, 500]);
bar(1:N_users, [Rate_Mbps' Rate_fading_Mbps'], 0.8);
grid on;
xlabel('User Index');
ylabel('Achievable Rate (Mbps)');
title('Rate Comparison: Without Fading vs H4 Rayleigh Fading');
legend('No Fading', 'H4 Relay Fading');

% Add rate degradation text
for i = 1:N_users
    degradation = (1 - Rate_fading_Mbps(i)/Rate_Mbps(i)) * 100;
    if degradation > 0
        text(i, max(Rate_Mbps(i), Rate_fading_Mbps(i)) + 2, ...
             sprintf('%.1f%%', degradation), 'HorizontalAlignment', 'center', ...
             'FontSize', 8, 'Color', 'red');
    end
end

%% Visualization 3: Velocity vs Coherence Time
figure('Position', [300, 300, 600, 400]);
plot(velocities, Tc, 'bo', 'LineWidth', 1.5, 'MarkerSize', 8);
grid on;
xlabel('Velocity (m/s)');
ylabel('Coherence Time (s)');
title('Velocity vs Coherence Time');

% Add trend line
p = polyfit(velocities, Tc, 1);
x_trend = linspace(min(velocities), max(velocities), 100);
y_trend = polyval(p, x_trend);
hold on;
plot(x_trend, y_trend, 'r--', 'LineWidth', 2);
legend('User Data', 'Trend Line', 'Location', 'best');

%% Performance Analysis
fprintf('\n=== Performance Analysis ===\n');
fprintf('Average Rate without Fading: %.2f Mbps\n', mean(Rate_Mbps));
fprintf('Average Rate with H4 Fading: %.2f Mbps\n', mean(Rate_fading_Mbps));
fprintf('Average Rate Degradation: %.1f%%\n', ...
        (1 - mean(Rate_fading_Mbps)/mean(Rate_Mbps)) * 100);
fprintf('Average Coherence Time: %.3f s\n', mean(Tc));
fprintf('Range of Coherence Times: %.3f - %.3f s\n', min(Tc), max(Tc));

%% Save Results
save('cellular_network_results.mat', 'T', 'x_users', 'y_users', 'Rate_Mbps', ...
     'Rate_fading_Mbps', 'velocities', 'Tc');

fprintf('\nResults saved to cellular_network_results.mat\n');
fprintf('Assignment 5 completed successfully!\n');