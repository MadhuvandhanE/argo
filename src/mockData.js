// A dictionary mapping float IDs to their full data history and name
export const floatData = {
  '2901788': {
    name: 'Kerala Coast Float',
    history: [
      { time: '2025-06-10', latitude: 8.5, longitude: 75.5, temperature: 28.5, salinity: 34.5, pressure: 5, chlorophyll: 0.2, oxygen: 190, nitrate: 0.5 },
      { time: '2025-07-20', latitude: 8.7, longitude: 75.6, temperature: 28.6, salinity: 34.6, pressure: 7, chlorophyll: 0.3, oxygen: 188, nitrate: 0.6 },
      { time: '2025-08-15', latitude: 8.9, longitude: 75.4, temperature: 28.7, salinity: 34.5, pressure: 5, chlorophyll: 0.25, oxygen: 192, nitrate: 0.4 },
      { time: '2025-09-01', latitude: 9.1, longitude: 75.5, temperature: 28.6, salinity: 34.6, pressure: 8, chlorophyll: 0.22, oxygen: 191, nitrate: 0.5 },
    ]
  },
  '3002541': {
    name: 'Bay of Bengal Float',
    history: [
      { time: '2025-06-12', latitude: 12.1, longitude: 85.2, temperature: 27.9, salinity: 33.9, pressure: 8, chlorophyll: 0.5, oxygen: 185, nitrate: 1.2 },
      { time: '2025-07-22', latitude: 12.3, longitude: 85.2, temperature: 28.1, salinity: 33.8, pressure: 6, chlorophyll: 0.6, oxygen: 182, nitrate: 1.5 },
      { time: '2025-08-18', latitude: 12.6, longitude: 85.5, temperature: 28.2, salinity: 34.0, pressure: 7, chlorophyll: 0.55, oxygen: 184, nitrate: 1.3 },
      { time: '2025-09-02', latitude: 12.7, longitude: 85.6, temperature: 28.1, salinity: 33.9, pressure: 8, chlorophyll: 0.48, oxygen: 186, nitrate: 1.1 },
    ]
  },
  '1902345': {
      name: 'Arabian Sea Float',
      history: [
        { time: '2025-07-01', latitude: 15.5, longitude: 65.2, temperature: 28.9, salinity: 35.5, pressure: 6, chlorophyll: 0.4, oxygen: 180, nitrate: 1.8 },
        { time: '2025-08-10', latitude: 15.8, longitude: 65.5, temperature: 29.1, salinity: 35.4, pressure: 8, chlorophyll: 0.45, oxygen: 178, nitrate: 1.9 },
        { time: '2025-09-05', latitude: 16.1, longitude: 65.8, temperature: 28.8, salinity: 35.5, pressure: 7, chlorophyll: 0.38, oxygen: 182, nitrate: 1.7 },
      ]
  },
    '9876543': {
        name: 'Sundarbans Delta Float',
        history: [
            { time: '2025-07-05', latitude: 20.2, longitude: 89.8, temperature: 29.5, salinity: 32.8, pressure: 5, chlorophyll: 0.9, oxygen: 175, nitrate: 4.5 },
            { time: '2025-08-12', latitude: 20.5, longitude: 90.1, temperature: 29.7, salinity: 32.5, pressure: 6, chlorophyll: 1.2, oxygen: 170, nitrate: 5.0 },
            { time: '2025-09-08', latitude: 20.8, longitude: 90.4, temperature: 29.4, salinity: 32.7, pressure: 5, chlorophyll: 1.0, oxygen: 172, nitrate: 4.7 },
        ]
    }
  // (In a real app, the full history for all floats would be included here)
};

// Helper to get the latest position for each float for the initial map display
export const uniqueFloats = Object.entries(floatData).map(([id, data]) => {
    const latest = data.history[data.history.length - 1];
    return {
        float_id: parseInt(id),
        ...latest
    };
});

// Mock alerts remain the same
export const mockAlerts = [
  { id: 1, title: "Marine Heatwave Detected", description: "Float 1902345 in the Arabian Sea shows temperatures 2.1°C above the seasonal average.", float_id: 1902345, parameter: 'temperature' },
  { id: 2, title: "Significant Algal Bloom", description: "Float 9876543 near the Sundarbans Delta reports unusually high chlorophyll levels.", float_id: 9876543, parameter: 'chlorophyll' },
  { id: 3, title: "Low Oxygen Event", description: "Float 3002541 in the Bay of Bengal shows a rapid drop in dissolved oxygen.", float_id: 3002541, parameter: 'oxygen' },
];