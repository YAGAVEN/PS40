import React, { useState, useEffect } from 'react';
import { Waves, Database, BarChart3, MessageCircle } from 'lucide-react';
import { ArgoDataGenerator } from './utils/argoDataGenerator';
import { MapView } from './components/MapView';
import { ProfileChart } from './components/ProfileChart';
import { ChatInterface } from './components/ChatInterface';
import { StatsPanel } from './components/StatsPanel';
import { FilterControls } from './components/FilterControls';
import { ArgoFloat, ArgoProfile, FilterOptions } from './types/argo';

function App() {
  const [floats, setFloats] = useState<ArgoFloat[]>([]);
  const [profiles, setProfiles] = useState<ArgoProfile[]>([]);
  const [selectedFloat, setSelectedFloat] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<ArgoProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'chat'>('overview');
  const [selectedParameter, setSelectedParameter] = useState<'temperature' | 'salinity' | 'oxygen' | 'chlorophyll'>('temperature');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '2020-01-01', end: '2024-12-31' },
    parameters: ['temperature', 'salinity'],
    floatStatus: ['active', 'inactive']
  });

  useEffect(() => {
    // Generate simulated ARGO data
    const generatedFloats = ArgoDataGenerator.generateFloats(30);
    const generatedProfiles = ArgoDataGenerator.generateProfiles(generatedFloats, 8);
    
    setFloats(generatedFloats);
    setProfiles(generatedProfiles);
  }, []);

  useEffect(() => {
    if (selectedFloat) {
      const floatProfiles = profiles.filter(p => p.floatId === selectedFloat);
      const latestProfile = floatProfiles.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      setSelectedProfile(latestProfile || null);
    } else {
      setSelectedProfile(null);
    }
  }, [selectedFloat, profiles]);

  // Apply filters
  const filteredFloats = floats.filter(float => {
    if (!filters.floatStatus.includes(float.status)) return false;
    return true;
  });

  const filteredProfiles = profiles.filter(profile => {
    const profileDate = new Date(profile.date);
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    if (profileDate < startDate || profileDate > endDate) return false;
    if (!filteredFloats.some(f => f.id === profile.floatId)) return false;
    
    return true;
  });

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Database },
    { id: 'analysis' as const, label: 'Analysis', icon: BarChart3 },
    { id: 'chat' as const, label: 'AI Assistant', icon: MessageCircle }
  ];

  const parameters = [
    { id: 'temperature' as const, label: 'Temperature', color: 'red' },
    { id: 'salinity' as const, label: 'Salinity', color: 'blue' },
    { id: 'oxygen' as const, label: 'Oxygen', color: 'teal' },
    { id: 'chlorophyll' as const, label: 'Chlorophyll', color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  ARGO Ocean Data Platform
                </h1>
                <p className="text-sm text-gray-600">
                  Advanced Oceanographic Analysis & Visualization
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredFloats.length}</span> floats • 
                <span className="font-medium ml-1">{filteredProfiles.length}</span> profiles
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsPanel floats={filteredFloats} profiles={filteredProfiles} />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <MapView
                  floats={filteredFloats}
                  profiles={filteredProfiles}
                  selectedFloat={selectedFloat}
                  onFloatSelect={setSelectedFloat}
                />
              </div>
              <div>
                <FilterControls
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Parameter Selection */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Parameter for Analysis
              </h3>
              <div className="flex flex-wrap gap-2">
                {parameters.map(param => (
                  <button
                    key={param.id}
                    onClick={() => setSelectedParameter(param.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedParameter === param.id
                        ? `bg-${param.color}-600 text-white`
                        : `bg-${param.color}-100 text-${param.color}-700 hover:bg-${param.color}-200`
                    }`}
                  >
                    {param.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MapView
                floats={filteredFloats}
                profiles={filteredProfiles}
                selectedFloat={selectedFloat}
                onFloatSelect={setSelectedFloat}
              />
              <ProfileChart
                profile={selectedProfile}
                parameter={selectedParameter}
              />
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatInterface floats={filteredFloats} profiles={filteredProfiles} />
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Query Suggestions
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Temperature Analysis</p>
                    <p className="text-blue-700">"What's the average temperature at 1000m depth?"</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Float Status</p>
                    <p className="text-green-700">"How many floats are currently active?"</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">BGC Data</p>
                    <p className="text-purple-700">"Show me oxygen measurements from recent profiles"</p>
                  </div>
                </div>
              </div>
              
              <StatsPanel floats={filteredFloats} profiles={filteredProfiles} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;