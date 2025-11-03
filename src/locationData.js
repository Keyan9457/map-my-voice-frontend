// src/locationData.js
export const locationData = {
  India: {
    lat: 20.5937,
    lon: 78.9629,
    zoom: 5,
    states: {
      'Tamil Nadu': {
        lat: 11.1271,
        lon: 78.6569,
        zoom: 7,
        districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
      },
      Maharashtra: {
        lat: 19.7515,
        lon: 75.7139,
        zoom: 7,
        districts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
      },
      Karnataka: {
        lat: 15.3173,
        lon: 75.7139,
        zoom: 7,
        districts: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'],
      },
    },
  },
  // You can add more countries here in the same format
  // 'United States': { ... }
};