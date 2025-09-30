% Assignment 3 - Hata-Okumura and Two-Ray Ground Reflection Models
% Kushagra Garg - 23UCC564

clc; clear; close all;

%% Parameters
fc = 900e6;          % Carrier frequency (Hz)
ht = 50;             % Transmitter antenna height (m)
hr = 1.5;            % Receiver antenna height (m)
d_km = 1:0.1:20;     % Distance in km
d_m = d_km * 1000;   % Distance in meters

%% Hata-Okumura Model (Urban Area)
% Valid for 150–1500 MHz, 1–20 km, ht=30–200m, hr=1–10m
a_hr = (1.1*log10(fc/1e6)-0.7)*hr - (1.56*log10(fc/1e6)-0.8);
PL_hata = 69.55 + 26.16*log10(fc/1e6) - 13.82*log10(ht) - a_hr ...
    + (44.9 - 6.55*log10(ht))*log10(d_km);

%% Two-Ray Ground Reflection Model
Gt = 1; Gr = 1;      % Antenna gains
c = 3e8;             % Speed of light
lambda = c/fc;
Pr_twoRay = (Gt*Gr*(ht*hr).^2) ./ (d_m.^4);   % Received power (linear)
Pr_twoRay_dB = 10*log10(Pr_twoRay);           % in dB

%% Plotting
figure;

% Hata-Okumura Path Loss
subplot(1,2,1);
plot(d_km, PL_hata, 'b-', 'LineWidth', 2);
grid on;
xlabel('Distance (km)');
ylabel('Path Loss (dB)');
title('Hata-Okumura Model (Urban)');
legend('Hata Path Loss');

% Two-Ray Ground Reflection
subplot(1,2,2);
plot(d_km, Pr_twoRay_dB, 'r-', 'LineWidth', 2);
grid on;
xlabel('Distance (km)');
ylabel('Received Power (dB)');
title('Two-Ray Ground Reflection Model');
legend('Two-Ray Received Power');