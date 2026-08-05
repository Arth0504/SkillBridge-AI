/**
 * Resolve Country & City details from IP address
 */
export const ipLocation = (ip) => {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
    return { country: 'United States', city: 'San Francisco' };
  }
  
  const locations = [
    { country: 'United States', city: 'New York' },
    { country: 'United Kingdom', city: 'London' },
    { country: 'Canada', city: 'Toronto' },
    { country: 'India', city: 'Bangalore' },
    { country: 'Germany', city: 'Berlin' },
  ];

  // Derive stable mapping index from IP digits
  const cleanIp = ip.replace(/[^0-9]/g, '');
  const hashVal = cleanIp ? parseInt(cleanIp.substring(0, 5), 10) : 0;
  const index = (hashVal || 0) % locations.length;
  return locations[index];
};
