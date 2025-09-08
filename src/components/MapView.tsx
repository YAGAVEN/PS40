import React, { useEffect, useRef } from 'react';
import { ArgoFloat, ArgoProfile } from '../types/argo';

interface MapViewProps {
  floats: ArgoFloat[];
  profiles: ArgoProfile[];
  selectedFloat?: string;
  onFloatSelect: (floatId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ 
  floats, 
  profiles, 
  selectedFloat, 
  onFloatSelect 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawMap();
  }, [floats, profiles, selectedFloat]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw ocean background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(1, '#0f4c75');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      const y = (i / 10) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Convert lat/lon to canvas coordinates
    const latToY = (lat: number) => height - ((lat + 60) / 90) * height;
    const lonToX = (lon: number) => ((lon - 20) / 100) * width;

    // Draw float trajectories
    floats.forEach(float => {
      const floatProfiles = profiles.filter(p => p.floatId === float.id);
      if (floatProfiles.length < 2) return;

      // Sort profiles by date
      floatProfiles.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Draw trajectory line
      ctx.strokeStyle = selectedFloat === float.id ? '#fbbf24' : 'rgba(187, 225, 250, 0.6)';
      ctx.lineWidth = selectedFloat === float.id ? 3 : 2;
      ctx.beginPath();
      floatProfiles.forEach((profile, index) => {
        const x = lonToX(profile.lon);
        const y = latToY(profile.lat);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw profile points
      floatProfiles.forEach((profile, index) => {
        const x = lonToX(profile.lon);
        const y = latToY(profile.lat);
        
        ctx.fillStyle = selectedFloat === float.id ? '#f59e0b' : 
          float.status === 'active' ? '#10b981' : 
          float.status === 'inactive' ? '#f59e0b' : '#ef4444';
        
        const radius = selectedFloat === float.id ? 6 : 4;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Add ring for current position
        if (index === floatProfiles.length - 1) {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
    });

    // Add legend
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 200, 100);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, Segoe UI';
    ctx.fillText('ARGO Float Status', 20, 30);
    
    // Status indicators
    const statusColors = [
      { color: '#10b981', label: 'Active' },
      { color: '#f59e0b', label: 'Inactive' },
      { color: '#ef4444', label: 'Dead' }
    ];
    
    statusColors.forEach((status, index) => {
      const y = 50 + index * 20;
      ctx.fillStyle = status.color;
      ctx.beginPath();
      ctx.arc(25, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(status.label, 40, y + 5);
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert click coordinates to lat/lon
    const { width, height } = canvas;
    const clickLon = 20 + (x / width) * 100;
    const clickLat = -60 + ((height - y) / height) * 90;

    // Find nearest float
    let nearestFloat: ArgoFloat | null = null;
    let minDistance = Infinity;

    floats.forEach(float => {
      const latestProfile = profiles
        .filter(p => p.floatId === float.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (latestProfile) {
        const distance = Math.sqrt(
          Math.pow(latestProfile.lat - clickLat, 2) + 
          Math.pow(latestProfile.lon - clickLon, 2)
        );
        
        if (distance < minDistance && distance < 5) { // Within 5 degrees
          minDistance = distance;
          nearestFloat = float;
        }
      }
    });

    if (nearestFloat) {
      onFloatSelect(nearestFloat.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Indian Ocean Float Positions
        </h2>
        <p className="text-sm text-gray-600">
          Click on floats to view detailed profiles
        </p>
      </div>
      <div className="relative">
        <iframe
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src="https://www.openstreetmap.org/export/embed.html?bbox=-180,-85,180,85&layer=mapnik"
          title="OpenStreetMap World"
        />
        {selectedFloat && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg">
            <p className="text-sm">
              Selected: Float {selectedFloat}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};