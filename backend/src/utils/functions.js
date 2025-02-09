const getDistance = (location1, location2) => {
  const lat1 = location1.latitude;
  const lon1 = location1.longitude;
  const lat2 = location2.latitude;
  const lon2 = location2.longitude;
  const R = 6371000;  
  const toRad = (val) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export { getDistance };
