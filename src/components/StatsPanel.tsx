import React from 'react';
import { Activity, Thermometer, Droplets, Wind } from 'lucide-react';
import { ArgoFloat, ArgoProfile } from '../types/argo';

interface StatsPanelProps {
  floats: ArgoFloat[];
  profiles: ArgoProfile[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ floats, profiles }) => {
  const activeFloats = floats.filter(f => f.status === 'active').length;
  const recentProfiles = profiles.filter(p => {
    const profileDate = new Date(p.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return profileDate >= thirtyDaysAgo;
  }).length;

  // Calculate averages
  const allTemperatures = profiles.flatMap(p => p.measurements.map(m => m.temperature));
  const avgTemperature = allTemperatures.reduce((a, b) => a + b, 0) / allTemperatures.length;

  const allSalinities = profiles.flatMap(p => p.measurements.map(m => m.salinity));
  const avgSalinity = allSalinities.reduce((a, b) => a + b, 0) / allSalinities.length;

  const oxygenMeasurements = profiles.flatMap(p => 
    p.measurements.filter(m => m.oxygen !== undefined).map(m => m.oxygen!)
  );
  const avgOxygen = oxygenMeasurements.length > 0 
    ? oxygenMeasurements.reduce((a, b) => a + b, 0) / oxygenMeasurements.length 
    : 0;

  const stats = [
    {
      icon: Activity,
      label: 'Active Floats',
      value: activeFloats,
      total: floats.length,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Thermometer,
      label: 'Avg Temperature',
      value: `${avgTemperature.toFixed(1)}°C`,
      description: 'All measurements',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Droplets,
      label: 'Avg Salinity',
      value: `${avgSalinity.toFixed(2)}`,
      description: 'PSU',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Wind,
      label: 'Avg Oxygen',
      value: avgOxygen > 0 ? `${avgOxygen.toFixed(1)}` : 'N/A',
      description: 'μmol/kg',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            {stat.total && (
              <span className="text-sm text-gray-500">
                /{stat.total}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-gray-900">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600">
              {stat.label}
            </p>
            {stat.description && (
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            )}
          </div>
        </div>
      ))}
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2 lg:col-span-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity (Last 30 Days)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{recentProfiles}</p>
            <p className="text-sm text-gray-600">New Profiles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {profiles.reduce((sum, p) => sum + p.measurements.length, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Measurements</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(profiles.reduce((sum, p) => sum + Math.max(...p.measurements.map(m => m.depth)), 0) / profiles.length)}m
            </p>
            <p className="text-sm text-gray-600">Avg Max Depth</p>
          </div>
        </div>
      </div>
    </div>
  );
};