import express from 'express';
import { v4 as uuidv4 } from 'uuid';

interface Route {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_color: string;
}

interface Stop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
}

interface Location {
  lat: number;
  lon: number;
}

interface RouteRecommendation {
  route: Route;
  startStop: Stop;
  endStop: Stop;
  estimatedDuration: number;
}

// Mock data (in a real scenario, this would be in a database)
const routes: Route[] = [
  {
    route_id: "419",
    route_short_name: "419",
    route_long_name: "Nyabugogo-Cyumbati",
    route_color: "e92121"
  },
  {
    route_id: "101",
    route_short_name: "101",
    route_long_name: "Downtown-Remera",
    route_color: "B55C93"
  },
  // ... (other routes)
];

const stops: Stop[] = [
  {
    stop_id: "3a7a",
    stop_name: "Kwa Rwahama",
    stop_lat: -1.952559,
    stop_lon: 30.120783
  },
  {
    stop_id: "936d1650-82dc-4b35-8b4e-4a5608978387",
    stop_name: "Kagugu B",
    stop_lat: -1.912372,
    stop_lon: 30.082796
  },
  // ... (other stops)
];

// Helper functions
function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lon - loc1.lon) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function findNearestStop(location: Location): Stop {
  return stops.reduce((nearest, stop) => {
    const distance = calculateDistance(location, { lat: stop.stop_lat, lon: stop.stop_lon });
    return distance < calculateDistance(location, { lat: nearest.stop_lat, lon: nearest.stop_lon }) ? stop : nearest;
  });
}

// AI functions
function recommendRoute(start: Location, end: Location): RouteRecommendation {
  const startStop = findNearestStop(start);
  const endStop = findNearestStop(end);

  // In a real AI system, we would use more sophisticated algorithms to find the best route
  const recommendedRoute = routes[Math.floor(Math.random() * routes.length)];

  const estimatedDuration = Math.round(calculateDistance(start, end) / 30 * 60); // Assuming average speed of 30 km/h

  return {
    route: recommendedRoute,
    startStop,
    endStop,
    estimatedDuration
  };
}

// Express app setup
const app = express();
app.use(express.json());

// API endpoints
app.post('/api/recommend-route', (req: { body: { start: any; end: any; }; }, res: { json: (arg0: RouteRecommendation) => void; }) => {
  const { start, end } = req.body;
  const recommendation = recommendRoute(start, end);
  res.json(recommendation);
});

app.get('/api/stops', (req: any, res: { json: (arg0: Stop[]) => void; }) => {
  res.json(stops);
});

app.get('/api/routes', (req: any, res: { json: (arg0: Route[]) => void; }) => {
  res.json(routes);
});

// Simulated real-time bus locations
const busLocations: { [key: string]: Location } = {};

app.get('/api/bus-locations', (req: any, res: { json: (arg0: { [key: string]: Location; }) => void; }) => {
  // Simulate updating bus locations
  routes.forEach(route => {
    if (!busLocations[route.route_id]) {
      const randomStop = stops[Math.floor(Math.random() * stops.length)];
      busLocations[route.route_id] = { lat: randomStop.stop_lat, lon: randomStop.stop_lon };
    } else {
      // Simulate movement
      busLocations[route.route_id].lat += (Math.random() - 0.5) * 0.001;
      busLocations[route.route_id].lon += (Math.random() - 0.5) * 0.001;
    }
  });

  res.json(busLocations);
});

// Simulated user reporting system
interface Report {
  id: string;
  type: 'TRAFFIC' | 'ACCIDENT' | 'OTHER';
  location: Location;
  description: string;
  timestamp: number;
}

const reports: Report[] = [];

// app.post('/api/report', (req: { body: { type: any; location: any; description: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: Report): void; new(): any; }; }; }) => {
//   const { type, location, description } = req.body;
//   const newReport: Report = {
//     id: uuidv4(),
//     type,
//     location,
//     description,
//     timestamp: Date.now()
//   };
//   reports.push(newReport);
//   res.status(201).json(newReport);
// });

app.get('/api/reports', (req: any, res: { json: (arg0: Report[]) => void; }) => {
  // Return only reports from the last hour
  const recentReports = reports.filter(report => Date.now() - report.timestamp < 3600000);
  res.json(recentReports);
});


app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});

// For demonstration purposes, let's simulate some API calls
console.log("AI Backend Demo for KigaliTransport");
console.log("------------------------------------");

const start = { lat: -1.9534, lon: 30.0616 }; // Kigali City Tower
const end = { lat: -1.9686, lon: 30.1344 }; // Kigali International Airport

const recommendation = recommendRoute(start, end);
console.log("Route Recommendation:");
console.log(JSON.stringify(recommendation, null, 2));

console.log("\nSimulated Bus Locations:");
console.log(JSON.stringify(busLocations, null, 2));

const newReport: Report = {
  id: uuidv4(),
  type: 'TRAFFIC',
  location: { lat: -1.9534, lon: 30.0616 },
  description: "Heavy traffic due to road construction",
  timestamp: Date.now()
};
reports.push(newReport);

console.log("\nRecent Reports:");
console.log(JSON.stringify(reports, null, 2));