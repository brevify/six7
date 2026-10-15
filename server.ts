import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_TRANSIT_STATUS } from './src/data/singaporeData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI on the server
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory store for collaborative trip sessions
const collaborativeTrips = new Map<string, any>();

// Real-time transit status cache with simulated updates
let transitStatuses = [...INITIAL_TRANSIT_STATUS];

// API: Live Singapore Transit Updates
app.get('/api/transit/live', (req, res) => {
  // Occasionally simulate realistic minor crowd/delay fluctuations based on Singapore peak hours
  const now = new Date();
  const singaporeHour = (now.getUTCHours() + 8) % 24; // UTC+8 Singapore Time
  const isPeak = (singaporeHour >= 7 && singaporeHour <= 9) || (singaporeHour >= 17 && singaporeHour <= 19);

  const updated = transitStatuses.map(line => {
    let crowd = isPeak ? (line.lineCode === 'NS' || line.lineCode === 'EW' ? 'Heavy' : 'Moderate') : 'Low';
    return {
      ...line,
      crowdLevel: crowd,
      frequencyPeakMinutes: isPeak ? '2 - 3 min' : '3 - 4 min',
      frequencyOffPeakMinutes: isPeak ? '3 - 4 min' : '4 - 6 min',
      lastUpdated: 'Live updated ' + new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' SGT'
    };
  });

  res.json({
    status: 'ok',
    systemHealth: 'Optimal',
    timezone: 'Asia/Singapore (SGT UTC+8)',
    singaporeTime: new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore' }),
    isPeakHour: isPeak,
    lines: updated,
    advisories: [
      {
        title: 'SimplyGo Contactless Payment Active',
        type: 'info',
        text: 'Foreign contactless Mastercard/Visa cards and mobile wallets accepted at standard resident fare rates.'
      },
      {
        title: 'Thomson-East Coast Line Stage 4',
        type: 'success',
        text: 'Direct coastal line linking Gardens by the Bay to Tanjong Rhu, Katong Park, Tanjong Katong, Marine Parade, and Bayshore.'
      }
    ]
  });
});

// API: Collaborative Trip Sharing & Sync
app.get('/api/collaborate/session/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const trip = collaborativeTrips.get(code);
  if (!trip) {
    return res.status(404).json({ error: 'Collaborative itinerary session not found' });
  }
  res.json({ trip });
});

app.post('/api/collaborate/session', (req, res) => {
  const { trip, shareCode } = req.body;
  const code = (shareCode || Math.random().toString(36).substring(2, 8)).toUpperCase();
  const sessionData = {
    ...trip,
    shareCode: code,
    updatedAt: new Date().toISOString()
  };
  collaborativeTrips.set(code, sessionData);
  res.json({ success: true, shareCode: code, trip: sessionData });
});

app.post('/api/collaborate/vote', (req, res) => {
  const { shareCode, stopId, direction } = req.body;
  const code = shareCode?.toUpperCase();
  const trip = collaborativeTrips.get(code);
  if (!trip) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Find stop and adjust upvotes
  for (const day of trip.days || []) {
    for (const stop of day.stops || []) {
      if (stop.id === stopId) {
        stop.upvotes = (stop.upvotes || 0) + (direction === 'up' ? 1 : -1);
      }
    }
  }

  trip.updatedAt = new Date().toISOString();
  collaborativeTrips.set(code, trip);
  res.json({ success: true, trip });
});

app.post('/api/collaborate/note', (req, res) => {
  const { shareCode, stopId, noteText, author } = req.body;
  const code = shareCode?.toUpperCase();
  const trip = collaborativeTrips.get(code);
  if (!trip) {
    return res.status(404).json({ error: 'Session not found' });
  }

  for (const day of trip.days || []) {
    for (const stop of day.stops || []) {
      if (stop.id === stopId) {
        if (!stop.notes) stop.notes = [];
        stop.notes.push(`${author || 'Buddy'}: ${noteText}`);
      }
    }
  }

  trip.updatedAt = new Date().toISOString();
  collaborativeTrips.set(code, trip);
  res.json({ success: true, trip });
});

// API: Generate Tailored Singapore Itinerary via Gemini 3.8 Flash
app.post('/api/itinerary/generate', async (req, res) => {
  const {
    durationDays = 3,
    travelStyle = 'hidden-gems',
    budgetTier = 'moderate',
    dailyBudgetSgd = 100,
    pace = 'moderate',
    companion = 'solo',
    interests = [],
    dietaryRestrictions = []
  } = req.body;

  try {
    if (!aiClient) {
      // Re-check environment key if newly injected
      if (process.env.GEMINI_API_KEY) {
        aiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
      }
    }

    if (!aiClient) {
      console.warn("GEMINI_API_KEY not configured, falling back to curated itinerary generator");
      return res.status(200).json({
        source: 'curated-generator',
        itinerary: generateCuratedItinerary({ durationDays, travelStyle, budgetTier, dailyBudgetSgd, pace, companion, interests, dietaryRestrictions })
      });
    }

    const prompt = `You are a savvy, local Singapore travel expert and transit navigator.
Create a rich, realistic, geographically optimized ${durationDays}-day Singapore itinerary tailored to these preferences:
- Travel Style: ${travelStyle}
- Budget Tier: ${budgetTier} (approx SGD $${dailyBudgetSgd}/day per person)
- Travel Pace: ${pace}
- Group Type: ${companion}
- Special Interests: ${interests.length > 0 ? interests.join(', ') : 'Hidden gems, local food culture, street photography'}
- Dietary Notes: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'None specified'}

IMPORTANT SINGAPORE TRAVEL RULES TO EMBED:
1. Emphasize actual, authentic hawker centres (Maxwell, Old Airport Road, Chinatown Complex, Tekka Centre, Tiong Bahru, Amoy St, Golden Mile) and true hidden gems (e.g. Wessex Estate colonial houses, Katong Koon Seng Rd Peranakans, Haw Par Villa, Keong Saik shophouses, Southern Ridges canopy walk, Sungei Buloh wetlands).
2. Group attractions geographically by district so travel time is minimized and MRT transit line routing is seamless.
3. Include specific MRT stations and line codes (e.g., Maxwell TE18, Bayfront DT16/CE1, Chinatown NE4/DT19, Tanjong Pagar EW15).
4. Provide realistic costs in SGD ($) matching the budget tier ($3-$8 for hawker meals, $1.50-$2.30 for MRT rides, free outdoor views vs ticketed biodomes).
5. Give genuine insider tips (e.g., Chope culture, best time to visit to skip humidity/queues, SimplyGo payment).

Respond with valid JSON ONLY adhering to this exact format:
{
  "title": "Creative Title for this Itinerary",
  "summary": "2-3 sentence overview of the trip experience",
  "projectedCostSgd": 280,
  "days": [
    {
      "dayNumber": 1,
      "theme": "Day theme (e.g. Heritage Enclaves & Secret Hawker Feasts)",
      "districtFocus": "Chinatown & Keong Saik",
      "summary": "Brief description of the day's flow",
      "totalEstimatedCostSgd": 45,
      "totalWalkingKm": 3.8,
      "stops": [
        {
          "id": "day1-stop1",
          "title": "Spot Name",
          "category": "sight" | "food" | "hidden-gem" | "transit" | "relaxation",
          "district": "District Name",
          "description": "Engaging description with cultural context",
          "locationName": "Precise venue or landmark name",
          "address": "Street address or landmark area",
          "lat": 1.2804,
          "lng": 103.8446,
          "mrtStation": "Station Name (Line Code)",
          "mrtLineCode": "NS" | "EW" | "CC" | "DT" | "TE" | "NE",
          "timeSlot": "09:00 - 10:30",
          "durationMinutes": 90,
          "costSgd": 8,
          "highlightTag": "Short label (e.g. Michelin Bib Gourmand, Sunset Spot, Local Secret)",
          "localTip": "Practical insider tip for travelers",
          "foodRecommendation": "Exact signature dish to order and price if food stop"
        }
      ],
      "transitLegs": [
        {
          "fromStopId": "day1-stop1",
          "toStopId": "day1-stop2",
          "mode": "mrt" | "bus" | "walk",
          "routeDescription": "Walk 5 mins to Maxwell Station, take TE Line 2 stops to Shenton Way",
          "durationMinutes": 12,
          "estimatedCostSgd": 1.45,
          "transitLine": "TE Line"
        }
      ]
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(text);
    res.json({
      source: 'gemini-3.8-flash',
      itinerary: {
        id: 'itinerary-' + Date.now(),
        title: parsed.title || `${durationDays}-Day Curated Singapore Itinerary`,
        createdAt: new Date().toISOString(),
        preferences: {
          tripName: parsed.title || 'Singapore Exploration',
          durationDays,
          travelStyle,
          budgetTier,
          dailyBudgetSgd,
          pace,
          companion,
          interests,
          dietaryRestrictions
        },
        days: parsed.days,
        totalBudgetSgd: dailyBudgetSgd * durationDays,
        projectedCostSgd: parsed.projectedCostSgd || (dailyBudgetSgd * durationDays * 0.85),
        collaborators: [
          { id: 'user-1', name: 'Trip Creator (You)', avatarColor: '#0284c7', role: 'owner' }
        ],
        shareCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      }
    });
  } catch (error: any) {
    console.error('Error generating itinerary via Gemini API:', error);
    // Provide guaranteed flawless fallback
    const fallback = generateCuratedItinerary({ durationDays, travelStyle, budgetTier, dailyBudgetSgd, pace, companion, interests, dietaryRestrictions });
    res.json({
      source: 'curated-generator-fallback',
      itinerary: fallback
    });
  }
});

// Helper: Curated generator fallback matching user preferences
function generateCuratedItinerary(pref: any) {
  const daysCount = Math.max(1, Math.min(7, pref.durationDays || 3));
  const days = [];

  const districtPlans = [
    {
      theme: 'Chinatown, Heritage Shophouses & Twilight Marina',
      district: 'Chinatown & Marina Bay',
      summary: 'Explore Michelin-rated hawker stalls, tranquil temple alleys, and evening light displays by the waterfront.',
      stops: [
        {
          id: 'd1-s1',
          title: 'Maxwell Food Centre Breakfast',
          category: 'food',
          district: 'Chinatown',
          description: 'Historic open-air hawker hall famous for Tian Tian Hainanese Chicken Rice, peanut porridge, and fresh sugarcane juice.',
          locationName: 'Maxwell Food Centre',
          address: '1 Kadayanallur St, Singapore 069184',
          lat: 1.2804,
          lng: 103.8446,
          mrtStation: 'Maxwell (TE18)',
          mrtLineCode: 'TE',
          timeSlot: '09:00 - 10:30',
          durationMinutes: 90,
          costSgd: 7,
          highlightTag: 'Michelin Bib Gourmand',
          localTip: 'Carry small tissue packets to "chope" (hold) your table. Get sugarcane juice with fresh calamansi lime for the best tropical refresher.',
          foodRecommendation: 'Tian Tian Chicken Rice (S$5) + Sugar Cane Juice (S$2)'
        },
        {
          id: 'd1-s2',
          title: 'Everton Park & Keong Saik Art Deco Walk',
          category: 'hidden-gem',
          district: 'Everton Park',
          description: 'A tranquil post-war neighborhood with artisan pottery studios, hidden third-wave cafes, and Blair Road pastel shophouses.',
          locationName: 'Everton Park & Blair Plain',
          address: 'Blair Rd, Singapore 089910',
          lat: 1.2778,
          lng: 103.8385,
          mrtStation: 'Outram Park (EW16/NE3/TE17)',
          mrtLineCode: 'EW',
          timeSlot: '11:00 - 12:45',
          durationMinutes: 105,
          costSgd: 4,
          highlightTag: 'Secret Architectural Walk',
          localTip: 'Blair Road has the most pristine residential Peranakan ceramic tile facades in Singapore without the tourist crowds of Joo Chiat.',
          foodRecommendation: 'Ji Xiang Traditional Peanut Ang Ku Kueh (S$1.50)'
        },
        {
          id: 'd1-s3',
          title: 'Gardens by the Bay & Cloud Forest Biodome',
          category: 'sight',
          district: 'Marina Bay',
          description: 'Massive cooled conservatories showcasing mountain mist vegetation and towering vertical Supertrees.',
          locationName: 'Gardens by the Bay',
          address: '18 Marina Gardens Dr, Singapore 018953',
          lat: 1.2816,
          lng: 103.8636,
          mrtStation: 'Bayfront (CE1/DT16)',
          mrtLineCode: 'DT',
          timeSlot: '15:30 - 18:00',
          durationMinutes: 150,
          costSgd: pref.budgetTier === 'budget' ? 0 : 28,
          highlightTag: 'Futuristic Eco-Marvel',
          localTip: 'The outdoor Supertree Grove is completely free to enter! Sit on the green lawns at 7:45pm to watch the Garden Rhapsody light show for $0.',
          foodRecommendation: 'Walk through Marina Bay Shoppes for cold bubble tea'
        },
        {
          id: 'd1-s4',
          title: 'Lau Pa Sat Satay Street Evening Feast',
          category: 'food',
          district: 'Downtown Financial District',
          description: 'Victorian cast-iron market surrounded by illuminated towers. At dusk, Boon Tat street turns into an open-air barbecue alley.',
          locationName: 'Lau Pa Sat Satay Street',
          address: '18 Raffles Quay, Singapore 048582',
          lat: 1.2807,
          lng: 103.8505,
          mrtStation: 'Telok Ayer (DT18) / Raffles Place (NS26)',
          mrtLineCode: 'DT',
          timeSlot: '19:15 - 21:00',
          durationMinutes: 105,
          costSgd: 14,
          highlightTag: 'Atmospheric Night Dining',
          localTip: 'Head straight to Stall 7 & 8 for mixed chicken and mutton satay with spiced chunky peanut pineapple gravy.',
          foodRecommendation: 'Mixed Satay Set of 15 skewers + rice cakes (S$14)'
        }
      ],
      transitLegs: [
        {
          fromStopId: 'd1-s1',
          toStopId: 'd1-s2',
          mode: 'walk',
          routeDescription: 'Pleasant 8-minute walk past Neil Road shophouses into Everton Park.',
          durationMinutes: 8,
          estimatedCostSgd: 0
        },
        {
          fromStopId: 'd1-s2',
          toStopId: 'd1-s3',
          mode: 'mrt',
          routeDescription: 'Board Downtown Line at Chinatown or Maxwell TE Line to Bayfront Station (DT16). Direct exit B.',
          durationMinutes: 14,
          estimatedCostSgd: 1.55,
          transitLine: 'Downtown / TE Line'
        },
        {
          fromStopId: 'd1-s3',
          toStopId: 'd1-s4',
          mode: 'mrt',
          routeDescription: 'Take Downtown Line 1 stop from Bayfront (DT16) to Telok Ayer (DT18), walk 3 mins.',
          durationMinutes: 10,
          estimatedCostSgd: 1.25,
          transitLine: 'Downtown Line'
        }
      ]
    },
    {
      theme: 'Peranakan Heritage & Coastal Flavors',
      district: 'Joo Chiat, Katong & East Coast',
      summary: 'Wander past vibrant pastel ceramic facades, sample authentic spicy Katong Laksa, and catch coastal breezes.',
      stops: [
        {
          id: 'd2-s1',
          title: 'Chin Mee Chin Confectionery & Kaya Toast',
          category: 'food',
          district: 'Katong',
          description: 'Historic Hainanese kopitiam open since the 1920s with vintage blue mosaic floor tiles and freshly charcoal-toasted round buns.',
          locationName: 'Chin Mee Chin',
          address: '204 E Coast Rd, Singapore 428903',
          lat: 1.3061,
          lng: 103.9038,
          mrtStation: 'Marine Parade (TE26)',
          mrtLineCode: 'TE',
          timeSlot: '08:45 - 10:00',
          durationMinutes: 75,
          costSgd: 6,
          highlightTag: 'Vintage 1920s Kopitiam',
          localTip: 'Order the soft-boiled eggs with dark sweet soya sauce and white pepper, dip the warm pandan kaya buns straight into the eggs.',
          foodRecommendation: 'Kaya Toast Bun + 2 Soft-Boiled Eggs + Kopi-C (S$5.80)'
        },
        {
          id: 'd2-s2',
          title: 'Koon Seng Road Pastel Shophouses & Antique Alleys',
          category: 'hidden-gem',
          district: 'Joo Chiat',
          description: 'A world-famous row of pre-war shophouses decorated with intricate European ceramic tiles, mythical Chinese dragons, and Malay wood fretwork.',
          locationName: 'Koon Seng Road',
          address: 'Koon Seng Rd, Singapore 426951',
          lat: 1.3075,
          lng: 103.9032,
          mrtStation: 'Marine Parade (TE26)',
          mrtLineCode: 'TE',
          timeSlot: '10:15 - 11:45',
          durationMinutes: 90,
          costSgd: 0,
          highlightTag: 'Photographer\'s Secret',
          localTip: 'Be respectful as these are private family homes. Morning sunlight illuminates the south-facing pastel facades beautifully between 10am and 11:30am.',
          foodRecommendation: 'Birds of Paradise Botanical Gelato (White Chrysanthemum flavour) nearby (S$5.50)'
        },
        {
          id: 'd2-s3',
          title: '328 Katong Laksa Lunch',
          category: 'food',
          district: 'Katong',
          description: 'Legendary rich spicy coconut broth noodles cooked with dried shrimp, cockles, fishcake, and fragrant daun kesum (laksa leaves).',
          locationName: '328 Katong Laksa',
          address: '51 E Coast Rd, Singapore 428770',
          lat: 1.3045,
          lng: 103.9028,
          mrtStation: 'Marine Parade (TE26)',
          mrtLineCode: 'TE',
          timeSlot: '12:00 - 13:15',
          durationMinutes: 75,
          costSgd: 8,
          highlightTag: 'Culinary Icon',
          localTip: 'Do not ask for chopsticks! Katong laksa noodles are purposefully snipped into short spoonfuls to be eaten solely with a porcelain soup spoon.',
          foodRecommendation: 'Signature Laksa bowl (S$6.50) + Otah grilled in banana leaf (S$1.60)'
        },
        {
          id: 'd2-s4',
          title: 'East Coast Park Coastal Breezes & Cycling',
          category: 'relaxation',
          district: 'East Coast',
          description: 'Scenic 15-kilometer sandy coastline where locals gather for sea breeze rollerblading, beach camping, and sunset relaxation.',
          locationName: 'East Coast Park Parkland Green',
          address: '920 ECP, Singapore 449875',
          lat: 1.3005,
          lng: 103.9095,
          mrtStation: 'Marine Parade (TE26) / Marine Terrace (TE27)',
          mrtLineCode: 'TE',
          timeSlot: '16:00 - 18:30',
          durationMinutes: 150,
          costSgd: 10,
          highlightTag: 'Seafront Escape',
          localTip: 'Rent a public bicycle using the Anywheel app for S$1 per 30 minutes to cruise effortlessly along the coastline path.'
        }
      ],
      transitLegs: [
        {
          fromStopId: 'd2-s1',
          toStopId: 'd2-s2',
          mode: 'walk',
          routeDescription: 'Walk 5 minutes north along Joo Chiat Road into Koon Seng Road.',
          durationMinutes: 5,
          estimatedCostSgd: 0
        },
        {
          fromStopId: 'd2-s2',
          toStopId: 'd2-s3',
          mode: 'walk',
          routeDescription: 'Stroll 6 minutes down to East Coast Road corner.',
          durationMinutes: 6,
          estimatedCostSgd: 0
        },
        {
          fromStopId: 'd2-s3',
          toStopId: 'd2-s4',
          mode: 'walk',
          routeDescription: 'Walk through the underground underpass beneath the ECP expressway straight to the seaside beach.',
          durationMinutes: 12,
          estimatedCostSgd: 0
        }
      ]
    },
    {
      theme: 'Botanical Canopies, Wessex Black-and-Whites & Sunset Ridge',
      district: 'Southern Ridges & Wessex Estate',
      summary: 'Walk through lush forest treetops, discover 1940s colonial artist estates, and take in sunset views over the Singapore Strait.',
      stops: [
        {
          id: 'd3-s1',
          title: 'Wessex Estate Colonial Black & White Enclave',
          category: 'hidden-gem',
          district: 'Portsdown Road',
          description: 'A secluded sanctuary of 1940s British army quarters set against undulating emerald lawns, home to printmakers, ceramists, and Colbar canteen.',
          locationName: 'Wessex Estate & Colbar',
          address: '9A Whitchurch Rd, Singapore 138839',
          lat: 1.2941,
          lng: 103.7925,
          mrtStation: 'One-North (CC23)',
          mrtLineCode: 'CC',
          timeSlot: '10:00 - 12:30',
          durationMinutes: 150,
          costSgd: 15,
          highlightTag: 'Hidden 1950s Time Capsule',
          localTip: 'Colbar (short for Colonial Bar) has served Hainanese pork chops and vintage British ales since 1953. Cash or PayNow preferred.',
          foodRecommendation: 'Colbar Hainanese Pork Chops with crinkle-cut fries and baked beans (S$14)'
        },
        {
          id: 'd3-s2',
          title: 'Haw Par Villa Mythological Park',
          category: 'hidden-gem',
          district: 'Pasir Panjang',
          description: 'A surreal 1937 theme park founded by the brothers who invented Tiger Balm, filled with over 1,000 whimsical and macabre Asian mythology dioramas.',
          locationName: 'Haw Par Villa',
          address: '262 Pasir Panjang Rd, Singapore 118628',
          lat: 1.2827,
          lng: 103.7828,
          mrtStation: 'Haw Par Villa (CC25)',
          mrtLineCode: 'CC',
          timeSlot: '13:30 - 15:30',
          durationMinutes: 120,
          costSgd: 0,
          highlightTag: 'Bizarre & Fascinating Culture',
          localTip: 'The outdoor grounds are completely free! Don\'t miss the famous Ten Courts of Hell exhibit (Hell\'s Museum admission has a small ticket).'
        },
        {
          id: 'd3-s3',
          title: 'Henderson Waves & Southern Ridges Canopy Walk',
          category: 'nature-green',
          district: 'Southern Ridges',
          description: 'Singapore\'s highest pedestrian bridge at 36 meters high, undulating like a giant sea wave made of Balau hardwood slats.',
          locationName: 'Henderson Waves',
          address: 'Henderson Rd, Singapore 159557',
          lat: 1.2770,
          lng: 103.8160,
          mrtStation: 'Telok Blangah (CC28)',
          mrtLineCode: 'CC',
          timeSlot: '16:45 - 18:45',
          durationMinutes: 120,
          costSgd: 0,
          highlightTag: 'Sunset Jungle Views',
          localTip: 'At 7:00pm daily, the bridge\'s wave ribs light up with warm LED illumination. Sit on the curved wooden recesses to catch dusk winds.',
          foodRecommendation: 'Bring cold hydration and sliced tropical fruit from Telok Blangah wet market'
        },
        {
          id: 'd3-s4',
          title: 'Old Airport Road Food Centre Dinner',
          category: 'food',
          district: 'Geylang / Mountbatten',
          description: 'Widely regarded by local culinary critics as Singapore\'s undisputed top hawker centre for sheer density of master-level stalls.',
          locationName: 'Old Airport Road Food Centre',
          address: '51 Old Airport Rd, Singapore 390051',
          lat: 1.3082,
          lng: 103.8858,
          mrtStation: 'Dakota (CC8)',
          mrtLineCode: 'CC',
          timeSlot: '19:30 - 21:00',
          durationMinutes: 90,
          costSgd: 10,
          highlightTag: 'Hawker Hall of Fame',
          localTip: 'Order Lao Fu Zi Fried Kway Teow (Michelin Bib Gourmand) or Nam Sing Hokkien Fried Mee with fresh sambal chili.',
          foodRecommendation: 'Fried Hokkien Prawn Noodles (S$6) + Soya Bean Curd dessert (S$2)'
        }
      ],
      transitLegs: [
        {
          fromStopId: 'd3-s1',
          toStopId: 'd3-s2',
          mode: 'mrt',
          routeDescription: 'Take Circle Line from one-north (CC23) 2 stops south to Haw Par Villa (CC25). Direct station exit.',
          durationMinutes: 12,
          estimatedCostSgd: 1.35,
          transitLine: 'Circle Line'
        },
        {
          fromStopId: 'd3-s2',
          toStopId: 'd3-s3',
          mode: 'mrt',
          routeDescription: 'Take Circle Line 3 stops east to Telok Blangah (CC28), walk 8 mins up Telok Blangah Hill path.',
          durationMinutes: 15,
          estimatedCostSgd: 1.45,
          transitLine: 'Circle Line'
        },
        {
          fromStopId: 'd3-s3',
          toStopId: 'd3-s4',
          mode: 'mrt',
          routeDescription: 'Descend to HarbourFront (CC29) and ride Circle Line directly to Dakota Station (CC8). Exit A.',
          durationMinutes: 22,
          estimatedCostSgd: 1.85,
          transitLine: 'Circle Line'
        }
      ]
    }
  ];

  for (let i = 0; i < daysCount; i++) {
    const template = districtPlans[i % districtPlans.length];
    days.push({
      dayNumber: i + 1,
      theme: `Day ${i + 1}: ${template.theme}`,
      districtFocus: template.district,
      summary: template.summary,
      totalEstimatedCostSgd: template.stops.reduce((sum, s) => sum + s.costSgd, 0) + 5,
      totalWalkingKm: 3.5 + (i * 0.4),
      stops: template.stops.map(s => ({ ...s, id: `d${i + 1}-${s.id}` })),
      transitLegs: template.transitLegs
    });
  }

  const projectedCost = days.reduce((acc, d) => acc + d.totalEstimatedCostSgd, 0);

  return {
    id: 'itinerary-' + Date.now(),
    title: `${daysCount}-Day Singapore ${pref.travelStyle === 'hawker-foodie' ? 'Hawker & Culinary' : pref.travelStyle === 'hidden-gems' ? 'Hidden Gems & Local Enclaves' : 'Explorer'} Route`,
    createdAt: new Date().toISOString(),
    preferences: {
      tripName: 'Singapore Journey',
      durationDays: daysCount,
      travelStyle: pref.travelStyle || 'hidden-gems',
      budgetTier: pref.budgetTier || 'moderate',
      dailyBudgetSgd: pref.dailyBudgetSgd || 90,
      pace: pref.pace || 'moderate',
      companion: pref.companion || 'solo',
      interests: pref.interests || [],
      dietaryRestrictions: pref.dietaryRestrictions || []
    },
    days,
    totalBudgetSgd: (pref.dailyBudgetSgd || 90) * daysCount,
    projectedCostSgd: projectedCost,
    collaborators: [
      { id: 'user-1', name: 'Trip Creator (You)', avatarColor: '#0284c7', role: 'owner' }
    ],
    shareCode: Math.random().toString(36).substring(2, 8).toUpperCase()
  };
}

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In dev: mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In prod: serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LionCity Route Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
