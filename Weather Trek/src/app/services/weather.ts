import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { Toast } from '@capacitor/toast';
import { Device } from '@capacitor/device';
import { environment } from '../../environments/environment';

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  latitude?: number;
  longitude?: number;
  province?: string;
}

export interface DeviceInfo {
  platform: string;
  model: string;
  osVersion: string;
}

interface WeatherResponse {
  cities: WeatherData[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCanadaWeather(): Observable<WeatherData[]> {
    return this.http.get<WeatherResponse>(`${this.apiUrl}/canada-summary`).pipe(
      map(response => {
        console.log('✅ Weather data loaded from backend:', response);
        return response.cities;
      }),
      catchError((error) => {
        console.error('❌ Error fetching weather data from backend:', error);
        console.log('📦 Using fallback data');
        return of(this.getFallbackData());
      })
    );
  }

  // Get details for a specific city from the backend
  getCityDetails(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/details-data/${encodeURIComponent(city)}`).pipe(
      catchError((error) => {
        console.error(`❌ Error fetching details for ${city} from backend:`, error);
        // Fallback: get all cities and find the requested one
        return this.getCanadaWeather().pipe(
          map(cities => {
            const cityData = cities.find(c => c.city.toLowerCase() === city.toLowerCase());
            if (!cityData) {
              throw new Error(`City ${city} not found`);
            }
            return cityData;
          })
        );
      })
    );
  }

  private getFallbackData(): WeatherData[] {
    return [
      { city: 'Toronto', temperature: 15, condition: 'Partly Cloudy', humidity: 65, windSpeed: 12, icon: '02d', latitude: 43.6532, longitude: -79.3832, province: 'Ontario' },
      { city: 'Vancouver', temperature: 18, condition: 'Rainy', humidity: 80, windSpeed: 15, icon: '10d', latitude: 49.2827, longitude: -123.1207, province: 'British Columbia' },
      { city: 'Montreal', temperature: 12, condition: 'Clear', humidity: 55, windSpeed: 8, icon: '01d', latitude: 45.5017, longitude: -73.5673, province: 'Quebec' },
      { city: 'Calgary', temperature: 10, condition: 'Cloudy', humidity: 60, windSpeed: 20, icon: '03d', latitude: 51.0447, longitude: -114.0719, province: 'Alberta' },
      { city: 'Ottawa', temperature: 14, condition: 'Sunny', humidity: 50, windSpeed: 10, icon: '01d', latitude: 45.4215, longitude: -75.6972, province: 'Ontario' },
      { city: 'Edmonton', temperature: 8, condition: 'Snowy', humidity: 70, windSpeed: 18, icon: '13d', latitude: 53.5461, longitude: -113.4938, province: 'Alberta' },
      { city: 'Winnipeg', temperature: 5, condition: 'Cloudy', humidity: 75, windSpeed: 22, icon: '04d', latitude: 49.8951, longitude: -97.1384, province: 'Manitoba' },
      { city: 'Quebec City', temperature: 11, condition: 'Clear', humidity: 58, windSpeed: 9, icon: '01d', latitude: 46.8139, longitude: -71.2080, province: 'Quebec' }
    ];
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { latitude: coordinates.coords.latitude, longitude: coordinates.coords.longitude };
    } catch (error) {
      console.error('Error getting location:', error);
      await this.showToast('Unable to get your location');
      return null;
    }
  }

  async checkLocationPermissions(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location === 'granted') return true;
      if (permission.location === 'prompt') {
        const requested = await Geolocation.requestPermissions();
        return requested.location === 'granted';
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async getNearestCity(lat: number, lon: number): Promise<WeatherData | null> {
    const cities = await this.getCanadaWeather().toPromise();
    if (!cities) return null;

    let nearest: WeatherData | null = null;
    let minDist = Infinity;

    for (const city of cities) {
      if (city.latitude && city.longitude) {
        const dist = this.calculateDistance(lat, lon, city.latitude, city.longitude);
        if (dist < minDist) {
          minDist = dist;
          nearest = city;
        }
      }
    }
    return nearest;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  async showToast(message: string) {
    try {
      await Toast.show({ text: message, duration: 'short', position: 'bottom' });
    } catch (error) {
      console.log(message);
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      const info = await Device.getInfo();
      return { platform: info.platform, model: info.model, osVersion: info.osVersion };
    } catch (error) {
      return { platform: 'web', model: 'Browser', osVersion: 'N/A' };
    }
  }

  async getLocalWeather(): Promise<WeatherData | null> {
    const hasPermission = await this.checkLocationPermissions();
    if (!hasPermission) return null;

    const location = await this.getCurrentLocation();
    if (!location) return null;

    await this.showToast('Getting weather for your location...');
    const nearest = await this.getNearestCity(location.latitude, location.longitude);
    
    if (nearest) {
      await this.showToast(`Showing weather for ${nearest.city}`);
    }
    return nearest;
  }
}