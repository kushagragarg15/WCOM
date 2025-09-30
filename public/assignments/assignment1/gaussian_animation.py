# -*- coding: utf-8 -*-
"""
WCOM Lab Assignment 1: Animated Gaussian Distribution Learning
==============================================================

This program generates and animates the learning/intuition behind the Gaussian (normal) 
distribution for wireless communication applications. It demonstrates how sample statistics 
converge to theoretical values as sample size increases.

Author: WCOM Lab - LNMIIT
Course: Wireless Communication Laboratory
Assignment: 1 - Gaussian Random Variable Distribution with Animation
"""

import numpy as np
import scipy.stats as stats
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.patches as patches

# =============================================================================
# USER-CONFIGURABLE PARAMETERS
# =============================================================================

# Distribution parameters
mu = 0.0                    # Mean of the normal distribution
sigma = 1.0                 # Standard deviation of the normal distribution

# Animation parameters
initial_sample_size = 50    # Initial number of samples
max_sample_size = 2000      # Maximum number of samples
batch_size = 25             # Number of samples to add in each animation step
random_seed = 42            # Random seed for reproducibility

# Animation settings
animation_interval = 300    # Milliseconds between frames
save_animation = False      # Set to True to save animation as GIF/MP4

# =============================================================================
# INITIALIZATION
# =============================================================================

print("=" * 60)
print("WCOM Lab - Gaussian Distribution Animation")
print("=" * 60)
print(f"Parameters: μ={mu}, σ={sigma}")
print(f"Sample progression: {initial_sample_size} → {max_sample_size} (batch: {batch_size})")
print("=" * 60)

# Initialize random number generator
np.random.seed(random_seed)

# Generate initial samples
samples = np.random.normal(loc=mu, scale=sigma, size=initial_sample_size)

print(f"Initial samples generated: {len(samples)}")
print(f"Initial sample statistics:")
print(f"  Mean: {np.mean(samples):.4f} (theoretical: {mu})")
print(f"  Std:  {np.std(samples, ddof=1):.4f} (theoretical: {sigma})")

# =============================================================================
# FIGURE AND SUBPLOT SETUP
# =============================================================================

# Create figure with enhanced styling for WCOM lab
plt.style.use('default')
fig = plt.figure(figsize=(15, 10))
fig.suptitle('WCOM Lab: Gaussian Distribution Learning Animation\n' + 
             f'μ={mu}, σ={sigma} | Wireless Communication Applications', 
             fontsize=16, fontweight='bold', y=0.95)

# Create 2x2 grid of subplots with custom spacing
gs = fig.add_gridspec(2, 2, hspace=0.3, wspace=0.3, 
                      left=0.08, right=0.95, top=0.85, bottom=0.25)

ax_hist = fig.add_subplot(gs[0, 0])
ax_time = fig.add_subplot(gs[0, 1])
ax_qq = fig.add_subplot(gs[1, 0])
ax_cdf = fig.add_subplot(gs[1, 1])

axes = [ax_hist, ax_time, ax_qq, ax_cdf]

# Set initial titles with WCOM context
ax_hist.set_title("Signal Amplitude Distribution\n(Histogram vs Theoretical PDF)", fontsize=12)
ax_time.set_title("Signal Samples Over Time\n(Time Series)", fontsize=12)
ax_qq.set_title("Normality Check\n(Q-Q Plot)", fontsize=12)
ax_cdf.set_title("Cumulative Distribution\n(Empirical vs Theoretical CDF)", fontsize=12)

# =============================================================================
# PLOTTING FUNCTIONS
# =============================================================================

def plot_histogram(samples, ax, mu, sigma):
    """
    Plots histogram with theoretical PDF and smoothed empirical distribution.
    Relevant for analyzing signal amplitude distributions in wireless systems.
    """
    ax.clear()
    
    # Plot histogram
    n, bins, patches = ax.hist(samples, bins=min(50, len(samples)//10), 
                              density=True, alpha=0.7, color='skyblue', 
                              edgecolor='navy', linewidth=0.5,
                              label='Empirical Histogram')
    
    # Theoretical PDF
    x_range = np.linspace(samples.min() - 0.5*sigma, samples.max() + 0.5*sigma, 200)
    theoretical_pdf = stats.norm.pdf(x_range, mu, sigma)
    ax.plot(x_range, theoretical_pdf, 'r-', linewidth=3, 
            label='Theoretical PDF', alpha=0.9)
    
    # Smoothed empirical distribution (KDE)
    if len(samples) > 10:
        try:
            kde = stats.gaussian_kde(samples)
            ax.plot(x_range, kde(x_range), 'g--', linewidth=2, 
                   label='Smoothed Empirical', alpha=0.8)
        except:
            pass
    
    ax.set_title("Signal Amplitude Distribution\n(Histogram vs Theoretical PDF)", fontsize=12)
    ax.set_xlabel("Signal Amplitude")
    ax.set_ylabel("Probability Density")
    ax.legend(loc='upper right', fontsize=10)
    ax.grid(True, alpha=0.3)

def plot_time_series(samples, ax):
    """
    Plots samples as time series - relevant for signal analysis over time.
    """
    ax.clear()
    
    # Plot samples with different colors for recent additions
    sample_indices = np.arange(len(samples))
    
    # Older samples in blue
    if len(samples) > batch_size:
        ax.plot(sample_indices[:-batch_size], samples[:-batch_size], 
               'b.', alpha=0.6, markersize=3, label='Previous samples')
    
    # Recent samples in red
    recent_start = max(0, len(samples) - batch_size)
    ax.plot(sample_indices[recent_start:], samples[recent_start:], 
           'r.', alpha=0.8, markersize=4, label='Recent samples')
    
    # Add theoretical mean line
    ax.axhline(y=mu, color='green', linestyle='--', linewidth=2, 
              label=f'Theoretical Mean (μ={mu})')
    
    # Add ±σ bounds
    ax.axhline(y=mu + sigma, color='orange', linestyle=':', alpha=0.7, 
              label=f'μ ± σ bounds')
    ax.axhline(y=mu - sigma, color='orange', linestyle=':', alpha=0.7)
    
    ax.set_title("Signal Samples Over Time\n(Time Series)", fontsize=12)
    ax.set_xlabel("Sample Index (Time)")
    ax.set_ylabel("Signal Amplitude")
    ax.legend(loc='upper right', fontsize=10)
    ax.grid(True, alpha=0.3)

def plot_qq(samples, ax, mu, sigma):
    """
    Q-Q plot for normality testing - important for validating Gaussian assumptions
    in wireless channel modeling.
    """
    ax.clear()
    
    # Generate Q-Q plot
    stats.probplot(samples, dist="norm", sparams=(mu, sigma), plot=ax)
    
    # Enhance the plot
    ax.get_lines()[0].set_markerfacecolor('blue')
    ax.get_lines()[0].set_markeredgecolor('darkblue')
    ax.get_lines()[0].set_markersize(4)
    ax.get_lines()[0].set_alpha(0.7)
    
    ax.get_lines()[1].set_color('red')
    ax.get_lines()[1].set_linewidth(2)
    
    ax.set_title("Normality Check\n(Q-Q Plot)", fontsize=12)
    ax.set_xlabel("Theoretical Quantiles")
    ax.set_ylabel("Sample Quantiles")
    ax.grid(True, alpha=0.3)
    
    # Add R² correlation coefficient
    theoretical_quantiles = stats.norm.ppf(np.linspace(0.01, 0.99, len(samples)), mu, sigma)
    sample_quantiles = np.sort(samples)
    if len(theoretical_quantiles) == len(sample_quantiles):
        r_squared = np.corrcoef(theoretical_quantiles, sample_quantiles)[0, 1]**2
        ax.text(0.05, 0.95, f'R² = {r_squared:.4f}', transform=ax.transAxes,
               bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8),
               fontsize=10)

def plot_cdf(samples, ax, mu, sigma):
    """
    Empirical vs Theoretical CDF comparison - useful for channel characterization.
    """
    ax.clear()
    
    # Empirical CDF
    sorted_samples = np.sort(samples)
    y_empirical = np.arange(1, len(sorted_samples) + 1) / len(sorted_samples)
    ax.plot(sorted_samples, y_empirical, 'b-', linewidth=2, 
           label='Empirical CDF', alpha=0.8)
    
    # Theoretical CDF
    x_range = np.linspace(sorted_samples.min(), sorted_samples.max(), 200)
    theoretical_cdf = stats.norm.cdf(x_range, mu, sigma)
    ax.plot(x_range, theoretical_cdf, 'r--', linewidth=2, 
           label='Theoretical CDF', alpha=0.9)
    
    ax.set_title("Cumulative Distribution\n(Empirical vs Theoretical CDF)", fontsize=12)
    ax.set_xlabel("Signal Amplitude")
    ax.set_ylabel("Cumulative Probability")
    ax.legend(loc='lower right', fontsize=10)
    ax.grid(True, alpha=0.3)
    
    # Add shaded area showing difference
    if len(x_range) == len(theoretical_cdf):
        empirical_interp = np.interp(x_range, sorted_samples, y_empirical)
        ax.fill_between(x_range, empirical_interp, theoretical_cdf, 
                       alpha=0.2, color='gray', label='Difference')

# =============================================================================
# STATISTICS CALCULATION
# =============================================================================

def calculate_statistics(samples, mu, sigma):
    """
    Calculate comprehensive statistics for wireless communication analysis.
    """
    n = len(samples)
    emp_mean = np.mean(samples)
    emp_var = np.var(samples, ddof=1)
    emp_std = np.sqrt(emp_var)
    
    # Errors
    mean_error = abs(emp_mean - mu)
    var_error = abs(emp_var - sigma**2)
    
    # Statistical tests
    ks_stat, ks_pvalue = stats.kstest(samples, 'norm', args=(mu, sigma))
    
    # Additional wireless-relevant statistics
    snr_db = 20 * np.log10(abs(emp_mean) / emp_std) if emp_std > 0 else float('inf')
    
    # Peak-to-Average Power Ratio (PAPR) - relevant for OFDM systems
    peak_power = np.max(samples**2)
    avg_power = np.mean(samples**2)
    papr_db = 10 * np.log10(peak_power / avg_power) if avg_power > 0 else float('inf')
    
    return {
        'n': n,
        'emp_mean': emp_mean,
        'emp_var': emp_var,
        'emp_std': emp_std,
        'mean_error': mean_error,
        'var_error': var_error,
        'ks_stat': ks_stat,
        'ks_pvalue': ks_pvalue,
        'snr_db': snr_db,
        'papr_db': papr_db
    }

# =============================================================================
# ANIMATION SETUP
# =============================================================================

# Create statistics display area
stats_ax = fig.add_axes([0.08, 0.02, 0.4, 0.2])
stats_ax.axis('off')

# Create progress bar
progress_ax = fig.add_axes([0.55, 0.15, 0.35, 0.03])
progress_ax.set_xlim(0, 1)
progress_ax.set_ylim(0, 1)
progress_ax.axis('off')

# Progress bar elements
progress_bg = patches.Rectangle((0, 0.3), 1, 0.4, facecolor='lightgray', edgecolor='black')
progress_bar = patches.Rectangle((0, 0.3), 0, 0.4, facecolor='green', alpha=0.7)
progress_ax.add_patch(progress_bg)
progress_ax.add_patch(progress_bar)

# WCOM Lab info
info_ax = fig.add_axes([0.55, 0.02, 0.4, 0.12])
info_ax.axis('off')
info_text = ("WCOM Lab Applications:\n"
            "• Signal amplitude modeling\n"
            "• Channel noise characterization\n"
            "• OFDM system analysis\n"
            "• Quality metrics (SNR, PAPR)")
info_ax.text(0, 1, info_text, transform=info_ax.transAxes, fontsize=10,
            verticalalignment='top', bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.3))

def update_frame(frame):
    """
    Animation update function called for each frame.
    """
    global samples
    
    current_size = len(samples)
    
    # Calculate new samples to add
    if current_size + batch_size > max_sample_size:
        new_count = max_sample_size - current_size
    else:
        new_count = batch_size
    
    if new_count <= 0:
        return []
    
    # Generate new samples
    new_samples = np.random.normal(loc=mu, scale=sigma, size=new_count)
    samples = np.append(samples, new_samples)
    
    # Update all plots
    plot_histogram(samples, ax_hist, mu, sigma)
    plot_time_series(samples, ax_time)
    plot_qq(samples, ax_qq, mu, sigma)
    plot_cdf(samples, ax_cdf, mu, sigma)
    
    # Calculate and display statistics
    stats = calculate_statistics(samples, mu, sigma)
    
    stats_text = (
        f"SAMPLE STATISTICS (n = {stats['n']})\n"
        f"{'='*40}\n"
        f"Empirical Mean:     {stats['emp_mean']:8.4f}  (Error: {stats['mean_error']:.4f})\n"
        f"Theoretical Mean:   {mu:8.4f}\n"
        f"Empirical Variance: {stats['emp_var']:8.4f}  (Error: {stats['var_error']:.4f})\n"
        f"Theoretical Var:    {sigma**2:8.4f}\n"
        f"Empirical Std:      {stats['emp_std']:8.4f}\n"
        f"\nSTATISTICAL TESTS\n"
        f"{'='*40}\n"
        f"KS Statistic:       {stats['ks_stat']:8.4f}\n"
        f"KS p-value:         {stats['ks_pvalue']:8.4f}\n"
        f"\nWCOM METRICS\n"
        f"{'='*40}\n"
        f"SNR (dB):           {stats['snr_db']:8.2f}\n"
        f"PAPR (dB):          {stats['papr_db']:8.2f}"
    )
    
    stats_ax.clear()
    stats_ax.axis('off')
    stats_ax.text(0, 1, stats_text, transform=stats_ax.transAxes, fontsize=9,
                 verticalalignment='top', fontfamily='monospace',
                 bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8))
    
    # Update progress bar
    progress = len(samples) / max_sample_size
    progress_bar.set_width(progress)
    
    # Add annotations at key frames
    if frame == 0:
        ax_hist.annotate("Starting: Small sample, high variability", 
                        xy=(0.02, 0.98), xycoords='axes fraction',
                        bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.7),
                        fontsize=9)
    elif len(samples) >= max_sample_size * 0.25 and len(samples) < max_sample_size * 0.25 + batch_size:
        ax_hist.annotate("25% complete: Shape emerging", 
                        xy=(0.02, 0.90), xycoords='axes fraction',
                        bbox=dict(boxstyle='round', facecolor='orange', alpha=0.7),
                        fontsize=9)
    elif len(samples) >= max_sample_size * 0.75 and len(samples) < max_sample_size * 0.75 + batch_size:
        ax_hist.annotate("75% complete: Converging to theory", 
                        xy=(0.02, 0.82), xycoords='axes fraction',
                        bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.7),
                        fontsize=9)
    elif len(samples) == max_sample_size:
        ax_hist.annotate("Complete: Law of Large Numbers demonstrated!", 
                        xy=(0.02, 0.74), xycoords='axes fraction',
                        bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.7),
                        fontsize=9)
    
    return []

# =============================================================================
# ANIMATION EXECUTION
# =============================================================================

# Calculate number of frames
num_frames = (max_sample_size - initial_sample_size) // batch_size + 1
if (max_sample_size - initial_sample_size) % batch_size != 0:
    num_frames += 1

print(f"Animation frames: {num_frames}")
print(f"Animation duration: ~{num_frames * animation_interval / 1000:.1f} seconds")

# Create animation
anim = FuncAnimation(fig, update_frame, frames=num_frames, 
                    interval=animation_interval, blit=False, repeat=False)

# Display initial plots
plot_histogram(samples, ax_hist, mu, sigma)
plot_time_series(samples, ax_time)
plot_qq(samples, ax_qq, mu, sigma)
plot_cdf(samples, ax_cdf, mu, sigma)

# Initial statistics
initial_stats = calculate_statistics(samples, mu, sigma)
print(f"Animation ready. Initial KS statistic: {initial_stats['ks_stat']:.4f}")

# Save animation if requested
if save_animation:
    print("Saving animation...")
    try:
        anim.save('wcom_gaussian_animation.gif', writer='pillow', fps=3)
        print("Animation saved as 'wcom_gaussian_animation.gif'")
    except:
        print("Could not save animation. Install pillow or ffmpeg for saving.")

# Show the animation
plt.tight_layout()
plt.show()

print("\nAnimation complete!")
print("Key learning points demonstrated:")
print("1. Law of Large Numbers - sample statistics converge to population parameters")
print("2. Central Limit Theorem - sample distribution approaches normal")
print("3. Statistical validation through KS test and Q-Q plot")
print("4. Wireless communication relevance - signal modeling and characterization")