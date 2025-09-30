% Assignment 2: Path Loss and Shadowing Analysis
% This MATLAB code analyzes path loss models and shadowing effects in wireless systems

clear all;
close all;
clc;

%% Parameters
% System Parameters
Pt_dBm = 0;                  % Transmit power in dBm
fc = 2e9;                    % Carrier frequency (Hz) - 2 GHz
c = 3e8;                     % Speed of light (m/s)
lambda = c / fc;             % Wavelength (m)
d0 = 1;                      % Reference distance (m)

% Environment Parameters
n_values = [2, 3, 4];        % Path loss exponents (free space, urban, dense urban)
sigma_values = [0, 4, 6, 8]; % Shadowing standard deviations (dB)
d = 1:1:1000;                % Distance range (m)

% Additional Parameters for Analysis
Pt_W = 10^((Pt_dBm-30)/10);  % Transmit power in Watts
freq_values = [900e6, 2e9, 5e9, 28e9]; % Different carrier frequencies

%% Create main figure
figure('Position', [50, 50, 1600, 1200]);
sgtitle('WCOM Lab Assignment 2: Path Loss and Shadowing Analysis', ...
         'FontSize', 16, 'FontWeight', 'bold');

fprintf('=== WCOM Lab Assignment 2: Path Loss and Shadowing Analysis ===\n');
fprintf('================================================================\n');

%% Part I: Free Space Path Loss Analysis

% Calculate free space path loss
FSPL = 20*log10(4*pi*d*fc/c);  % Free space path loss in dB
Pr_fs = Pt_dBm - FSPL;         % Received power in free space

% Plot free space path loss
subplot(3, 4, 1);
semilogx(d, FSPL, 'b-', 'LineWidth', 2);
grid on;
title('Free Space Path Loss', 'FontSize', 12);
xlabel('Distance (m)');
ylabel('Path Loss (dB)');

% Add reference points
hold on;
ref_distances = [10, 100, 1000];
for i = 1:length(ref_distances)
    ref_d = ref_distances(i);
    ref_pl = 20*log10(4*pi*ref_d*fc/c);
    semilogx(ref_d, ref_pl, 'ro', 'MarkerSize', 8, 'MarkerFaceColor', 'red');
    text(ref_d, ref_pl-5, sprintf('%.1f dB', ref_pl), 'HorizontalAlignment', 'center', 'FontSize', 8);
end

fprintf('Free Space Path Loss Analysis:\n');
fprintf('Carrier frequency: %.1f GHz\n', fc/1e9);
fprintf('Wavelength: %.3f m\n', lambda);
for i = 1:length(ref_distances)
    ref_pl = 20*log10(4*pi*ref_distances(i)*fc/c);
    fprintf('FSPL at %d m: %.1f dB\n', ref_distances(i), ref_pl);
end

%% Part II: Log-Distance Path Loss Model

% Calculate path loss at reference distance
PL_d0 = 20*log10(4*pi*d0/lambda);

subplot(3, 4, 2);
colors = {'b-', 'g-', 'r-', 'm-'};
legend_entries = {};

for i = 1:length(n_values)
    n = n_values(i);
    
    % Log-distance path loss model
    PL = PL_d0 + 10*n*log10(d/d0);
    Pr = Pt_dBm - PL;
    
    semilogx(d, PL, colors{i}, 'LineWidth', 2);
    hold on;
    
    if n == 2
        legend_entries{end+1} = 'Free Space (n=2)';
    elseif n == 3
        legend_entries{end+1} = 'Urban (n=3)';
    elseif n == 4
        legend_entries{end+1} = 'Dense Urban (n=4)';
    end
end

grid on;
title('Log-Distance Path Loss Model', 'FontSize', 12);
xlabel('Distance (m)');
ylabel('Path Loss (dB)');
legend(legend_entries, 'Location', 'southeast');

fprintf('\nLog-Distance Path Loss Model:\n');
fprintf('Reference distance d0: %d m\n', d0);
fprintf('Path loss at d0: %.1f dB\n', PL_d0);

%% Part III: Received Power Analysis

subplot(3, 4, 3);
for i = 1:length(n_values)
    n = n_values(i);
    PL = PL_d0 + 10*n*log10(d/d0);
    Pr = Pt_dBm - PL;
    
    semilogx(d, Pr, colors{i}, 'LineWidth', 2);
    hold on;
end

grid on;
title('Received Power vs Distance', 'FontSize', 12);
xlabel('Distance (m)');
ylabel('Received Power (dBm)');
legend(legend_entries, 'Location', 'northeast');

% Add sensitivity threshold
sensitivity_dBm = -100;  % Typical receiver sensitivity
semilogx([1, 1000], [sensitivity_dBm, sensitivity_dBm], 'k--', 'LineWidth', 1);
text(100, sensitivity_dBm+5, 'Receiver Sensitivity', 'HorizontalAlignment', 'center', 'FontSize', 8);

%% Part IV: Shadowing Effects

% Use urban environment (n=3) for shadowing analysis
n = 3;
PL_base = PL_d0 + 10*n*log10(d/d0);
Pr_base = Pt_dBm - PL_base;

subplot(3, 4, 4);
semilogx(d, Pr_base, 'b-', 'LineWidth', 2);
hold on;

% Add different levels of shadowing
colors_shadow = {'g.', 'r.', 'm.'};
legend_shadow = {'No Shadowing'};

for i = 1:length(sigma_values)-1  % Skip sigma=0
    sigma = sigma_values(i+1);
    
    % Generate shadowing (log-normal)
    shadowing = sigma * randn(size(d));
    Pr_shadowed = Pr_base + shadowing;
    
    semilogx(d, Pr_shadowed, colors_shadow{i}, 'MarkerSize', 4);
    legend_shadow{end+1} = sprintf('\\sigma = %d dB', sigma);
end

grid on;
title('Shadowing Effects', 'FontSize', 12);
xlabel('Distance (m)');
ylabel('Received Power (dBm)');
legend(legend_shadow, 'Location', 'northeast');

fprintf('\nShadowing Analysis:\n');
for i = 2:length(sigma_values)
    sigma = sigma_values(i);
    fprintf('Shadowing std deviation: %d dB\n', sigma);
end

%% Part V: Frequency Dependency Analysis

subplot(3, 4, 5);
freq_colors = {'b-', 'g-', 'r-', 'm-'};
freq_legend = {};

for i = 1:length(freq_values)
    freq = freq_values(i);
    lambda_f = c / freq;
    
    % Free space path loss for different frequencies
    FSPL_f = 20*log10(4*pi*d*freq/c);
    
    semilogx(d, FSPL_f, freq_colors{i}, 'LineWidth', 2);
    hold on;
    
    if freq < 1e9
        freq_legend{end+1} = sprintf('%.0f MHz', freq/1e6);
    else
        freq_legend{end+1} = sprintf('%.0f GHz', freq/1e9);
    end
end

grid on;
title('Frequency Dependency', 'FontSize', 12);
xlabel('Distance (m)');
ylabel('Free Space Path Loss (dB)');
legend(freq_legend, 'Location', 'southeast');

%% Part VI: Coverage Analysis

% Calculate coverage range for different scenarios
subplot(3, 4, 6);
n = 3;  % Urban environment
sensitivity_dBm = -100;
max_range = zeros(length(sigma_values), 1);

for i = 1:length(sigma_values)
    sigma = sigma_values(i);
    
    % For coverage analysis, consider fade margin
    fade_margin = 2 * sigma;  % 95% coverage (2-sigma)
    effective_sensitivity = sensitivity_dBm + fade_margin;
    
    % Calculate maximum range
    % Pt_dBm - PL_d0 - 10*n*log10(d_max/d0) = effective_sensitivity
    % 10*n*log10(d_max/d0) = Pt_dBm - PL_d0 - effective_sensitivity
    d_max = d0 * 10^((Pt_dBm - PL_d0 - effective_sensitivity)/(10*n));
    max_range(i) = d_max;
    
    bar(i, d_max, 'FaceColor', [0.2 0.6 0.8]);
    hold on;
end

set(gca, 'XTickLabel', {'No Shadow', '4 dB', '6 dB', '8 dB'});
title('Coverage Range vs Shadowing', 'FontSize', 12);
xlabel('Shadowing Standard Deviation');
ylabel('Maximum Range (m)');
grid on;

% Add values on bars
for i = 1:length(max_range)
    text(i, max_range(i) + 10, sprintf('%.0f m', max_range(i)), ...
         'HorizontalAlignment', 'center', 'FontSize', 9);
end

fprintf('\nCoverage Analysis (95%% reliability):\n');
fprintf('Transmit power: %d dBm\n', Pt_dBm);
fprintf('Receiver sensitivity: %d dBm\n', sensitivity_dBm);
for i = 1:length(sigma_values)
    fprintf('Shadowing %d dB: Max range = %.0f m\n', sigma_values(i), max_range(i));
end

%% Part VII: Link Budget Analysis

subplot(3, 4, 7);
% Link budget components
distances = [100, 500, 1000];
n = 3;

link_budget_data = zeros(length(distances), 5);  % [Pt, PL, Fade_Margin, Pr_mean, Pr_min]

for i = 1:length(distances)
    d_link = distances(i);
    
    % Path loss
    PL = PL_d0 + 10*n*log10(d_link/d0);
    
    % Fade margin (for 95% reliability)
    sigma = 6;  % dB
    fade_margin = 2 * sigma;
    
    % Received power
    Pr_mean = Pt_dBm - PL;
    Pr_min = Pr_mean - fade_margin;
    
    link_budget_data(i, :) = [Pt_dBm, -PL, -fade_margin, Pr_mean, Pr_min];
end

% Stacked bar chart
bar(link_budget_data(:, [1, 2, 3]), 'stacked');
hold on;
plot(1:length(distances), link_budget_data(:, 5), 'ro-', 'LineWidth', 2, 'MarkerSize', 8);

set(gca, 'XTickLabel', {'100 m', '500 m', '1000 m'});
title('Link Budget Analysis', 'FontSize', 12);
xlabel('Distance');
ylabel('Power (dBm)');
legend('Tx Power', 'Path Loss', 'Fade Margin', 'Min Rx Power', 'Location', 'best');
grid on;

%% Part VIII: Statistical Analysis of Shadowing

subplot(3, 4, 8);
% Generate large sample of shadowing values
N_samples = 10000;
sigma = 6;  % dB
shadowing_samples = sigma * randn(N_samples, 1);

% Plot histogram and theoretical PDF
histogram(shadowing_samples, 50, 'Normalization', 'pdf', 'FaceAlpha', 0.7, ...
          'EdgeColor', 'none', 'FaceColor', [0.2 0.6 0.8]);
hold on;

% Theoretical Gaussian PDF
x = linspace(-20, 20, 200);
pdf_theory = (1/(sigma*sqrt(2*pi))) * exp(-x.^2/(2*sigma^2));
plot(x, pdf_theory, 'r-', 'LineWidth', 2);

title('Shadowing Distribution', 'FontSize', 12);
xlabel('Shadowing (dB)');
ylabel('Probability Density');
legend('Simulated', 'Theoretical N(0,\sigma^2)', 'Location', 'northeast');
grid on;

% Add statistics
mean_shadow = mean(shadowing_samples);
std_shadow = std(shadowing_samples);
text(0.02, 0.95, sprintf('Mean: %.2f dB', mean_shadow), 'Units', 'normalized', ...
     'BackgroundColor', 'white', 'FontSize', 9);
text(0.02, 0.85, sprintf('Std: %.2f dB', std_shadow), 'Units', 'normalized', ...
     'BackgroundColor', 'white', 'FontSize', 9);

%% Part IX: Outage Probability Analysis

subplot(3, 4, 9);
% Calculate outage probability vs distance
d_outage = 10:10:1000;
n = 3;
sigma = 6;
threshold_dBm = -90;  % Outage threshold

outage_prob = zeros(size(d_outage));

for i = 1:length(d_outage)
    d_curr = d_outage(i);
    PL = PL_d0 + 10*n*log10(d_curr/d0);
    Pr_mean = Pt_dBm - PL;
    
    % Outage probability = P(Pr < threshold)
    % Pr = Pr_mean + shadowing, shadowing ~ N(0, sigma^2)
    % P(Pr_mean + shadowing < threshold) = P(shadowing < threshold - Pr_mean)
    outage_prob(i) = normcdf((threshold_dBm - Pr_mean) / sigma);
end

semilogy(d_outage, outage_prob, 'b-', 'LineWidth', 2);
grid on;
title('Outage Probability', 'FontSize', 12);
xlabel('Distance (m)');
ylabel('Outage Probability');

% Add reference lines
hold on;
semilogy([10, 1000], [0.01, 0.01], 'r--', 'LineWidth', 1);
semilogy([10, 1000], [0.1, 0.1], 'g--', 'LineWidth', 1);
text(500, 0.02, '1% Outage', 'FontSize', 8);
text(500, 0.2, '10% Outage', 'FontSize', 8);

%% Part X: Environment Comparison

subplot(3, 4, 10);
environments = {'Free Space', 'Rural', 'Suburban', 'Urban', 'Dense Urban'};
n_env = [2, 2.5, 3, 3.5, 4];
sigma_env = [0, 2, 4, 6, 8];

d_ref = 1000;  % Reference distance for comparison
PL_env = zeros(size(n_env));
fade_margin_env = zeros(size(sigma_env));

for i = 1:length(n_env)
    PL_env(i) = PL_d0 + 10*n_env(i)*log10(d_ref/d0);
    fade_margin_env(i) = 2 * sigma_env(i);  % 95% reliability
end

% Stacked bar showing path loss and fade margin
bar_data = [PL_env; fade_margin_env]';
bar(bar_data, 'stacked');

set(gca, 'XTickLabel', environments);
title(sprintf('Environment Comparison (d = %d m)', d_ref), 'FontSize', 12);
xlabel('Environment Type');
ylabel('Loss (dB)');
legend('Path Loss', 'Fade Margin (95%)', 'Location', 'northwest');
grid on;

% Rotate x-axis labels
xtickangle(45);

%% Part XI: Power Delay Profile Impact

subplot(3, 4, 11);
% Simplified power delay profile for different environments
tau_max = [0, 1, 5, 10, 20];  % Maximum delay spread (μs)
env_names = {'LOS', 'Rural', 'Suburban', 'Urban', 'Dense Urban'};

for i = 1:length(tau_max)
    if tau_max(i) == 0
        % Line of sight - single path
        tau = 0;
        power = 1;
    else
        % Exponential decay profile
        tau = linspace(0, tau_max(i), 100);
        power = exp(-tau / (tau_max(i)/3));
    end
    
    plot(tau, 10*log10(power), 'LineWidth', 2);
    hold on;
end

grid on;
title('Power Delay Profiles', 'FontSize', 12);
xlabel('Delay (\mus)');
ylabel('Relative Power (dB)');
legend(env_names, 'Location', 'northeast');

%% Part XII: Summary Statistics

subplot(3, 4, 12);
axis off;

% Create summary table
summary_text = {
    'SUMMARY STATISTICS';
    '==================';
    '';
    'System Parameters:';
    sprintf('  Transmit Power: %d dBm', Pt_dBm);
    sprintf('  Carrier Frequency: %.1f GHz', fc/1e9);
    sprintf('  Wavelength: %.3f m', lambda);
    '';
    'Path Loss at 1 km:';
    sprintf('  Free Space (n=2): %.1f dB', PL_d0 + 10*2*log10(1000/d0));
    sprintf('  Urban (n=3): %.1f dB', PL_d0 + 10*3*log10(1000/d0));
    sprintf('  Dense Urban (n=4): %.1f dB', PL_d0 + 10*4*log10(1000/d0));
    '';
    'Coverage (95% reliability):';
    sprintf('  No shadowing: %.0f m', max_range(1));
    sprintf('  6 dB shadowing: %.0f m', max_range(3));
    '';
    'Key Findings:';
    '• Higher frequency = higher path loss';
    '• Urban environments have higher n';
    '• Shadowing reduces coverage significantly';
    '• Fade margin essential for reliability'
};

text(0.05, 0.95, summary_text, 'Units', 'normalized', 'FontSize', 10, ...
     'VerticalAlignment', 'top', 'FontName', 'FixedWidth');

%% Display Final Results
fprintf('\n=== FINAL ANALYSIS SUMMARY ===\n');
fprintf('==============================\n');
fprintf('Free space path loss at 1 km: %.1f dB\n', 20*log10(4*pi*1000*fc/c));
fprintf('Urban path loss at 1 km: %.1f dB\n', PL_d0 + 10*3*log10(1000/d0));
fprintf('Coverage without shadowing: %.0f m\n', max_range(1));
fprintf('Coverage with 6 dB shadowing: %.0f m\n', max_range(3));
fprintf('Coverage reduction due to shadowing: %.1f%%\n', ...
        (1 - max_range(3)/max_range(1)) * 100);

%% Save Results
saveas(gcf, 'path_loss_shadowing_analysis.png');
saveas(gcf, 'path_loss_shadowing_analysis.fig');

fprintf('\nPlots saved as path_loss_shadowing_analysis.png and .fig\n');
fprintf('Analysis complete!\n');