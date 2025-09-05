import React, { useEffect, useRef } from 'react';
import { ArgoProfile, ArgoMeasurement } from '../types/argo';

interface ProfileChartProps {
  profile: ArgoProfile | null;
  parameter: 'temperature' | 'salinity' | 'oxygen' | 'chlorophyll';
}

export const ProfileChart: React.FC<ProfileChartProps> = ({ profile, parameter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawProfile();
  }, [profile, parameter]);

  const drawProfile = () => {
    const canvas = canvasRef.current;
    if (!canvas || !profile) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#f8fafc');
    bgGradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const measurements = profile.measurements.filter(m => 
      parameter === 'temperature' || parameter === 'salinity' ||
      (parameter === 'oxygen' && m.oxygen !== undefined) ||
      (parameter === 'chlorophyll' && m.chlorophyll !== undefined)
    );

    if (measurements.length === 0) return;

    // Get parameter values
    const values = measurements.map(m => {
      switch (parameter) {
        case 'temperature': return m.temperature;
        case 'salinity': return m.salinity;
        case 'oxygen': return m.oxygen || 0;
        case 'chlorophyll': return m.chlorophyll || 0;
      }
    });

    const depths = measurements.map(m => m.depth);
    
    // Chart dimensions
    const margin = { top: 40, right: 60, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scales
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;
    
    const maxDepth = Math.max(...depths);
    
    const xScale = (value: number) => margin.left + ((value - minValue) / valueRange) * chartWidth;
    const yScale = (depth: number) => margin.top + (depth / maxDepth) * chartHeight;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid (depth)
    for (let i = 0; i <= 10; i++) {
      const depth = (i / 10) * maxDepth;
      const y = yScale(depth);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
    }

    // Vertical grid (parameter values)
    for (let i = 0; i <= 10; i++) {
      const value = minValue + (i / 10) * valueRange;
      const x = xScale(value);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, height - margin.bottom);
      ctx.stroke();
    }

    // Draw profile line
    ctx.strokeStyle = getParameterColor(parameter);
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    measurements.forEach((measurement, index) => {
      const value = values[index];
      const x = xScale(value);
      const y = yScale(measurement.depth);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = getParameterColor(parameter);
    measurements.forEach((measurement, index) => {
      const value = values[index];
      const x = xScale(value);
      const y = yScale(measurement.depth);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // Y-axis (depth)
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();
    
    // X-axis (parameter)
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, Segoe UI';
    ctx.textAlign = 'center';
    
    // X-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (i / 5) * valueRange;
      const x = xScale(value);
      ctx.fillText(value.toFixed(1), x, height - margin.bottom + 20);
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const depth = (i / 5) * maxDepth;
      const y = yScale(depth);
      ctx.fillText(Math.round(depth).toString() + 'm', margin.left - 10, y + 4);
    }

    // Title and axis labels
    ctx.textAlign = 'center';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, Segoe UI';
    ctx.fillText(getParameterLabel(parameter), width / 2, height - 10);
    
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Depth (m)', 0, 0);
    ctx.restore();
    
    ctx.font = '16px -apple-system, BlinkMacSystemFont, Segoe UI';
    ctx.fillText(`${getParameterLabel(parameter)} Profile`, width / 2, 25);
  };

  const getParameterColor = (param: string): string => {
    const colors = {
      temperature: '#ef4444',
      salinity: '#3b82f6',
      oxygen: '#10b981',
      chlorophyll: '#22c55e'
    };
    return colors[param as keyof typeof colors] || '#6b7280';
  };

  const getParameterLabel = (param: string): string => {
    const labels = {
      temperature: 'Temperature (°C)',
      salinity: 'Salinity (PSU)',
      oxygen: 'Dissolved Oxygen (μmol/kg)',
      chlorophyll: 'Chlorophyll (mg/m³)'
    };
    return labels[param as keyof typeof labels] || param;
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Select a float on the map to view profiles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Profile Analysis
        </h3>
        <p className="text-sm text-gray-600">
          {profile.date} • Lat: {profile.lat.toFixed(2)}° • Lon: {profile.lon.toFixed(2)}°
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-auto"
      />
    </div>
  );
};