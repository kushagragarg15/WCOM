% Assignment 6: Water-filling Power Allocation Algorithm
% WCOM Lab - LNMIIT
% This MATLAB code implements the water-filling algorithm for optimal power
% allocation across multiple wireless channels to maximize capacity.

clc; clear; close all;

%% System Parameters
N = 6;                       % Number of channels
N0 = 1;                      % Noise power
P_total = 5;                 % Total available power
err = 1e-6;                  % Convergence error threshold
max_iter = 1000;             % Maximum iterations for bisection search

%% Channel Generation (Rayleigh Fading)
% Generate complex Gaussian channel coefficients
h = (randn(1,N) + 1i*randn(1,N))/sqrt(2);

% Channel gains (exponentially distributed for Rayleigh fading)
g = abs(h).^2;

% Signal-to-noise ratio per channel
gamma_i = g / N0;

% Inverse of gamma (needed for water-filling)
inv_gamma = 1 ./ gamma_i;

%% Water-filling Algorithm Implementation
% Initialize bisection search bounds
x_low = min(gamma_i);        % Lower bound for mu
x_high = max(gamma_i);       % Upper bound for mu

% Bisection search for optimal water level (mu_cutoff)
iteration = 0;
mu_history = [];             % Store iteration history

fprintf('=== Water-filling Algorithm Iterations ===\n');
fprintf('Iter\t mu_low\t\t mu_high\t mu_mid\t\t f(mu_mid)\n');
fprintf('----\t ------\t\t -------\t ------\t\t ---------\n');

while iteration < max_iter
    % Calculate midpoint
    x_mid = (x_low + x_high)/2;
    
    % Calculate power allocation for current mu
    P_temp = max(1/x_mid - inv_gamma, 0);
    
    % Objective function: total allocated power - target power
    f_mid = sum(P_temp) - P_total;
    
    % Store iteration data
    mu_history = [mu_history; iteration+1, x_low, x_high, x_mid, f_mid];
    
    % Display iteration progress
    fprintf('%d\t %.6f\t %.6f\t %.6f\t %.6f\n', ...
            iteration+1, x_low, x_high, x_mid, f_mid);
    
    % Check convergence
    if abs(f_mid) < err
        fprintf('Converged after %d iterations!\n\n', iteration+1);
        break;
    elseif f_mid > 0
        x_low = x_mid;       % Increase lower bound
    else
        x_high = x_mid;      % Decrease upper bound
    end
    
    iteration = iteration + 1;
end

% Final optimal water level
mu_cutoff = x_mid;

%% Optimal Power Allocation
% Calculate optimal power allocation using water-filling
P = max(1/mu_cutoff - inv_gamma, 0);

%% Results Display
fprintf('=== Water-filling Results ===\n');
fprintf('Optimal Water Level (mu_cutoff): %.6f\n', mu_cutoff);
fprintf('Inverse Water Level (1/mu): %.6f\n\n', 1/mu_cutoff);

fprintf('Channel Analysis:\n');
fprintf('Ch#\t Gain(g_i)\t Gamma(γ_i)\t 1/Gamma\t Power(P_i)\t Water Level\n');
fprintf('---\t ---------\t ----------\t -------\t ---------\t -----------\n');
for i = 1:N
    water_level = inv_gamma(i) + P(i);
    fprintf('%d\t %.4f\t\t %.4f\t\t %.4f\t\t %.4f\t\t %.4f\n', ...
            i, g(i), gamma_i(i), inv_gamma(i), P(i), water_level);
end

fprintf('\nPower Allocation Summary:\n');
fprintf('Total Power Allocated: %.6f\n', sum(P));
fprintf('Total Power Available: %.6f\n', P_total);
fprintf('Power Allocation Error: %.8f\n', abs(sum(P) - P_total));

%% Capacity Calculations
% Water-filling capacity
C_wf = sum(log2(1 + P .* gamma_i));

% Equal power allocation for comparison
P_equal = P_total/N * ones(1,N);
C_equal = sum(log2(1 + (P_equal .* g)/N0));

fprintf('\nCapacity Analysis:\n');
fprintf('Capacity with Water-filling: %.6f bits/s/Hz\n', C_wf);
fprintf('Capacity with Equal Power: %.6f bits/s/Hz\n', C_equal);
fprintf('Capacity Improvement: %.2f%% \n', (C_wf - C_equal)/C_equal * 100);

%% Visualization 1: Water-filling Principle
figure('Position', [100, 100, 900, 600]);

% Channel indices
channels = 1:N;

% Water levels for each channel
water_level = 1 ./ gamma_i + P;

% Create stacked bar chart
bar(channels, water_level, 'FaceColor', [0.2 0.6 0.8], 'EdgeColor', 'k');
hold on;
bar(channels, 1 ./ gamma_i, 'FaceColor', [1 0.4 0.2], 'EdgeColor', 'k');

% Add optimal water level line
yline(1/mu_cutoff, 'r--', 'LineWidth', 3, 'DisplayName', 'Water Level');

% Formatting
xlabel('Channel Index', 'FontSize', 12, 'FontWeight', 'bold');
ylabel('Water Level (1/γₖ + Pₖ)', 'FontSize', 12, 'FontWeight', 'bold');
title('Water-filling Visualization', 'FontSize', 14, 'FontWeight', 'bold');
legend('Total Water Level', 'Channel Bottom (1/γₖ)', 'Water Level', ...
       'Location', 'best', 'FontSize', 10);
grid on;
set(gca, 'FontSize', 10);

% Add annotations for power allocation
for i = 1:N
    if P(i) > 0.01  % Only annotate channels with significant power
        text(i, water_level(i) + 0.5, sprintf('P_%d=%.2f', i, P(i)), ...
             'HorizontalAlignment', 'center', 'FontSize', 9, 'Color', 'blue');
    end
end

%% Visualization 2: Capacity Comparison
figure('Position', [200, 200, 600, 400]);

% Capacity comparison bar chart
capacity_data = [C_equal, C_wf];
capacity_labels = {'Equal Power', 'Water-filling'};
colors = [1 0.6 0.2; 0.3 0.7 0.3];

bar_handle = bar(capacity_data, 'FaceColor', 'flat');
bar_handle.CData = colors;

% Add value labels on bars
for i = 1:length(capacity_data)
    text(i, capacity_data(i) + 0.1, sprintf('%.3f', capacity_data(i)), ...
         'HorizontalAlignment', 'center', 'FontWeight', 'bold');
end

% Formatting
set(gca, 'XTickLabel', capacity_labels);
ylabel('Capacity (bits/s/Hz)', 'FontSize', 12, 'FontWeight', 'bold');
title('Capacity Comparison: Equal Power vs Water-filling', ...
      'FontSize', 14, 'FontWeight', 'bold');
grid on;
set(gca, 'FontSize', 10);

% Add improvement percentage
improvement = (C_wf - C_equal)/C_equal * 100;
text(1.5, max(capacity_data) * 0.8, ...
     sprintf('Improvement: %.1f%%', improvement), ...
     'HorizontalAlignment', 'center', 'FontSize', 12, ...
     'BackgroundColor', 'yellow', 'EdgeColor', 'black');

%% Visualization 3: Convergence Analysis
if size(mu_history, 1) > 1
    figure('Position', [300, 300, 800, 500]);
    
    subplot(2,1,1);
    plot(mu_history(:,1), mu_history(:,4), 'bo-', 'LineWidth', 2, 'MarkerSize', 6);
    xlabel('Iteration');
    ylabel('μ (Water Level)');
    title('Convergence of Water Level (μ)');
    grid on;
    
    subplot(2,1,2);
    semilogy(mu_history(:,1), abs(mu_history(:,5)), 'ro-', 'LineWidth', 2, 'MarkerSize', 6);
    xlabel('Iteration');
    ylabel('|f(μ)| (Absolute Error)');
    title('Convergence Error');
    grid on;
    
    sgtitle('Water-filling Algorithm Convergence Analysis', 'FontSize', 14, 'FontWeight', 'bold');
end

%% Channel Quality Analysis
figure('Position', [400, 400, 700, 400]);

% Plot channel gains and allocated power
subplot(1,2,1);
stem(channels, gamma_i, 'b', 'LineWidth', 2, 'MarkerSize', 8);
xlabel('Channel Index');
ylabel('Channel Quality (γᵢ)');
title('Channel Quality Distribution');
grid on;

subplot(1,2,2);
stem(channels, P, 'r', 'LineWidth', 2, 'MarkerSize', 8);
xlabel('Channel Index');
ylabel('Allocated Power (Pᵢ)');
title('Optimal Power Allocation');
grid on;

sgtitle('Channel Quality vs Power Allocation', 'FontSize', 14, 'FontWeight', 'bold');

%% Save Results
results.channels = channels;
results.channel_gains = g;
results.gamma_i = gamma_i;
results.power_allocation = P;
results.mu_cutoff = mu_cutoff;
results.capacity_wf = C_wf;
results.capacity_equal = C_equal;
results.mu_history = mu_history;

save('waterfilling_results.mat', 'results');

fprintf('\n=== Assignment 6 Completed Successfully! ===\n');
fprintf('Results saved to waterfilling_results.mat\n');
fprintf('Water-filling demonstrates optimal power allocation\n');
fprintf('for maximizing capacity in multi-channel systems.\n');