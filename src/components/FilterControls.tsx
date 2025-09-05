import React from 'react';
import { Calendar, MapPin, Filter } from 'lucide-react';
import { FilterOptions } from '../types/argo';

interface FilterControlsProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFiltersChange }) => {
  const handleDateChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleParameterToggle = (parameter: string) => {
    const newParameters = filters.parameters.includes(parameter)
      ? filters.parameters.filter(p => p !== parameter)
      : [...filters.parameters, parameter];
    
    onFiltersChange({
      ...filters,
      parameters: newParameters
    });
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.floatStatus.includes(status)
      ? filters.floatStatus.filter(s => s !== status)
      : [...filters.floatStatus, status];
    
    onFiltersChange({
      ...filters,
      floatStatus: newStatus
    });
  };

  const parameters = [
    { id: 'temperature', label: 'Temperature', color: 'red' },
    { id: 'salinity', label: 'Salinity', color: 'blue' },
    { id: 'oxygen', label: 'Oxygen', color: 'teal' },
    { id: 'chlorophyll', label: 'Chlorophyll', color: 'green' }
  ];

  const statuses = [
    { id: 'active', label: 'Active', color: 'green' },
    { id: 'inactive', label: 'Inactive', color: 'yellow' },
    { id: 'dead', label: 'Dead', color: 'red' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Data Filters
        </h3>
      </div>

      <div className="space-y-6">
        {/* Date Range */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Calendar className="w-4 h-4" />
            Date Range
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <MapPin className="w-4 h-4" />
            Parameters
          </label>
          <div className="grid grid-cols-2 gap-2">
            {parameters.map(param => (
              <label key={param.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.parameters.includes(param.id)}
                  onChange={() => handleParameterToggle(param.id)}
                  className={`rounded border-gray-300 text-${param.color}-600 shadow-sm focus:border-${param.color}-500 focus:ring-${param.color}-500`}
                />
                <span className="text-sm text-gray-700">{param.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Float Status */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Float Status
          </label>
          <div className="space-y-2">
            {statuses.map(status => (
              <label key={status.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.floatStatus.includes(status.id)}
                  onChange={() => handleStatusToggle(status.id)}
                  className={`rounded border-gray-300 text-${status.color}-600 shadow-sm focus:border-${status.color}-500 focus:ring-${status.color}-500`}
                />
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${status.color}-500`}></div>
                  <span className="text-sm text-gray-700">{status.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() => onFiltersChange({
            dateRange: { start: '2020-01-01', end: '2024-12-31' },
            parameters: ['temperature', 'salinity'],
            floatStatus: ['active', 'inactive']
          })}
          className="w-full bg-gray-100 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-200 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};