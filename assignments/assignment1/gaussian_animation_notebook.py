# This file can be converted to Jupyter notebook using: jupyter nbconvert --to notebook gaussian_animation_notebook.py

# %% [markdown]
"""
# WCOM Lab Assignment 1: Animated Gaussian Distribution Learning

**Course:** Wireless Communication Laboratory  
**Institution:** The LNM Institute of Information Technology  
**Assignment:** Gaussian Random Variable Distribution with Interactive Animation

---

## 📚 Learning Objectives

This interactive notebook demonstrates:
- **Law of Large Numbers**: How sample statistics converge to theoretical values
- **Central Limit Theorem**: Distribution shape convergence
- **Statistical Validation**: Using KS tests and Q-Q plots
- **Wireless Applications**: Signal modeling and channel characterization

## 🎯 Wireless Communication Relevance

Gaussian distributions are fundamental in wireless communications for:
- **Signal Modeling**: Amplitude and phase variations
- **Noise Characterization**: AWGN channel modeling
- **OFDM Systems**: Subcarrier amplitude analysis
- **Quality Metrics**: SNR and PAPR calculations
"""

# %% [markdown]
"""
## 🔧 Setup and Installation
"""

# %%
# Install required packages (run if needed)
# !pip install numpy scipy matplotlib jupyter

import numpy as np
import scipy.stats as stats
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.patches as patches
import warnings
warnings.filterwarnings('ignore')

# Configure matplotlib for Jupyter
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = 'white'

print("✅ Libraries imported successfully!")
print(f"NumPy version: {np.__version__}")
print(f"Matplotlib version: {plt.matplotlib.__version__}")

# %% [markdown]
"""
## ⚙️ Configuration Parameters

Modify these parameters to explore different scenarios:
"""

# %%
# =============================================================================
# USER-CONFIGURABLE PARAMETERS
# =============================================================================

# Distribution parameters
mu = 0.0                    # Mean of the normal distribution
sigma = 1.0                 # Standard deviation of the normal distribution

# Animation parameters
initial_sample_size = 50    # Initial number of samples
max_sample_size = 1500      # Maximum number of samples
batch_size = 25             # Number of samples to add in each animation step
random_seed = 42            # Random seed for reproducibility

# Animation settings
animation_interval = 400    # Milliseconds between frames
save_animation = False      # Set to True to save animation

print("📊 Configuration Summary:")
print(f"   Distribution: N(μ={mu}, σ²={sigma**2})")
print(f"   Sample progression: {initial_sample_size} → {max_sample_size}")
print(f"   Batch size: {batch_size} samples per frame")
print(f"   Animation speed: {animation_interval}ms per frame")
print(f"   Expected frames: {(max_sample_size - initial_sample_size) // batch_size + 1}")

# %% [markdown]
"""
## 🎲 Sample Generation and Initialization
"""

# %%
# Initialize random number generator
np.random.seed(random_seed)

# Generate initial samples
samples = np.random.normal(loc=mu, scale=sigma, size=initial_sample_size)

print(f"🎯 Initial samples generated: {len(samples)}")
print(f"📈 Initial statistics:")
print(f"   Sample mean: {np.mean(samples):.4f} (theoretical: {mu})")
print(f"   Sample std:  {np.std(samples, ddof=1):.4f} (theoretical: {sigma})")
print(f"   Min value:   {np.min(samples):.4f}")
print(f"   Max value:   {np.max(samples):.4f}")

# Display first few samples
print(f"\n🔍 First 10 samples: {samples[:10]}")

# %% [markdown]
"""
## 📊 Plotting Functions

These functions create the four synchronized visualizations:
"""

# %%
def plot_histogram(samples, ax, mu, sigma):
    """
    Plots histogram with theoretical PDF and smoothed empirical distribution.
    Relevant for analyzing signal amplitude distributions in wireless systems.
    """
    ax.clear()
    
    # Plot histogram
    n, bins, patches = ax.hist(samples, bins=min(50, max(10, len(samples)//20)), 
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
    
    ax.set_title("Signal Amplitude Distribution\n(Histogram vs Theoretical PDF)", fontsize=11)
    ax.set_xlabel("Signal Amplitude")
    ax.set_ylabel("Probability Density")
    ax.legend(loc='upper right', fontsize=9)
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
    
    ax.set_title("Signal Samples Over Time\n(Time Series)", fontsize=11)
    ax.set_xlabel("Sample Index (Time)")
    ax.set_ylabel("Signal Amplitude")
    ax.legend(loc='upper right', fontsize=9)
    ax.grid(True, alpha=0.3)

def plot_qq(samples, ax, mu, sigma):
    """
    Q-Q plot for normality testing - important for validating Gaussian assumptions.
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
    
    ax.set_title("Normality Check\n(Q-Q Plot)", fontsize=11)
    ax.set_xlabel("Theoretical Quantiles")
    ax.set_ylabel("Sample Quantiles")
    ax.grid(True, alpha=0.3)
    
    # Add R² correlation coefficient
    if len(samples) > 3:
        sorted_samples = np.sort(samples)
        theoretical_quantiles = stats.norm.ppf(np.linspace(0.01, 0.99, len(samples)), mu, sigma)
        if len(theoretical_quantiles) == len(sorted_samples):
            r_squared = np.corrcoef(theoretical_quantiles, sorted_samples)[0, 1]**2
            ax.text(0.05, 0.95, f'R² = {r_squared:.4f}', transform=ax.transAxes,
                   bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8),
                   fontsize=9)

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
    
    ax.set_title("Cumulative Distribution\n(Empirical vs Theoretical CDF)", fontsize=11)
    ax.set_xlabel("Signal Amplitude")
    ax.set_ylabel("Cumulative Probability")
    ax.legend(loc='lower right', fontsize=9)
    ax.grid(True, alpha=0.3)

print("✅ Plotting functions defined successfully!")

# %% [markdown]
"""
## 📈 Statistics Calculation

Function to calculate comprehensive statistics relevant to wireless communications:
"""

# %%
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
    
    # Confidence intervals
    confidence_level = 0.95
    alpha = 1 - confidence_level
    t_critical = stats.t.ppf(1 - alpha/2, n-1)
    margin_error = t_critical * emp_std / np.sqrt(n)
    ci_lower = emp_mean - margin_error
    ci_upper = emp_mean + margin_error
    
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
        'papr_db': papr_db,
        'ci_lower': ci_lower,
        'ci_upper': ci_upper,
        'margin_error': margin_error
    }

# Test the function with initial samples
initial_stats = calculate_statistics(samples, mu, sigma)
print("📊 Initial Statistics:")
print(f"   Sample size: {initial_stats['n']}")
print(f"   Empirical mean: {initial_stats['emp_mean']:.4f} ± {initial_stats['margin_error']:.4f}")
print(f"   KS statistic: {initial_stats['ks_stat']:.4f} (p-value: {initial_stats['ks_pvalue']:.4f})")
print(f"   PAPR: {initial_stats['papr_db']:.2f} dB")

# %% [markdown]
"""
## 🎬 Animation Setup and Execution

Create the interactive animation showing the convergence process:
"""

# %%
# Create the main figure
plt.style.use('default')
fig = plt.figure(figsize=(16, 12))
fig.suptitle('WCOM Lab: Gaussian Distribution Learning Animation\n' + 
             f'μ={mu}, σ={sigma} | Wireless Communication Applications', 
             fontsize=16, fontweight='bold', y=0.95)

# Create 2x2 grid of subplots
gs = fig.add_gridspec(2, 2, hspace=0.35, wspace=0.3, 
                      left=0.08, right=0.95, top=0.85, bottom=0.35)

ax_hist = fig.add_subplot(gs[0, 0])
ax_time = fig.add_subplot(gs[0, 1])
ax_qq = fig.add_subplot(gs[1, 0])
ax_cdf = fig.add_subplot(gs[1, 1])

# Create statistics display area
stats_ax = fig.add_axes([0.08, 0.02, 0.45, 0.28])
stats_ax.axis('off')

# Create progress bar
progress_ax = fig.add_axes([0.58, 0.25, 0.35, 0.03])
progress_ax.set_xlim(0, 1)
progress_ax.set_ylim(0, 1)
progress_ax.axis('off')

# Progress bar elements
progress_bg = patches.Rectangle((0, 0.3), 1, 0.4, facecolor='lightgray', edgecolor='black')
progress_bar = patches.Rectangle((0, 0.3), 0, 0.4, facecolor='green', alpha=0.7)
progress_ax.add_patch(progress_bg)
progress_ax.add_patch(progress_bar)
progress_text = progress_ax.text(0.5, 0.5, '0%', ha='center', va='center', fontweight='bold')

# WCOM Lab info
info_ax = fig.add_axes([0.58, 0.02, 0.35, 0.22])
info_ax.axis('off')
info_text = ("🔬 WCOM Lab Applications:\n\n"
            "📡 Signal amplitude modeling\n"
            "🌊 Channel noise characterization\n"
            "📊 OFDM system analysis\n"
            "📈 Quality metrics (SNR, PAPR)\n\n"
            "🎯 Learning Goals:\n"
            "• Law of Large Numbers\n"
            "• Central Limit Theorem\n"
            "• Statistical validation")
info_ax.text(0, 1, info_text, transform=info_ax.transAxes, fontsize=10,
            verticalalignment='top', 
            bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.3))

print("🎬 Animation setup complete!")

# %%
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
    
    # Determine convergence status
    convergence_status = "🔴 Poor" if stats['ks_stat'] > 0.1 else "🟡 Fair" if stats['ks_stat'] > 0.05 else "🟢 Good"
    
    stats_text = (
        f"📊 SAMPLE STATISTICS (n = {stats['n']:,})\n"
        f"{'='*50}\n"
        f"📈 Empirical Mean:     {stats['emp_mean']:8.4f}  (Error: {stats['mean_error']:.4f})\n"
        f"🎯 Theoretical Mean:   {mu:8.4f}\n"
        f"📊 Empirical Variance: {stats['emp_var']:8.4f}  (Error: {stats['var_error']:.4f})\n"
        f"🎯 Theoretical Var:    {sigma**2:8.4f}\n"
        f"📏 Empirical Std:      {stats['emp_std']:8.4f}\n"
        f"🔍 95% Confidence:     [{stats['ci_lower']:.4f}, {stats['ci_upper']:.4f}]\n\n"
        f"🧪 STATISTICAL TESTS\n"
        f"{'='*50}\n"
        f"📋 KS Statistic:       {stats['ks_stat']:8.4f}\n"
        f"📊 KS p-value:         {stats['ks_pvalue']:8.4f}\n"
        f"✅ Convergence:        {convergence_status}\n\n"
        f"📡 WCOM METRICS\n"
        f"{'='*50}\n"
        f"📶 SNR (dB):           {stats['snr_db']:8.2f}\n"
        f"⚡ PAPR (dB):          {stats['papr_db']:8.2f}"
    )
    
    stats_ax.clear()
    stats_ax.axis('off')
    stats_ax.text(0, 1, stats_text, transform=stats_ax.transAxes, fontsize=9,
                 verticalalignment='top', fontfamily='monospace',
                 bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8))
    
    # Update progress bar
    progress = len(samples) / max_sample_size
    progress_bar.set_width(progress)
    progress_text.set_text(f'{progress*100:.1f}%')
    
    # Add annotations at key frames
    if frame == 0:
        ax_hist.annotate("🚀 Starting: Small sample, high variability", 
                        xy=(0.02, 0.98), xycoords='axes fraction',
                        bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.7),
                        fontsize=9)
    elif len(samples) >= max_sample_size * 0.25 and len(samples) < max_sample_size * 0.25 + batch_size:
        ax_hist.annotate("📈 25% complete: Shape emerging", 
                        xy=(0.02, 0.90), xycoords='axes fraction',
                        bbox=dict(boxstyle='round', facecolor='orange', alpha=0.7),
                        fontsize=9)
    elif len(samples) >= max_sample_size * 0.50 and len(samples) < max_sample_size * 0.50 + batch_size:
        ax_hist.annotate("📊 50% complete: Distribution stabilizing", 
                        xy=(0.02, 0.82), xycoords='axes fraction',
                        bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.7),
                        fontsize=9)
    elif len(samples) >= max_sample_size * 0.75 and len(samples) < max_sample_size * 0.75 + batch_size:
        ax_hist.annotate("🎯 75% complete: Converging to theory", 
                        xy=(0.02, 0.74), xycoords='axes fraction',
                        bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.7),
                        fontsize=9)
    elif len(samples) == max_sample_size:
        ax_hist.annotate("🏆 Complete: Law of Large Numbers demonstrated!", 
                        xy=(0.02, 0.66), xycoords='axes fraction',
                        bbox=dict(boxstyle='round', facecolor='gold', alpha=0.8),
                        fontsize=9, fontweight='bold')
    
    return []

# Calculate number of frames
num_frames = (max_sample_size - initial_sample_size) // batch_size + 1
if (max_sample_size - initial_sample_size) % batch_size != 0:
    num_frames += 1

print(f"🎬 Animation parameters:")
print(f"   Total frames: {num_frames}")
print(f"   Duration: ~{num_frames * animation_interval / 1000:.1f} seconds")
print(f"   Frame interval: {animation_interval}ms")

# Reset samples to initial state
np.random.seed(random_seed)
samples = np.random.normal(loc=mu, scale=sigma, size=initial_sample_size)

print("\n🎯 Ready to start animation!")

# %% [markdown]
"""
## ▶️ Run the Animation

Execute the cell below to start the interactive animation:
"""

# %%
# Create and run the animation
anim = FuncAnimation(fig, update_frame, frames=num_frames, 
                    interval=animation_interval, blit=False, repeat=False)

# Display initial plots
plot_histogram(samples, ax_hist, mu, sigma)
plot_time_series(samples, ax_time)
plot_qq(samples, ax_qq, mu, sigma)
plot_cdf(samples, ax_cdf, mu, sigma)

# Show initial statistics
initial_stats = calculate_statistics(samples, mu, sigma)
print(f"🎬 Animation started! Initial KS statistic: {initial_stats['ks_stat']:.4f}")

# Save animation if requested
if save_animation:
    print("💾 Saving animation...")
    try:
        anim.save('wcom_gaussian_animation.gif', writer='pillow', fps=2)
        print("✅ Animation saved as 'wcom_gaussian_animation.gif'")
    except Exception as e:
        print(f"❌ Could not save animation: {e}")

# Display the animation
plt.tight_layout()
plt.show()

# %% [markdown]
"""
## 📝 Analysis and Observations

After running the animation, analyze the results:
"""

# %%
# Final analysis
final_stats = calculate_statistics(samples, mu, sigma)

print("🏁 FINAL ANALYSIS REPORT")
print("=" * 60)
print(f"📊 Final sample size: {final_stats['n']:,}")
print(f"📈 Mean convergence: {final_stats['mean_error']:.6f} (target: 0)")
print(f"📊 Variance convergence: {final_stats['var_error']:.6f} (target: 0)")
print(f"🧪 KS test statistic: {final_stats['ks_stat']:.6f}")
print(f"📋 KS test p-value: {final_stats['ks_pvalue']:.6f}")

# Interpretation
print("\n🔍 INTERPRETATION:")
print("=" * 60)

if final_stats['ks_pvalue'] > 0.05:
    print("✅ PASS: Sample follows Gaussian distribution (p > 0.05)")
else:
    print("❌ FAIL: Sample may not follow Gaussian distribution (p ≤ 0.05)")

if final_stats['mean_error'] < 0.1:
    print("✅ EXCELLENT: Mean has converged well to theoretical value")
elif final_stats['mean_error'] < 0.2:
    print("🟡 GOOD: Mean is reasonably close to theoretical value")
else:
    print("❌ POOR: Mean has not converged well")

if final_stats['var_error'] < 0.1:
    print("✅ EXCELLENT: Variance has converged well to theoretical value")
elif final_stats['var_error'] < 0.2:
    print("🟡 GOOD: Variance is reasonably close to theoretical value")
else:
    print("❌ POOR: Variance has not converged well")

print("\n📡 WIRELESS COMMUNICATION INSIGHTS:")
print("=" * 60)
print(f"📶 Signal-to-Noise Ratio: {final_stats['snr_db']:.2f} dB")
print(f"⚡ Peak-to-Average Power Ratio: {final_stats['papr_db']:.2f} dB")
print(f"🎯 95% Confidence Interval: [{final_stats['ci_lower']:.4f}, {final_stats['ci_upper']:.4f}]")

print("\n🎓 KEY LEARNING OUTCOMES DEMONSTRATED:")
print("=" * 60)
print("1. ✅ Law of Large Numbers - sample statistics converge to population parameters")
print("2. ✅ Central Limit Theorem - sample distribution approaches normal")
print("3. ✅ Statistical validation through KS test and Q-Q plot")
print("4. ✅ Wireless communication relevance - signal modeling and characterization")
print("5. ✅ Quality metrics calculation (SNR, PAPR) for system design")

# %% [markdown]
"""
## 🎯 Assignment Questions

Answer these questions based on your animation results:

### 1. Convergence Analysis
- At what sample size did the histogram start resembling the theoretical PDF?
- How did the Q-Q plot linearity improve with sample size?
- What was the final KS test result and what does it indicate?

### 2. Wireless Communication Applications
- How would this analysis help in characterizing wireless channel noise?
- What is the significance of PAPR in OFDM systems?
- How could you use this approach to validate channel models?

### 3. Statistical Insights
- Explain the relationship between sample size and statistical accuracy
- What role does the confidence interval play in system design?
- How does the Law of Large Numbers apply to signal processing?

---

## 📚 References and Further Reading

1. **Wireless Communications**: Goldsmith, A. "Wireless Communications" Cambridge University Press
2. **Statistical Signal Processing**: Kay, S. "Fundamentals of Statistical Signal Processing"
3. **OFDM Systems**: Hanzo, L. "OFDM and MC-CDMA for Broadband Multi-User Communications"
4. **Python Documentation**: NumPy, SciPy, and Matplotlib official documentation

---

**© 2024 WCOM Lab - LNMIIT | Wireless Communication Laboratory**
"""