export interface StationInfo {
  code: string;
  name: string;
  line: 'NS' | 'EW' | 'CC' | 'DT' | 'TE' | 'NE';
  district: string;
  interchangeWith?: string[];
}

export const ALL_MRT_STATIONS: StationInfo[] = [
  // North-South (NS)
  { code: 'NS1', name: 'Jurong East', line: 'NS', district: 'Jurong', interchangeWith: ['EW24'] },
  { code: 'NS9', name: 'Woodlands', line: 'NS', district: 'Woodlands', interchangeWith: ['TE2'] },
  { code: 'NS16', name: 'Ang Mo Kio', line: 'NS', district: 'Ang Mo Kio' },
  { code: 'NS17', name: 'Bishan', line: 'NS', district: 'Bishan', interchangeWith: ['CC15'] },
  { code: 'NS22', name: 'Orchard', line: 'NS', district: 'Orchard', interchangeWith: ['TE14'] },
  { code: 'NS24', name: 'Dhoby Ghaut', line: 'NS', district: 'Museum / Orchard', interchangeWith: ['NE6', 'CC1'] },
  { code: 'NS25', name: 'City Hall', line: 'NS', district: 'Civic District', interchangeWith: ['EW13'] },
  { code: 'NS26', name: 'Raffles Place', line: 'NS', district: 'Financial District', interchangeWith: ['EW14'] },
  { code: 'NS27', name: 'Marina Bay', line: 'NS', district: 'Marina Bay', interchangeWith: ['CC', 'TE20'] },

  // East-West (EW)
  { code: 'EW12', name: 'Bugis', line: 'EW', district: 'Kampong Glam', interchangeWith: ['DT14'] },
  { code: 'EW13', name: 'City Hall', line: 'EW', district: 'Civic District', interchangeWith: ['NS25'] },
  { code: 'EW14', name: 'Raffles Place', line: 'EW', district: 'Downtown', interchangeWith: ['NS26'] },
  { code: 'EW15', name: 'Tanjong Pagar', line: 'EW', district: 'Tanjong Pagar / CBD' },
  { code: 'EW16', name: 'Outram Park', line: 'EW', district: 'Chinatown', interchangeWith: ['NE3', 'TE17'] },
  { code: 'EW17', name: 'Tiong Bahru', line: 'EW', district: 'Tiong Bahru' },
  { code: 'EW20', name: 'Commonwealth', line: 'EW', district: 'Queenstown' },
  { code: 'CG2', name: 'Changi Airport', line: 'EW', district: 'Changi' },

  // Circle Line (CC)
  { code: 'CC1', name: 'Dhoby Ghaut', line: 'CC', district: 'Orchard', interchangeWith: ['NS24', 'NE6'] },
  { code: 'CC3', name: 'Esplanade', line: 'CC', district: 'Marina Bay' },
  { code: 'CC4', name: 'Promenade', line: 'CC', district: 'Marina Bay', interchangeWith: ['DT15'] },
  { code: 'CC8', name: 'Dakota', line: 'CC', district: 'Old Airport Road / Katong' },
  { code: 'CC15', name: 'Bishan', line: 'CC', district: 'Bishan', interchangeWith: ['NS17'] },
  { code: 'CC19', name: 'Botanic Gardens', line: 'CC', district: 'Bukit Timah', interchangeWith: ['DT9'] },
  { code: 'CC23', name: 'one-north', line: 'CC', district: 'Portsdown / Wessex' },
  { code: 'CC25', name: 'Haw Par Villa', line: 'CC', district: 'Pasir Panjang' },
  { code: 'CC28', name: 'Telok Blangah', line: 'CC', district: 'Southern Ridges' },
  { code: 'CC29', name: 'HarbourFront', line: 'CC', district: 'Sentosa / Mount Faber', interchangeWith: ['NE1'] },

  // Downtown Line (DT)
  { code: 'DT9', name: 'Botanic Gardens', line: 'DT', district: 'Tanglin', interchangeWith: ['CC19'] },
  { code: 'DT14', name: 'Bugis', line: 'DT', district: 'Kampong Glam', interchangeWith: ['EW12'] },
  { code: 'DT16', name: 'Bayfront', line: 'DT', district: 'Marina Bay Sands', interchangeWith: ['CE1'] },
  { code: 'DT18', name: 'Telok Ayer', line: 'DT', district: 'CBD / Amoy St' },
  { code: 'DT19', name: 'Chinatown', line: 'DT', district: 'Chinatown', interchangeWith: ['NE4'] },
  { code: 'DT22', name: 'Jalan Besar', line: 'DT', district: 'Little India' },

  // Thomson-East Coast Line (TE)
  { code: 'TE14', name: 'Orchard', line: 'TE', district: 'Orchard Road', interchangeWith: ['NS22'] },
  { code: 'TE17', name: 'Outram Park', line: 'TE', district: 'Chinatown', interchangeWith: ['EW16', 'NE3'] },
  { code: 'TE18', name: 'Maxwell', line: 'TE', district: 'Maxwell Hawker / Chinatown' },
  { code: 'TE19', name: 'Shenton Way', line: 'TE', district: 'Financial District' },
  { code: 'TE22', name: 'Gardens by the Bay', line: 'TE', district: 'Marina South' },
  { code: 'TE26', name: 'Marine Parade', line: 'TE', district: 'Joo Chiat / Katong' },
  { code: 'TE27', name: 'Marine Terrace', line: 'TE', district: 'East Coast' },

  // North-East Line (NE)
  { code: 'NE1', name: 'HarbourFront', line: 'NE', district: 'Vivocity / Sentosa', interchangeWith: ['CC29'] },
  { code: 'NE3', name: 'Outram Park', line: 'NE', district: 'Chinatown', interchangeWith: ['EW16', 'TE17'] },
  { code: 'NE4', name: 'Chinatown', line: 'NE', district: 'Chinatown', interchangeWith: ['DT19'] },
  { code: 'NE5', name: 'Clarke Quay', line: 'NE', district: 'Riverside / Boat Quay' },
  { code: 'NE6', name: 'Dhoby Ghaut', line: 'NE', district: 'Museum District', interchangeWith: ['NS24', 'CC1'] },
  { code: 'NE7', name: 'Little India', line: 'NE', district: 'Little India', interchangeWith: ['DT12'] }
];

export function calculateMrtFare(fromStation: string, toStation: string): { fareSgd: number; travelTimeMinutes: number; transfers: number } {
  if (!fromStation || !toStation || fromStation === toStation) {
    return { fareSgd: 0, travelTimeMinutes: 0, transfers: 0 };
  }

  const s1 = ALL_MRT_STATIONS.find(s => s.name === fromStation || s.code === fromStation);
  const s2 = ALL_MRT_STATIONS.find(s => s.name === toStation || s.code === toStation);

  if (!s1 || !s2) {
    return { fareSgd: 1.65, travelTimeMinutes: 18, transfers: 1 };
  }

  const sameLine = s1.line === s2.line;
  const isInterchange = s1.interchangeWith?.includes(s2.code) || s2.interchangeWith?.includes(s1.code);

  let fare = 1.19;
  let time = 12;
  let transfers = 0;

  if (sameLine) {
    fare = 1.35;
    time = 14;
    transfers = 0;
  } else if (isInterchange) {
    fare = 1.19;
    time = 6;
    transfers = 1;
  } else {
    fare = 1.78;
    time = 24;
    transfers = 1;
  }

  // Changi Airport surcharge / distance
  if (s1.code === 'CG2' || s2.code === 'CG2') {
    fare = 2.18;
    time = 38;
  }

  return { fareSgd: fare, travelTimeMinutes: time, transfers };
}
