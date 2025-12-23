import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WeatherService, WeatherData, DeviceInfo } from '../../services/weather';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-canada-summary',
  templateUrl: './canada-summary.page.html',
  styleUrls: ['./canada-summary.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CanadaSummaryPage implements OnInit {
  weatherData: WeatherData[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Statistics
  averageTemp = 0;
  highestTemp = 0;
  lowestTemp = 0;
  hottestCity = '';
  coldestCity = '';

  // Native features
  deviceInfo: DeviceInfo | null = null;
  userLocation: { latitude: number; longitude: number } | null = null;
  nearestCity: WeatherData | null = null;

  constructor(
    private weatherService: WeatherService,
    public router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.loadDeviceInfo();
    this.loadWeatherData();
  }

  loadWeatherData() {
    this.isLoading = true;
    this.weatherService.getCanadaWeather().subscribe({
      next: (data) => {
        this.weatherData = data;
        this.calculateStatistics();
        this.isLoading = false;
        console.log('Weather Data:', data);
      },
      error: (err) => {
        this.errorMessage = 'Error fetching weather data. Please try again.';
        this.isLoading = false;
        console.error('Error fetching weather data:', err);
      }
    });
  }

  calculateStatistics() {
    if (this.weatherData.length === 0) return;

    const temps = this.weatherData.map(w => w.temperature);
    this.averageTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
    this.highestTemp = Math.max(...temps);
    this.lowestTemp = Math.min(...temps);

    const hottest = this.weatherData.find(w => w.temperature === this.highestTemp);
    const coldest = this.weatherData.find(w => w.temperature === this.lowestTemp);

    this.hottestCity = hottest?.city || '';
    this.coldestCity = coldest?.city || '';
  }

  viewDetails(city: string) {
    this.router.navigate(['/details', city]);
  }

  getWeatherIcon(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  getTemperatureColor(temp: number): string {
    if (temp >= 25) return 'danger';
    if (temp >= 15) return 'warning';
    if (temp >= 5) return 'success';
    return 'primary';
  }

  refresh(event?: any) {
    this.loadWeatherData();
    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    }
  }

  goToOntario() {
    this.router.navigate(['/ontario']);
  }

  // NATIVE FEATURE: Get Device Info
  async loadDeviceInfo() {
    this.deviceInfo = await this.weatherService.getDeviceInfo();
    console.log('Device Info:', this.deviceInfo);
  }

  // NATIVE FEATURE: Show Device Info Dialog
  async showDeviceInfo() {
    if (!this.deviceInfo) {
      await this.loadDeviceInfo();
    }

    const alert = await this.alertController.create({
      header: 'Device Information',
      message: `
        <strong>Platform:</strong> ${this.deviceInfo?.platform}<br>
        <strong>Model:</strong> ${this.deviceInfo?.model}<br>
        <strong>OS Version:</strong> ${this.deviceInfo?.osVersion}
      `,
      buttons: ['OK']
    });

    await alert.present();
  }

  // NATIVE FEATURE: Get Location and Show Nearest City
  async getMyLocationWeather() {
    // Show toast notification
    await this.weatherService.showToast('Getting your location...');

    try {
      this.nearestCity = await this.weatherService.getLocalWeather();

      if (this.nearestCity) {
        // Navigate to details page of nearest city
        this.router.navigate(['/details', this.nearestCity.city]);
      } else {
        await this.weatherService.showToast('Could not find nearest city');
      }
    } catch (error) {
      await this.weatherService.showToast('Error getting location');
    }
  }

  // NATIVE FEATURE: Action Sheet
  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Weather Options',
      buttons: [
        {
          text: '📍 My Location Weather',
          icon: 'location',
          handler: () => {
            this.getMyLocationWeather();
          }
        },
        {
          text: '📱 Device Info',
          icon: 'phone-portrait',
          handler: () => {
            this.showDeviceInfo();
          }
        },
        {
          text: '🗺️ View Ontario',
          icon: 'map',
          handler: () => {
            this.goToOntario();
          }
        },
        {
          text: '🔄 Refresh',
          icon: 'refresh',
          handler: () => {
            this.refresh();
            this.weatherService.showToast('Weather data refreshed');
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }
}