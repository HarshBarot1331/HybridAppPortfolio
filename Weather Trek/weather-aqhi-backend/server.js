const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv'); 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const CANADIAN_CITIES = [
    { city: 'Toronto', lat: 43.6532, lon: -79.3832, province: 'Ontario' },
    { city: 'Vancouver', lat: 49.2827, lon: -123.1207, province: 'British Columbia' },
    { city: 'Montreal', lat: 45.5017, lon: -73.5673, province: 'Quebec' },
    { city: 'Calgary', lat: 51.0447, lon: -114.0719, province: 'Alberta' },
    { city: 'Ottawa', lat: 45.4215, lon: -75.6972, province: 'Ontario' },
    { city: 'Edmonton', lat: 53.5461, lon: -113.4938, province: 'Alberta' },
    { city: 'Winnipeg', lat: 49.8951, lon: -97.1384, province: 'Manitoba' },
    { city: 'Quebec City', lat: 46.8139, lon: -71.2080, province: 'Quebec' }
];

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to read and serve a specific JSON file
function serveJsonFile(fileName, req, res) {
    const filePath = path.join(__dirname, 'data', fileName);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading ${fileName}:`, err);
            return res.status(500).json({ 
                error: `Failed to read ${fileName}. Check if file exists at ${filePath}` 
            });
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseError) {
            console.error(`Error parsing ${fileName}:`, parseError);
            res.status(500).json({ error: `Failed to parse ${fileName}` });
        }
    });
}

// Helper function to get weather data from JSON file (fallback)
function getWeatherDataFromJson() {
    const filePath = path.join(__dirname, 'data', 'weather-data.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading weather data from JSON:', error);
        return null;
    }
}

// Helper function to fetch weather from OpenWeatherMap API
async function fetchWeatherFromAPI(city) {
    if (!OPENWEATHER_API_KEY) {
        console.log('⚠️  OPENWEATHER_API_KEY not set, using JSON fallback');
        return null;
    }

    try {
        const url = `${OPENWEATHER_BASE_URL}/weather`;
        const response = await axios.get(url, {
            params: {
                lat: city.lat,
                lon: city.lon,
                appid: b9404503c97358c969bd8c8b9008f09d,
                units: 'metric'
            },
            timeout: 10000
        });

        const weatherData = response.data;
        return {
            city: city.city,
            temperature: Math.round(weatherData.main.temp),
            condition: weatherData.weather[0].main,
            humidity: weatherData.main.humidity,
            windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
            icon: weatherData.weather[0].icon,
            latitude: city.lat,
            longitude: city.lon,
            province: city.province
        };
    } catch (error) {
        console.error(`Error fetching weather for ${city.city} from API:`, error.message);
        return null;
    }
}

// Helper function to map OpenWeatherMap condition to readable format
function mapWeatherCondition(condition) {
    const conditionMap = {
        'Clear': 'Clear',
        'Clouds': 'Cloudy',
        'Rain': 'Rainy',
        'Drizzle': 'Rainy',
        'Thunderstorm': 'Stormy',
        'Snow': 'Snowy',
        'Mist': 'Misty',
        'Fog': 'Foggy',
        'Haze': 'Hazy'
    };
    return conditionMap[condition] || condition;
}

// Root endpoint - redirect to /api or show welcome message
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Weather AQHI Backend API',
        version: '1.0.0',
        documentation: 'Visit /api to see all available endpoints',
        endpoints: {
            api: '/api',
            health: '/api/health',
            canadaSummary: '/api/canada-summary',
            ontarioAQHI: '/api/ontario-aqhi',
            ontarioRecords: '/api/ontario-records',
            detailsData: '/api/details-data/:city',
            messages: '/api/messages'
        }
    });
});

// 📁 Endpoint: Canada Summary - Returns weather data for all Canadian cities
// This endpoint calls the Weather API (OpenWeatherMap) and falls back to JSON if API key is not set
app.get('/api/canada-summary', async (req, res) => {
    try {
        // If API key is set, fetch from OpenWeatherMap API
        if (OPENWEATHER_API_KEY) {
            console.log('🌤️  Fetching weather data from OpenWeatherMap API...');
            const weatherPromises = CANADIAN_CITIES.map(city => fetchWeatherFromAPI(city));
            const weatherResults = await Promise.all(weatherPromises);
            
            // Filter out any failed requests
            const validResults = weatherResults.filter(result => result !== null);
            
            if (validResults.length > 0) {
                // Map condition names to readable format
                validResults.forEach(result => {
                    result.condition = mapWeatherCondition(result.condition);
                });
                
                return res.json({
                    cities: validResults,
                    lastUpdated: new Date().toISOString(),
                    dataSource: 'OpenWeatherMap API',
                    version: '2.0'
                });
            }
        }
        
        // Fallback to JSON file if API key is not set or API fails
        console.log('📁 Using JSON fallback for weather data');
        const jsonData = getWeatherDataFromJson();
        if (jsonData) {
            return res.json(jsonData);
        }
        
        // If both fail, return error
        res.status(500).json({ 
            error: 'Failed to fetch weather data',
            message: 'Weather API key not set and JSON fallback unavailable'
        });
    } catch (error) {
        console.error('Error in /api/canada-summary:', error);
        // Try JSON fallback on error
        const jsonData = getWeatherDataFromJson();
        if (jsonData) {
            return res.json(jsonData);
        }
        res.status(500).json({ 
            error: 'Failed to fetch weather data',
            message: error.message 
        });
    }
});

//  Endpoint: Ontario AQHI - Fetches and returns Ontario AQHI data from external API
app.get('/api/ontario-aqhi', async (req, res) => {
    try {
        const aqhiUrl = 'https://www.airqualityontario.com/aqhi/json/aqhi.json';
        const response = await axios.get(aqhiUrl, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Ontario AQHI:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch Ontario AQHI data',
            message: error.message 
        });
    }
});

// Endpoint: Ontario dataset records
app.get('/api/ontario-records', (req, res) => {
    serveJsonFile('ontario-records.json', req, res);
});

// Endpoint: Details page data - Returns data for a specific city
// This endpoint calls the Weather API first, then falls back to JSON
app.get('/api/details-data/:city', async (req, res) => {
    const cityName = req.params.city;
    
    try {
        // Find the city in our CANADIAN_CITIES list
        const city = CANADIAN_CITIES.find(c => 
            c.city.toLowerCase() === cityName.toLowerCase()
        );
        
        if (!city) {
            return res.status(404).json({ error: `City ${cityName} not found` });
        }
        
        // Try to fetch from API first
        if (OPENWEATHER_API_KEY) {
            console.log(`🌤️  Fetching weather data for ${city.city} from OpenWeatherMap API...`);
            const weatherData = await fetchWeatherFromAPI(city);
            
            if (weatherData) {
                weatherData.condition = mapWeatherCondition(weatherData.condition);
                return res.json(weatherData);
            }
        }
        
        // Fallback to JSON file
        console.log(`📁 Using JSON fallback for ${city.city}`);
        const jsonData = getWeatherDataFromJson();
        if (jsonData && jsonData.cities) {
            const cityData = jsonData.cities.find(c => 
                c.city.toLowerCase() === cityName.toLowerCase()
            );
            
            if (cityData) {
                return res.json(cityData);
            }
        }
        
        res.status(404).json({ error: `City ${cityName} not found in data` });
    } catch (error) {
        console.error(`Error fetching details for ${cityName}:`, error);
        // Try JSON fallback on error
        try {
            const jsonData = getWeatherDataFromJson();
            if (jsonData && jsonData.cities) {
                const cityData = jsonData.cities.find(c => 
                    c.city.toLowerCase() === cityName.toLowerCase()
                );
                if (cityData) {
                    return res.json(cityData);
                }
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
        res.status(500).json({ 
            error: 'Failed to fetch city details',
            message: error.message 
        });
    }
});

// 📁 Endpoint: Messages - Handle messages between Details page and Ontario tab
// Store messages in memory (in production, use a database)
let messages = [];

// GET messages
app.get('/api/messages', (req, res) => {
    res.json({ messages: messages });
});

// POST a new message
app.post('/api/messages', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    
    const newMessage = {
        id: Date.now().toString(),
        message,
        timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    res.status(201).json(newMessage);
});

// DELETE a message
app.delete('/api/messages/:id', (req, res) => {
    const id = req.params.id;
    const index = messages.findIndex(m => m.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    messages.splice(index, 1);
    res.json({ success: true });
});

// Root API endpoint - lists available endpoints
app.get('/api', (req, res) => {
    res.json({
        message: 'Weather AQHI Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            canadaSummary: '/api/canada-summary',
            ontarioAQHI: '/api/ontario-aqhi',
            ontarioRecords: '/api/ontario-records',
            detailsData: '/api/details-data/:city',
            messages: '/api/messages (GET, POST, DELETE /api/messages/:id)'
        },
        baseUrl: `${req.protocol}://${req.get('host')}`
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all route for undefined endpoints - provide helpful error message
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: {
            root: '/api',
            health: '/api/health',
            canadaSummary: '/api/canada-summary',
            ontarioAQHI: '/api/ontario-aqhi',
            ontarioRecords: '/api/ontario-records',
            detailsData: '/api/details-data/:city',
            messages: '/api/messages'
        },
        tip: 'Visit /api to see all available endpoints'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Express server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    if (OPENWEATHER_API_KEY) {
        console.log(`✅ OpenWeatherMap API key configured`);
    } else {
        console.log(`OpenWeatherMap API key not set - using JSON fallback`);
        console.log(`   Set OPENWEATHER_API_KEY environment variable to use Weather API`);
    }
});

module.exports = app;