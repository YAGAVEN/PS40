export interface ArgoFloat {
  id: string;
  wmo: number;
  lat: number;
  lon: number;
  deploymentDate: string;
  status: 'active' | 'inactive' | 'dead';
  cycleNumber: number;
  platformType: string;
}

export interface ArgoProfile {
  id: string;
  floatId: string;
  cycleNumber: number;
  lat: number;
  lon: number;
  date: string;
  measurements: ArgoMeasurement[];
}

export interface ArgoMeasurement {
  pressure: number;
  depth: number;
  temperature: number;
  salinity: number;
  oxygen?: number;
  chlorophyll?: number;
  ph?: number;
  nitrate?: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  bounds?: GeoBounds;
  parameters: string[];
  floatStatus: string[];
}