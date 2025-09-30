# Assignment 1: Gaussian Random Variable Distribution

## Objective
Create MATLAB code to generate and plot a Gaussian random variable distribution, demonstrating understanding of probability distributions and MATLAB programming.

## Theory
A Gaussian (Normal) distribution is a continuous probability distribution characterized by:
- **Mean (μ)**: The center of the distribution
- **Standard deviation (σ)**: The spread of the distribution
- **Probability Density Function**: f(x) = (1/(σ√(2π))) * e^(-(x-μ)²/(2σ²))

## MATLAB Implementation

### Code Structure
The MATLAB code performs the following operations:
1. Generate random samples from a Gaussian distribution
2. Create multiple visualizations to analyze the distribution
3. Compare empirical results with theoretical values
4. Display statistical measures

### Complete MATLAB Code

```matlab
% Assignment 1: Gaussian Random Variable Distribution
% This MATLAB code generates and plots a Gaussian (Normal) random variable distribution

clear all;
close all;
clc;

% Parameters for Gaussian distribution
mu = 0;        % Mean
sigma = 1;     % Standard deviation
n_samples = 1000;  % Number of samples

% Generate Gaussian random variables
gaussian_samples = normrnd(mu, sigma, n_samples, 1);

% Create figure with subplots
figure('Position', [100, 100, 1200, 800]);

% Subplot 1: Histogram of generated samples
subplot(2, 2, 1);
histogram(gaussian_samples, 50, 'Normalization', 'pdf', 'FaceColor', 'blue', 'EdgeColor', 'black');
hold on;
x = linspace(min(gaussian_samples), max(gaussian_samples), 100);
theoretical_pdf = normpdf(x, mu, sigma);
plot(x, theoretical_pdf, 'r-', 'LineWidth', 2);
title('Histogram vs Theoretical PDF');
xlabel('Value');
ylabel('Probability Density');
legend('Sample Histogram', 'Theoretical PDF', 'Location', 'best');
grid on;

% Subplot 2: Q-Q plot to check normality
subplot(2, 2, 2);
qqplot(gaussian_samples);
title('Q-Q Plot (Normal Distribution Check)');
grid on;

% Subplot 3: Time series plot of samples
subplot(2, 2, 3);
plot(1:n_samples, gaussian_samples, 'b-', 'LineWidth', 0.5);
title('Time Series of Gaussian Samples');
xlabel('Sample Number');
ylabel('Value');
grid on;

% Subplot 4: Cumulative Distribution Function
subplot(2, 2, 4);
[f, x_cdf] = ecdf(gaussian_samples);
plot(x_cdf, f, 'b-', 'LineWidth', 2);
hold on;
x_theoretical = linspace(min(gaussian_samples), max(gaussian_samples), 100);
theoretical_cdf = normcdf(x_theoretical, mu, sigma);
plot(x_theoretical, theoretical_cdf, 'r--', 'LineWidth', 2);
title('Empirical vs Theoretical CDF');
xlabel('Value');
ylabel('Cumulative Probability');
legend('Empirical CDF', 'Theoretical CDF', 'Location', 'best');
grid on;

% Add main title
sgtitle(sprintf('Gaussian Distribution Analysis (μ=%.1f, σ=%.1f, N=%d)', mu, sigma, n_samples));

% Display statistics
fprintf('=== Gaussian Distribution Statistics ===\n');
fprintf('Theoretical Mean: %.2f\n', mu);
fprintf('Sample Mean: %.4f\n', mean(gaussian_samples));
fprintf('Theoretical Std: %.2f\n', sigma);
fprintf('Sample Std: %.4f\n', std(gaussian_samples));
fprintf('Sample Variance: %.4f\n', var(gaussian_samples));
fprintf('Sample Skewness: %.4f\n', skewness(gaussian_samples));
fprintf('Sample Kurtosis: %.4f\n', kurtosis(gaussian_samples));

% Save the figure
saveas(gcf, 'gaussian_distribution_plot.png');
saveas(gcf, 'gaussian_distribution_plot.fig');

fprintf('\nPlots saved as gaussian_distribution_plot.png and .fig\n');
```

## Code Explanation

### Key Functions Used:
- **`normrnd(mu, sigma, n, 1)`**: Generates n random samples from normal distribution
- **`histogram()`**: Creates histogram with probability density normalization
- **`normpdf()`**: Calculates theoretical probability density function
- **`qqplot()`**: Creates quantile-quantile plot for normality testing
- **`ecdf()`**: Computes empirical cumulative distribution function
- **`normcdf()`**: Calculates theoretical cumulative distribution function

### Visualization Components:
1. **Histogram vs Theoretical PDF**: Compares sample distribution with theoretical curve
2. **Q-Q Plot**: Tests if samples follow normal distribution
3. **Time Series**: Shows random nature of generated samples
4. **CDF Comparison**: Compares empirical and theoretical cumulative distributions

## Expected Results

### Statistical Output:
```
=== Gaussian Distribution Statistics ===
Theoretical Mean: 0.00
Sample Mean: [close to 0.00]
Theoretical Std: 1.00
Sample Std: [close to 1.00]
Sample Variance: [close to 1.00]
Sample Skewness: [close to 0.00]
Sample Kurtosis: [close to 3.00]
```

### Plot Descriptions:
- **Top Left**: Histogram overlaid with theoretical PDF (red curve)
- **Top Right**: Q-Q plot showing linearity (indicates normality)
- **Bottom Left**: Time series of random samples
- **Bottom Right**: Empirical vs theoretical CDF comparison

## Instructions to Run:
1. Copy the MATLAB code into a new script file
2. Save as `gaussian_distribution.m`
3. Run the script in MATLAB
4. Observe the generated plots and console output
5. Check for saved image files in the working directory

## Learning Outcomes:
- Understanding Gaussian distribution properties
- MATLAB programming for statistical analysis
- Data visualization techniques
- Comparison of empirical vs theoretical results
- Statistical validation methods

## Files Generated:
- `gaussian_distribution_plot.png`: High-resolution plot image
- `gaussian_distribution_plot.fig`: MATLAB figure file for editing

---
*Assignment completed successfully with comprehensive analysis and visualization of Gaussian random variables.*