# Weather AQHI Backend

Express.js backend server for the Weather AQHI application. This backend handles all data fetching from external APIs and serves data to the Ionic Angular frontend.

## Features

- ✅ Calls OpenWeatherMap API for weather data (with JSON fallback)
- ✅ Fetches Ontario AQHI data from Air Quality Ontario API
- ✅ Serves JSON datasets (Ontario records, weather data)
- ✅ Handles messages between frontend components
- ✅ RESTful API endpoints

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The backend uses environment variables for configuration. Create a `.env` file in the `weather-aqhi-backend` directory:

```env
PORT=3000
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

**Getting an OpenWeatherMap API Key:**
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key from the dashboard
3. Add it to the `.env` file

**Note:** If no API key is set, the backend will use JSON fallback data from `data/weather-data.json`.

### 3. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Canada Summary
- **GET** `/api/canada-summary`
- Returns weather data for all Canadian cities
- Calls OpenWeatherMap API if API key is set, otherwise uses JSON fallback

### Ontario AQHI
- **GET** `/api/ontario-aqhi`
- Fetches Ontario AQHI data from Air Quality Ontario API

### Ontario Records
- **GET** `/api/ontario-records`
- Returns Ontario dataset records from JSON file

### City Details
- **GET** `/api/details-data/:city`
- Returns weather data for a specific city
- Example: `/api/details-data/Toronto`

### Messages
- **GET** `/api/messages` - Get all messages
- **POST** `/api/messages` - Create a new message
  ```json
  {
    "message": "Your message here"
  }
  ```
- **DELETE** `/api/messages/:id` - Delete a message

## Architecture

```
Frontend (Ionic Angular)
    ↓ HTTP Requests
Backend (Express.js)
    ↓ API Calls
External APIs (OpenWeatherMap, Air Quality Ontario)
    ↓ Data
Backend Processing
    ↓ JSON Response
Frontend (Ionic Angular)
```

## Data Flow

1. **Weather Data:**
   - Frontend calls `/api/canada-summary`
   - Backend calls OpenWeatherMap API (if API key is set)
   - Backend falls back to JSON file if API key is not set or API fails
   - Backend returns formatted data to frontend

2. **AQHI Data:**
   - Frontend calls `/api/ontario-aqhi`
   - Backend calls Air Quality Ontario API
   - Backend returns data to frontend

3. **Ontario Records:**
   - Frontend calls `/api/ontario-records`
   - Backend reads JSON file
   - Backend returns data to frontend

## Testing

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Canada summary
curl http://localhost:3000/api/canada-summary

# City details
curl http://localhost:3000/api/details-data/Toronto

# Ontario AQHI
curl http://localhost:3000/api/ontario-aqhi

# Ontario records
curl http://localhost:3000/api/ontario-records

# Messages
curl http://localhost:3000/api/messages
curl -X POST http://localhost:3000/api/messages -H "Content-Type: application/json" -d '{"message":"Test"}'
```

### Using the Test Script

```bash
./test-backend.sh
```

## File Structure

```
weather-aqhi-backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── data/                  # JSON data files
│   ├── weather-data.json  # Fallback weather data
│   └── ontario-records.json  # Ontario records
└── README.md              # This file
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `3000` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | No | (uses JSON fallback) |

## Error Handling

The backend includes comprehensive error handling:
- API failures fall back to JSON data
- Invalid requests return appropriate error messages
- All errors are logged to the console

## Production Deployment

For production deployment:
1. Set environment variables in your hosting platform
2. Update CORS settings if needed
3. Consider using a database for message storage instead of in-memory storage
4. Add rate limiting for API endpoints
5. Add authentication if needed

## License

ISC

