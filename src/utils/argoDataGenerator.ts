import { ArgoFloat, ArgoProfile, ArgoMeasurement } from '../types/argo';

export class ArgoDataGenerator {
  private static readonly INDIAN_OCEAN_BOUNDS = {
    north: 30,
    south: -60,
    east: 120,
    west: 20
  };

  private static readonly PLATFORM_TYPES = [
    'APEX', 'PROVOR', 'SOLO', 'NEMO', 'NAVIS_A', 'ARVOR'
  ];

  static generateFloats(count: number = 50): ArgoFloat[] {
    const floats: ArgoFloat[] = [];
    
    for (let i = 0; i < count; i++) {
      const wmo = 2900000 + Math.floor(Math.random() * 100000);
      const lat = this.randomInRange(
        this.INDIAN_OCEAN_BOUNDS.south, 
        this.INDIAN_OCEAN_BOUNDS.north
      );
      const lon = this.randomInRange(
        this.INDIAN_OCEAN_BOUNDS.west, 
        this.INDIAN_OCEAN_BOUNDS.east
      );
      
      const deploymentDate = this.randomDate(
        new Date('2020-01-01'), 
        new Date('2024-01-01')
      );
      
      const status = this.randomChoice(['active', 'active', 'inactive', 'dead']);
      const cycleNumber = Math.floor(Math.random() * 200) + 1;
      const platformType = this.randomChoice(this.PLATFORM_TYPES);

      floats.push({
        id: `float-${i}`,
        wmo,
        lat,
        lon,
        deploymentDate: deploymentDate.toISOString().split('T')[0],
        status: status as 'active' | 'inactive' | 'dead',
        cycleNumber,
        platformType
      });
    }

    return floats;
  }

  static generateProfiles(floats: ArgoFloat[], profilesPerFloat: number = 10): ArgoProfile[] {
    const profiles: ArgoProfile[] = [];
    
    floats.forEach(float => {
      for (let i = 0; i < profilesPerFloat; i++) {
        // Simulate drift over time
        const driftLat = float.lat + (Math.random() - 0.5) * 5;
        const driftLon = float.lon + (Math.random() - 0.5) * 8;
        
        const baseDate = new Date(float.deploymentDate);
        const profileDate = new Date(baseDate.getTime() + i * 10 * 24 * 60 * 60 * 1000);
        
        const measurements = this.generateMeasurements();
        
        profiles.push({
          id: `profile-${float.id}-${i}`,
          floatId: float.id,
          cycleNumber: i + 1,
          lat: driftLat,
          lon: driftLon,
          date: profileDate.toISOString().split('T')[0],
          measurements
        });
      }
    });

    return profiles;
  }

  private static generateMeasurements(): ArgoMeasurement[] {
    const measurements: ArgoMeasurement[] = [];
    const maxDepth = 2000; // meters
    const numPoints = 50;
    
    for (let i = 0; i < numPoints; i++) {
      const pressure = (i / (numPoints - 1)) * maxDepth * 1.025; // Approximate conversion
      const depth = pressure / 1.025;
      
      // Realistic temperature profile (decreases with depth)
      const temperature = 25 - (depth / 100) * 1.8 + (Math.random() - 0.5) * 0.5;
      
      // Realistic salinity profile (increases slightly with depth)
      const salinity = 34.5 + (depth / 1000) * 0.3 + (Math.random() - 0.5) * 0.2;
      
      // Optional BGC parameters
      const oxygen = depth < 1000 ? 
        200 - (depth / 10) + (Math.random() - 0.5) * 10 : 
        undefined;
      
      const chlorophyll = depth < 200 ? 
        Math.max(0, 0.5 - (depth / 100) * 0.3 + (Math.random() - 0.5) * 0.2) : 
        undefined;
      
      measurements.push({
        pressure,
        depth,
        temperature: Math.round(temperature * 100) / 100,
        salinity: Math.round(salinity * 100) / 100,
        oxygen: oxygen ? Math.round(oxygen * 10) / 10 : undefined,
        chlorophyll: chlorophyll ? Math.round(chlorophyll * 1000) / 1000 : undefined
      });
    }

    return measurements;
  }

  private static randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
}