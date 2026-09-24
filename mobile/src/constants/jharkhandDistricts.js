// All 24/25 Official Administrative Districts of Jharkhand matching the Web Platform
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

export const AFFECTED_PEOPLE_OPTIONS = [
  'Less than 100 residents',
  '100 - 500 residents',
  '500 - 1,000 residents',
  '1,000 - 5,000 residents',
  '5,000 - 10,000 residents',
  '10,000+ residents',
  'Entire Village / Gram Panchayat',
  'Entire Block / Urban Ward',
  'District-wide / Regional Area',
];

export const JHARKHAND_HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85',
    title: 'Saranda & Betla Forests',
  },
  {
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1400&q=85',
    title: 'Baidyanath Dham & Maluti Temples',
  },
  {
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1400&q=85',
    title: 'Hundru & Dassam Waterfalls',
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85',
    title: 'Patratu Valley & Netarhat Hills',
  },
  {
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=85',
    title: 'Parasnath Hills & Shikharji',
  },
];

// District central geographic coordinates (latitude, longitude)
export const DISTRICT_COORDINATES = {
  Bokaro: { lat: 23.6693, lng: 86.1511 },
  Chatra: { lat: 24.2092, lng: 84.8715 },
  Deoghar: { lat: 24.4826, lng: 86.7000 },
  Dhanbad: { lat: 23.7957, lng: 86.4304 },
  Dumka: { lat: 24.2676, lng: 87.2492 },
  'East Singhbhum': { lat: 22.8046, lng: 86.2029 },
  'East Singhbhum (Jamshedpur)': { lat: 22.8046, lng: 86.2029 },
  Jamshedpur: { lat: 22.8046, lng: 86.2029 },
  Garhwa: { lat: 24.1610, lng: 83.8078 },
  Giridih: { lat: 24.1855, lng: 86.3095 },
  Godda: { lat: 24.8267, lng: 87.2139 },
  Gumla: { lat: 23.0441, lng: 84.5417 },
  Hazaribagh: { lat: 23.9925, lng: 85.3637 },
  Jamtara: { lat: 23.9610, lng: 86.8014 },
  Khunti: { lat: 23.0740, lng: 85.2784 },
  Koderma: { lat: 24.4674, lng: 85.5939 },
  Latehar: { lat: 23.7441, lng: 84.4988 },
  Lohardaga: { lat: 23.4418, lng: 84.6826 },
  Pakur: { lat: 24.6341, lng: 87.8492 },
  Palamu: { lat: 24.0439, lng: 84.0700 },
  Ramgarh: { lat: 23.6315, lng: 85.5134 },
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Sahebganj: { lat: 25.2425, lng: 87.6433 },
  Sahibganj: { lat: 25.2425, lng: 87.6433 },
  'Saraikela Kharsawan': { lat: 22.7000, lng: 85.9300 },
  'Seraikela Kharsawan': { lat: 22.7000, lng: 85.9300 },
  Simdega: { lat: 22.6167, lng: 84.5000 },
  'West Singhbhum': { lat: 22.5500, lng: 85.8000 },
  'West Singhbhum (Chaibasa)': { lat: 22.5500, lng: 85.8000 },
  Chaibasa: { lat: 22.5500, lng: 85.8000 },
};

export const getCoordinatesForDistrict = (districtName) => {
  if (!districtName) return DISTRICT_COORDINATES['Ranchi'];
  if (DISTRICT_COORDINATES[districtName]) {
    return DISTRICT_COORDINATES[districtName];
  }
  const clean = districtName.toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (key.toLowerCase().includes(clean) || clean.includes(key.toLowerCase())) {
      return coords;
    }
  }
  return DISTRICT_COORDINATES['Ranchi'];
};
