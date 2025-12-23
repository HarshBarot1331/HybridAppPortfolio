import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { WeatherService, WeatherData } from '../../services/weather';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DetailsPage implements OnInit {
  city: string = '';
  weatherData: WeatherData | null = null;
  isLoading = true;
  errorMessage = '';
  
  // Extended weather details
  forecast = [
    { day: 'Monday', temp: 15, condition: 'Sunny', icon: '01d' },
    { day: 'Tuesday', temp: 17, condition: 'Partly Cloudy', icon: '02d' },
    { day: 'Wednesday', temp: 14, condition: 'Rainy', icon: '10d' },
    { day: 'Thursday', temp: 12, condition: 'Cloudy', icon: '03d' },
    { day: 'Friday', temp: 16, condition: 'Sunny', icon: '01d' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    this.city = this.route.snapshot.paramMap.get('city') || '';
    this.loadWeatherDetails();
  }

  loadWeatherDetails() {
    this.isLoading = true;
    this.weatherService.getCityDetails(this.city).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error loading weather data';
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/canada-summary']);
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

  getFeelsLike(): number {
    if (!this.weatherData) return 0;
    const temp = this.weatherData.temperature;
    const wind = this.weatherData.windSpeed;
    return Math.round(temp - (wind * 0.1));
  }

  getUVIndex(): string {
    if (!this.weatherData) return 'Low';
    if (this.weatherData.temperature > 20) return 'High';
    if (this.weatherData.temperature > 10) return 'Moderate';
    return 'Low';
  }

  getVisibility(): string {
    return '10 km';
  }

  getPressure(): string {
    return '1013 hPa';
  }
}