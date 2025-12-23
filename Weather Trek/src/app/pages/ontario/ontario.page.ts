import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { WeatherService, WeatherData } from '../../services/weather';

@Component({
  selector: 'app-ontario',
  templateUrl: './ontario.page.html',
  styleUrls: ['./ontario.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OntarioPage implements OnInit {
  weatherData: WeatherData[] = [];
  ontarioCities: WeatherData[] = [];
  isLoading = true;
  errorMessage = '';
  
  ontarioCityNames = ['Toronto', 'Ottawa'];
  
  averageTemp = 0;
  highestTemp = 0;
  lowestTemp = 0;

  constructor(
    private weatherService: WeatherService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOntarioWeather();
  }

  loadOntarioWeather() {
    this.isLoading = true;
    this.weatherService.getCanadaWeather().subscribe({
      next: (data) => {
        this.weatherData = data;
        this.ontarioCities = data.filter(w => 
          this.ontarioCityNames.includes(w.city)
        );
        this.calculateStatistics();
        this.isLoading = false;
        console.log('Ontario Weather Data:', this.ontarioCities);
      },
      error: (err) => {
        this.errorMessage = 'Error fetching weather data. Please try again.';
        this.isLoading = false;
        console.error('Error fetching weather data:', err);
      }
    });
  }

  calculateStatistics() {
    if (this.ontarioCities.length === 0) return;

    const temps = this.ontarioCities.map(w => w.temperature);
    this.averageTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
    this.highestTemp = Math.max(...temps);
    this.lowestTemp = Math.min(...temps);
  }

  viewDetails(city: string) {
    this.router.navigate(['/details', city]);
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

  refresh(event?: any) {
    this.loadOntarioWeather();
    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    }
  }

  getProvinceInfo(): string {
    return 'Ontario is Canada\'s most populous province, home to the nation\'s capital Ottawa and its largest city Toronto.';
  }
}