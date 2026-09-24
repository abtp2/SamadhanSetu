/**
 * All 24 official administrative districts of Jharkhand State, India.
 * Includes precise geospatial coordinates for GIS mapping & spatial problem triage.
 */

export const JHARKHAND_DISTRICTS = [
  'Bokaro',
  'Chatra',
  'Deoghar',
  'Dhanbad',
  'Dumka',
  'East Singhbhum',
  'Garhwa',
  'Giridih',
  'Godda',
  'Gumla',
  'Hazaribagh',
  'Jamshedpur',
  'Jamtara',
  'Khunti',
  'Koderma',
  'Latehar',
  'Lohardaga',
  'Pakur',
  'Palamu',
  'Ramgarh',
  'Ranchi',
  'Sahebganj',
  'Saraikela Kharsawan',
  'Simdega',
  'West Singhbhum',
];

export const DISTRICT_COORDINATES = {
  Bokaro: { lat: 23.6693, lng: 86.1511, zoom: 11 },
  Chatra: { lat: 24.2092, lng: 84.8715, zoom: 11 },
  Deoghar: { lat: 24.4826, lng: 86.7000, zoom: 11 },
  Dhanbad: { lat: 23.7957, lng: 86.4304, zoom: 11 },
  Dumka: { lat: 24.2676, lng: 87.2492, zoom: 11 },
  'East Singhbhum': { lat: 22.8046, lng: 86.2029, zoom: 11 },
  Garhwa: { lat: 24.1610, lng: 83.8078, zoom: 11 },
  Giridih: { lat: 24.1855, lng: 86.3095, zoom: 11 },
  Godda: { lat: 24.8267, lng: 87.2139, zoom: 11 },
  Gumla: { lat: 23.0441, lng: 84.5417, zoom: 11 },
  Hazaribagh: { lat: 23.9925, lng: 85.3637, zoom: 11 },
  Jamshedpur: { lat: 22.8046, lng: 86.2029, zoom: 11 },
  Jamtara: { lat: 23.9610, lng: 86.8014, zoom: 11 },
  Khunti: { lat: 23.0740, lng: 85.2784, zoom: 11 },
  Koderma: { lat: 24.4674, lng: 85.5939, zoom: 11 },
  Latehar: { lat: 23.7441, lng: 84.4988, zoom: 11 },
  Lohardaga: { lat: 23.4418, lng: 84.6826, zoom: 11 },
  Pakur: { lat: 24.6341, lng: 87.8492, zoom: 11 },
  Palamu: { lat: 24.0439, lng: 84.0700, zoom: 11 },
  Ramgarh: { lat: 23.6315, lng: 85.5134, zoom: 11 },
  Ranchi: { lat: 23.3441, lng: 85.3096, zoom: 11 },
  Sahebganj: { lat: 25.2425, lng: 87.6433, zoom: 11 },
  Sahibganj: { lat: 25.2425, lng: 87.6433, zoom: 11 },
  'Saraikela Kharsawan': { lat: 22.7000, lng: 85.9300, zoom: 11 },
  'Seraikela Kharsawan': { lat: 22.7000, lng: 85.9300, zoom: 11 },
  Simdega: { lat: 22.6167, lng: 84.5000, zoom: 11 },
  'West Singhbhum': { lat: 22.5500, lng: 85.8000, zoom: 11 },
};

export const DISTRICT_MAP_CENTERS = {
  All: { center: [23.6102, 85.2799], zoom: 8 },
  ...Object.fromEntries(
    Object.entries(DISTRICT_COORDINATES).map(([name, data]) => [
      name,
      { center: [data.lat, data.lng], zoom: data.zoom || 11 },
    ])
  ),
};
