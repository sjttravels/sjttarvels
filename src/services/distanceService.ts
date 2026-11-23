// Comprehensive All-India & South India Geocoding, OSRM & Road Distance Engine
// Provides Google Maps / Ola / Uber precision for City, Airport and Outstation routes across India

export interface RouteInfo {
  distanceKm: number;
  distanceRange: string;
  durationSeconds: number;
  durationText: string;
  routeVia: string;
  isOutstation: boolean;
  detectedPickup?: string;
  detectedDest?: string;
}

export const KNOWN_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // --- BENGALURU AIRPORT & TRANSPORT HUBS ---
  'kempegowda international airport': { lat: 13.1986, lng: 77.7066 },
  'kempegowda airport': { lat: 13.1986, lng: 77.7066 },
  'blr airport': { lat: 13.1986, lng: 77.7066 },
  'airport': { lat: 13.1986, lng: 77.7066 },
  'terminal 1': { lat: 13.1986, lng: 77.7066 },
  'terminal 2': { lat: 13.2030, lng: 77.7120 },
  'ksr bengaluru': { lat: 12.9767, lng: 77.5713 },
  'ksr railway': { lat: 12.9767, lng: 77.5713 },
  'majestic': { lat: 12.9767, lng: 77.5713 },
  'kempegowda bus station': { lat: 12.9767, lng: 77.5713 },
  'yeshwanthpur': { lat: 13.0238, lng: 77.5489 },
  'yeshwanthpur junction': { lat: 13.0238, lng: 77.5489 },
  'cantonment': { lat: 12.9930, lng: 77.5980 },
  'smvb': { lat: 12.9961, lng: 77.6534 },
  'byappanahalli': { lat: 12.9961, lng: 77.6534 },
  'kr puram railway': { lat: 13.0075, lng: 77.6959 },
  'kr puram': { lat: 13.0075, lng: 77.6959 },
  'shantinagar': { lat: 12.9545, lng: 77.5934 },

  // --- BENGALURU CITY LOCALITIES & SUBURBS ---
  'uttarahalli': { lat: 12.9056, lng: 77.5458 },
  'uttarahalli hobli': { lat: 12.9056, lng: 77.5458 },
  'chikkalasandra': { lat: 12.9100, lng: 77.5480 },
  'padmanabhanagar': { lat: 12.9180, lng: 77.5577 },
  'banashankari': { lat: 12.9255, lng: 77.5468 },
  'jp nagar': { lat: 12.9063, lng: 77.5857 },
  'jayanagar': { lat: 12.9308, lng: 77.5838 },
  'basavanagudi': { lat: 12.9416, lng: 77.5755 },
  'indiranagar': { lat: 12.9784, lng: 77.6408 },
  '100 feet road': { lat: 12.9784, lng: 77.6408 },
  'koramangala': { lat: 12.9352, lng: 77.6245 },
  'hsr layout': { lat: 12.9121, lng: 77.6446 },
  'btm layout': { lat: 12.9166, lng: 77.6101 },
  'silk board': { lat: 12.9172, lng: 77.6228 },
  'electronic city': { lat: 12.8399, lng: 77.6770 },
  'electronic city phase 1': { lat: 12.8399, lng: 77.6770 },
  'electronic city phase 2': { lat: 12.8450, lng: 77.6890 },
  'whitefield': { lat: 12.9698, lng: 77.7499 },
  'itpl': { lat: 12.9860, lng: 77.7340 },
  'marathahalli': { lat: 12.9591, lng: 77.6974 },
  'bellandur': { lat: 12.9304, lng: 77.6784 },
  'sarjapur road': { lat: 12.9100, lng: 77.6800 },
  'sarjapur': { lat: 12.8601, lng: 77.7865 },
  'bannerghatta road': { lat: 12.8900, lng: 77.5950 },
  'bannerghatta': { lat: 12.8009, lng: 77.5777 },
  'kengeri': { lat: 12.9081, lng: 77.4862 },
  'rr nagar': { lat: 12.9274, lng: 77.5154 },
  'rajarajeshwari nagar': { lat: 12.9274, lng: 77.5154 },
  'vijayanagar': { lat: 12.9719, lng: 77.5306 },
  'nagarbhavi': { lat: 12.9610, lng: 77.5097 },
  'chandra layout': { lat: 12.9555, lng: 77.5273 },
  'chamarajpet': { lat: 12.9587, lng: 77.5670 },
  'rajajinagar': { lat: 12.9982, lng: 77.5530 },
  'malleshwaram': { lat: 13.0031, lng: 77.5643 },
  'peenya': { lat: 13.0285, lng: 77.5197 },
  'nagasandra': { lat: 13.0450, lng: 77.5020 },
  'hebbal': { lat: 13.0358, lng: 77.5970 },
  'yelahanka': { lat: 13.1007, lng: 77.5963 },
  'manyata tech park': { lat: 13.0480, lng: 77.6200 },
  'manyata': { lat: 13.0480, lng: 77.6200 },
  'rt nagar': { lat: 13.0247, lng: 77.5948 },
  'kalyan nagar': { lat: 13.0280, lng: 77.6392 },
  'kammanahalli': { lat: 13.0159, lng: 77.6378 },
  'frazer town': { lat: 12.9972, lng: 77.6133 },
  'mg road': { lat: 12.9756, lng: 77.6066 },
  'brigade road': { lat: 12.9720, lng: 77.6070 },
  'shivajinagar': { lat: 12.9863, lng: 77.6047 },
  'domlur': { lat: 12.9609, lng: 77.6387 },
  'cv raman nagar': { lat: 12.9855, lng: 77.6639 },
  'nelamangala': { lat: 13.0968, lng: 77.3910 },
  'hosakote': { lat: 13.0712, lng: 77.7981 },
  'kanakapura': { lat: 12.5463, lng: 77.4206 },
  'ramanagara': { lat: 12.7209, lng: 77.2799 },
  'channapatna': { lat: 12.6518, lng: 77.2089 },
  'nandi hills': { lat: 13.3702, lng: 77.6835 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },

  // --- KARNATAKA CITIES & OUTSTATION HUBS ---
  'mysore': { lat: 12.2958, lng: 76.6394 },
  'mysuru': { lat: 12.2958, lng: 76.6394 },
  'mysore palace': { lat: 12.3052, lng: 76.6552 },
  'chamundi hills': { lat: 12.2740, lng: 76.6710 },
  'srirangapatna': { lat: 12.4237, lng: 76.6830 },
  'mandya': { lat: 12.5242, lng: 76.8958 },
  'coorg': { lat: 12.4244, lng: 75.7382 },
  'madikeri': { lat: 12.4244, lng: 75.7382 },
  'kushalnagar': { lat: 12.4554, lng: 75.9609 },
  'chikmagalur': { lat: 13.3161, lng: 75.7720 },
  'chikkamagaluru': { lat: 13.3161, lng: 75.7720 },
  'mullayanagiri': { lat: 13.3917, lng: 75.7214 },
  'hassan': { lat: 13.0033, lng: 76.1004 },
  'sakleshpur': { lat: 12.9438, lng: 75.7869 },
  'belur': { lat: 13.1623, lng: 75.8576 },
  'halebeedu': { lat: 13.2163, lng: 75.9922 },
  'shravanabelagola': { lat: 12.8569, lng: 76.4862 },
  'hampi': { lat: 15.3350, lng: 76.4600 },
  'hospet': { lat: 15.2689, lng: 76.3909 },
  'hosapete': { lat: 15.2689, lng: 76.3909 },
  'shivamogga': { lat: 13.9299, lng: 75.5681 },
  'shimoga': { lat: 13.9299, lng: 75.5681 },
  'jog falls': { lat: 14.2285, lng: 74.8123 },
  'davanagere': { lat: 14.4644, lng: 75.9218 },
  'chitradurga': { lat: 14.2226, lng: 76.3980 },
  'tumakuru': { lat: 13.3409, lng: 77.1010 },
  'tumkur': { lat: 13.3409, lng: 77.1010 },
  'kolar': { lat: 13.1367, lng: 78.1291 },
  'chikkaballapur': { lat: 13.4355, lng: 77.7275 },
  'bandipur': { lat: 11.6664, lng: 76.6291 },
  'kabini': { lat: 11.9261, lng: 76.2711 },
  'mangaluru': { lat: 12.9141, lng: 74.8560 },
  'mangalore': { lat: 12.9141, lng: 74.8560 },
  'udupi': { lat: 13.3409, lng: 74.7421 },
  'malpe': { lat: 13.3500, lng: 74.7000 },
  'dharmasthala': { lat: 12.9564, lng: 75.3789 },
  'subramanya': { lat: 12.6644, lng: 75.6186 },
  'kukke': { lat: 12.6644, lng: 75.6186 },
  'gokarna': { lat: 14.5479, lng: 74.3188 },
  'murudeshwar': { lat: 14.0940, lng: 74.4899 },
  'hubballi': { lat: 15.3647, lng: 75.1240 },
  'hubli': { lat: 15.3647, lng: 75.1240 },
  'belagavi': { lat: 15.8497, lng: 74.4977 },
  'belgaum': { lat: 15.8497, lng: 74.4977 },
  'badami': { lat: 15.9189, lng: 75.6766 },
  'pattadakal': { lat: 15.9493, lng: 75.8160 },
  'aihole': { lat: 16.0203, lng: 75.8820 },
  'bijapur': { lat: 16.8302, lng: 75.7100 },
  'vijayapura': { lat: 16.8302, lng: 75.7100 },
  'bidar': { lat: 17.9104, lng: 77.5199 },
  'kalaburagi': { lat: 17.3297, lng: 76.8343 },
  'gulbarga': { lat: 17.3297, lng: 76.8343 },
  'raichur': { lat: 16.2120, lng: 77.3439 },
  'karwar': { lat: 14.8136, lng: 74.1298 },
  'sirsi': { lat: 14.6195, lng: 74.8354 },
  'dandeli': { lat: 15.2361, lng: 74.6173 },
  'sringeri': { lat: 13.4189, lng: 75.2560 },
  'horanadu': { lat: 13.2725, lng: 75.3422 },

  // --- TAMIL NADU OUTSTATION HUBS & PILGRIMAGE ---
  'rameshwaram': { lat: 9.2876, lng: 79.3129 },
  'rameswaram': { lat: 9.2876, lng: 79.3129 },
  'ramanathapuram': { lat: 9.3639, lng: 78.8395 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'kanyakumari': { lat: 8.0883, lng: 77.5385 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'salem': { lat: 11.6643, lng: 78.1460 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'trichy': { lat: 10.7905, lng: 78.7047 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'thanjavur': { lat: 10.7870, lng: 79.1378 },
  'tanjore': { lat: 10.7870, lng: 79.1378 },
  'kumbakonam': { lat: 10.9602, lng: 79.3845 },
  'velankanni': { lat: 10.6800, lng: 79.8400 },
  'kodaikanal': { lat: 10.2381, lng: 77.4892 },
  'palani': { lat: 10.4500, lng: 77.5200 },
  'tiruvannamalai': { lat: 12.2253, lng: 79.0747 },
  'vellore': { lat: 12.9165, lng: 79.1325 },
  'hosur': { lat: 12.7409, lng: 77.8253 },
  'krishnagiri': { lat: 12.5186, lng: 78.2137 },
  'dharmapuri': { lat: 12.1211, lng: 78.1582 },
  'erode': { lat: 11.3410, lng: 77.7172 },
  'tirupur': { lat: 11.1085, lng: 77.3411 },
  'dindigul': { lat: 10.3673, lng: 77.9803 },
  'karur': { lat: 10.9601, lng: 78.0766 },
  'namakkal': { lat: 11.2189, lng: 78.1674 },
  'yelagiri': { lat: 12.5794, lng: 78.6389 },
  'courtallam': { lat: 8.9300, lng: 77.2700 },
  'tenkasi': { lat: 8.9594, lng: 77.3150 },
  'thoothukudi': { lat: 8.7642, lng: 78.1348 },
  'tuticorin': { lat: 8.7642, lng: 78.1348 },
  'chidambaram': { lat: 11.3992, lng: 79.6934 },
  'nagapattinam': { lat: 10.7672, lng: 79.8449 },
  'cuddalore': { lat: 11.7480, lng: 79.7714 },
  'villupuram': { lat: 11.9401, lng: 79.4861 },
  'theni': { lat: 10.0104, lng: 77.4768 },
  'kanchipuram': { lat: 12.8342, lng: 79.7036 },
  'mahabalipuram': { lat: 12.6269, lng: 80.1927 },
  'mamallapuram': { lat: 12.6269, lng: 80.1927 },
  'ooty': { lat: 11.4102, lng: 76.6950 },
  'coonoor': { lat: 11.3530, lng: 76.7959 },
  'kotagiri': { lat: 11.4200, lng: 76.8800 },
  'pondicherry': { lat: 11.9416, lng: 79.8083 },
  'puducherry': { lat: 11.9416, lng: 79.8083 },

  // --- KERALA OUTSTATION HUBS ---
  'munnar': { lat: 10.0889, lng: 77.0595 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'cochin': { lat: 9.9312, lng: 76.2673 },
  'ernakulam': { lat: 9.9816, lng: 76.2999 },
  'alleppey': { lat: 9.4981, lng: 76.3388 },
  'alappuzha': { lat: 9.4981, lng: 76.3388 },
  'wayanad': { lat: 11.6854, lng: 76.1320 },
  'sulthan bathery': { lat: 11.6622, lng: 76.2570 },
  'kalpetta': { lat: 11.6050, lng: 76.0830 },
  'kozhikode': { lat: 11.2588, lng: 75.7804 },
  'calicut': { lat: 11.2588, lng: 75.7804 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'trivandrum': { lat: 8.5241, lng: 76.9366 },
  'thekkady': { lat: 9.6031, lng: 77.1615 },
  'kumily': { lat: 9.6031, lng: 77.1615 },
  'varkala': { lat: 8.7379, lng: 76.7163 },
  'kovalam': { lat: 8.4004, lng: 76.9787 },
  'kumarakom': { lat: 9.6175, lng: 76.4301 },
  'thrissur': { lat: 10.5276, lng: 76.2144 },
  'trichur': { lat: 10.5276, lng: 76.2144 },
  'palakkad': { lat: 10.7867, lng: 76.6548 },
  'kannur': { lat: 11.8745, lng: 75.3704 },
  'kasaragod': { lat: 12.4996, lng: 74.9869 },
  'bekal': { lat: 12.3926, lng: 75.0328 },
  'kollam': { lat: 8.8932, lng: 76.6141 },
  'guruvayur': { lat: 10.5946, lng: 76.0417 },
  'sabarimala': { lat: 9.4402, lng: 77.0818 },
  'athirappilly': { lat: 10.3150, lng: 76.5400 },
  'vagamon': { lat: 9.6894, lng: 76.9056 },
  'kottayam': { lat: 9.5916, lng: 76.5222 },

  // --- ANDHRA PRADESH & TELANGANA ---
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'secunderabad': { lat: 17.4399, lng: 78.4983 },
  'tirupati': { lat: 13.6288, lng: 79.4192 },
  'tirumala': { lat: 13.6833, lng: 79.3500 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'vizag': { lat: 17.6868, lng: 83.2185 },
  'kurnool': { lat: 15.8281, lng: 78.0373 },
  'anantapur': { lat: 14.6819, lng: 77.6006 },
  'chittoor': { lat: 13.2172, lng: 79.1003 },
  'kadapa': { lat: 14.4673, lng: 78.8242 },
  'cuddapah': { lat: 14.4673, lng: 78.8242 },
  'nellore': { lat: 14.4426, lng: 79.9865 },
  'guntur': { lat: 16.3067, lng: 80.4365 },
  'rajahmundry': { lat: 17.0005, lng: 81.8040 },
  'warangal': { lat: 17.9689, lng: 79.5941 },
  'srisailam': { lat: 16.0737, lng: 78.8686 },
  'lepakshi': { lat: 13.8039, lng: 77.6062 },
  'puttaparthi': { lat: 14.1680, lng: 77.8100 },
  'mantralayam': { lat: 15.9385, lng: 77.4277 },
  'ahobilam': { lat: 15.1378, lng: 78.7289 },
  'kanipakam': { lat: 13.2500, lng: 79.0300 },
  'kalahasti': { lat: 13.7500, lng: 79.7000 },
  'srikalahasti': { lat: 13.7500, lng: 79.7000 },
  'amaravati': { lat: 16.5735, lng: 80.3575 },
  'hindupur': { lat: 13.8290, lng: 77.4930 },

  // --- GOA & MAHARASHTRA ---
  'goa': { lat: 15.4909, lng: 73.8278 },
  'panaji': { lat: 15.4909, lng: 73.8278 },
  'panjim': { lat: 15.4909, lng: 73.8278 },
  'calangute': { lat: 15.5439, lng: 73.7553 },
  'baga': { lat: 15.5553, lng: 73.7517 },
  'candolim': { lat: 15.5178, lng: 73.7667 },
  'anjuna': { lat: 15.5733, lng: 73.7410 },
  'vagator': { lat: 15.5997, lng: 73.7439 },
  'morjim': { lat: 15.6277, lng: 73.7375 },
  'margao': { lat: 15.2832, lng: 73.9862 },
  'madgaon': { lat: 15.2832, lng: 73.9862 },
  'colva': { lat: 15.2786, lng: 73.9142 },
  'benaulim': { lat: 15.2575, lng: 73.9214 },
  'palolem': { lat: 15.0100, lng: 74.0232 },
  'vasco da gama': { lat: 15.3982, lng: 73.8113 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'shirdi': { lat: 19.7645, lng: 74.4762 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'kolhapur': { lat: 16.7050, lng: 74.2433 },
  'solapur': { lat: 17.6599, lng: 75.9064 },
  'mahabaleshwar': { lat: 17.9307, lng: 73.6477 },
  'lonavala': { lat: 18.7557, lng: 73.4091 },
  'khandala': { lat: 18.7610, lng: 73.3760 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'sambhajinagar': { lat: 19.8762, lng: 75.3433 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'alibaug': { lat: 18.6414, lng: 72.8722 },
  'satara': { lat: 17.6805, lng: 73.9930 },

  // --- PAN-INDIA HUBS ---
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'ayodhya': { lat: 26.7922, lng: 82.1998 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'puri': { lat: 19.8135, lng: 85.8312 }
};

// Verified Ground Distances & Durations for Primary Routes
export const VERIFIED_HIGHWAY_PAIRS: Record<string, { km: number; durationText: string; via: string }> = {
  // Mysore / Mysuru Corridor (Expressway NH 275)
  'uttarahalli_mysore': { km: 145, durationText: '~2 hr 35 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'uttarahalli_mysuru': { km: 145, durationText: '~2 hr 35 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'bangalore_mysore': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'bangalore_mysuru': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'bengaluru_mysore': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'bengaluru_mysuru': { km: 145, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },
  'majestic_mysore': { km: 142, durationText: '~2 hr 30 mins', via: 'via Bengaluru-Mysuru Expressway (NH 275)' },

  // Bangalore Local Cross-Town
  'uttarahalli_indiranagar': { km: 18, durationText: '~1 hr 5 mins', via: 'via City Arterial Roads' },
  'uttarahalli_whitefield': { km: 28, durationText: '~1 hr 10 mins', via: 'via Outer Ring Rd' },
  'uttarahalli_electronic city': { km: 22, durationText: '~45 mins', via: 'via NICE Ring Rd / Hosur Rd' },
  'uttarahalli_airport': { km: 48, durationText: '~1 hr 15 mins', via: 'via Airport Elevated Expressway' },
  'uttarahalli_kempegowda airport': { km: 48, durationText: '~1 hr 15 mins', via: 'via Airport Elevated Expressway' },
  'uttarahalli_kempegowda international airport': { km: 48, durationText: '~1 hr 15 mins', via: 'via Airport Elevated Expressway' },
  'uttarahalli_blr airport': { km: 48, durationText: '~1 hr 15 mins', via: 'via Airport Elevated Expressway' },
  'uttarahalli_majestic': { km: 13, durationText: '~35 mins', via: 'via Mysore Road & KR Market' },
  'uttarahalli_koramangala': { km: 14, durationText: '~40 mins', via: 'via Inner Ring Rd' },
  'uttarahalli_jayanagar': { km: 9, durationText: '~25 mins', via: 'via Kanakapura Road' },
  'uttarahalli_jp nagar': { km: 6, durationText: '~20 mins', via: 'via 24th Main' },
  'uttarahalli_banashankari': { km: 5, durationText: '~15 mins', via: 'via Outer Ring Rd' },
  'uttarahalli_hebbal': { km: 24, durationText: '~1 hr', via: 'via Outer Ring Rd' },
  'uttarahalli_yelahanka': { km: 32, durationText: '~1 hr 15 mins', via: 'via Outer Ring Rd & Bellary Rd' },

  'whitefield_yelahanka': { km: 28, durationText: '~1 hr 5 mins', via: 'via SH 104 / Budigere & Bagalur' },
  'whitefield_indiranagar': { km: 16, durationText: '~45 mins', via: 'via Old Airport Road' },
  'whitefield_koramangala': { km: 18, durationText: '~50 mins', via: 'via Marathahalli & Sarjapur Rd' },
  'whitefield_electronic city': { km: 26, durationText: '~55 mins', via: 'via Sarjapur Rd & Hosur Rd' },
  'whitefield_hebbal': { km: 24, durationText: '~55 mins', via: 'via Outer Ring Rd & Nagavara' },
  'whitefield_majestic': { km: 22, durationText: '~1 hr', via: 'via Old Madras Rd' },
  'whitefield_banashankari': { km: 26, durationText: '~1 hr 5 mins', via: 'via Outer Ring Rd' },

  'indiranagar_koramangala': { km: 7, durationText: '~20 mins', via: 'via Inner Ring Rd' },
  'indiranagar_hebbal': { km: 13, durationText: '~35 mins', via: 'via Old Madras Rd & Outer Ring Rd' },
  'indiranagar_electronic city': { km: 20, durationText: '~45 mins', via: 'via Hosur Road Elevated Expressway' },
  'indiranagar_majestic': { km: 9, durationText: '~25 mins', via: 'via MG Road & Cubbon Park' },
  'indiranagar_yelahanka': { km: 21, durationText: '~50 mins', via: 'via Bellary Road NH 44' },

  'koramangala_electronic city': { km: 15, durationText: '~30 mins', via: 'via Hosur Road Elevated Expressway' },
  'koramangala_hebbal': { km: 17, durationText: '~45 mins', via: 'via Outer Ring Rd' },
  'koramangala_majestic': { km: 10, durationText: '~30 mins', via: 'via Hosur Road & Richmond Circle' },
  'koramangala_yelahanka': { km: 24, durationText: '~55 mins', via: 'via Bellary Road' },

  'hebbal_electronic city': { km: 32, durationText: '~1 hr 10 mins', via: 'via Outer Ring Rd & Hosur Rd' },
  'hebbal_yelahanka': { km: 12, durationText: '~25 mins', via: 'via Bellary Road NH 44' },
  'hebbal_majestic': { km: 11, durationText: '~30 mins', via: 'via Bellary Road' },

  'banashankari_indiranagar': { km: 14, durationText: '~40 mins', via: 'via Marenahalli Rd & Inner Ring Rd' },
  'banashankari_whitefield': { km: 26, durationText: '~1 hr 5 mins', via: 'via Outer Ring Rd' },
  'banashankari_electronic city': { km: 19, durationText: '~40 mins', via: 'via NICE Road / Bannerghatta Rd' },
  'banashankari_yelahanka': { km: 28, durationText: '~1 hr', via: 'via Outer Ring Rd & Bellary Rd' },

  'kengeri_hebbal': { km: 25, durationText: '~55 mins', via: 'via Outer Ring Rd' },
  'kengeri_whitefield': { km: 34, durationText: '~1 hr 20 mins', via: 'via Mysore Road & ORR' },
  'kengeri_electronic city': { km: 24, durationText: '~45 mins', via: 'via NICE Ring Road' },
  'kengeri_indiranagar': { km: 21, durationText: '~55 mins', via: 'via Mysore Road' },
  'kengeri_yelahanka': { km: 31, durationText: '~1 hr 10 mins', via: 'via Outer Ring Rd' },

  'jp nagar_yelahanka': { km: 27, durationText: '~1 hr', via: 'via Bellary Road' },
  'jayanagar_yelahanka': { km: 24, durationText: '~55 mins', via: 'via Bellary Road' },
  'majestic_yelahanka': { km: 16, durationText: '~40 mins', via: 'via Bellary Road' },

  // Airport Transfers
  'bangalore_airport': { km: 38, durationText: '~55 mins', via: 'via Bellary Road / Airport Expressway' },
  'bengaluru_airport': { km: 38, durationText: '~55 mins', via: 'via Bellary Road / Airport Expressway' },
  'indiranagar_airport': { km: 38, durationText: '~55 mins', via: 'via Airport Expressway' },
  'koramangala_airport': { km: 40, durationText: '~1 hr', via: 'via Airport Expressway' },
  'whitefield_airport': { km: 42, durationText: '~1 hr 5 mins', via: 'via SH 104 Airport Corridor' },
  'electronic city_airport': { km: 54, durationText: '~1 hr 20 mins', via: 'via Elevated Tollway & Airport Expressway' },
  'majestic_airport': { km: 33, durationText: '~50 mins', via: 'via Bellary Road' },

  // --- TAMIL NADU PRIMARY CORRIDORS (VERIFIED) ---
  'bengaluru_rameshwaram': { km: 600, durationText: '~10 hr 45 mins', via: 'via NH 44 (Salem - Madurai) & NH 87 (Pamban Bridge)' },
  'bangalore_rameshwaram': { km: 600, durationText: '~10 hr 45 mins', via: 'via NH 44 (Salem - Madurai) & NH 87 (Pamban Bridge)' },
  'uttarahalli_rameshwaram': { km: 605, durationText: '~10 hr 50 mins', via: 'via NH 44 (Salem - Madurai) & NH 87 (Pamban Bridge)' },
  'bengaluru_rameswaram': { km: 600, durationText: '~10 hr 45 mins', via: 'via NH 44 (Salem - Madurai) & NH 87 (Pamban Bridge)' },
  'bangalore_rameswaram': { km: 600, durationText: '~10 hr 45 mins', via: 'via NH 44 (Salem - Madurai) & NH 87 (Pamban Bridge)' },
  'uttarahalli_rameswaram': { km: 605, durationText: '~10 hr 50 mins', via: 'via NH 44 (Salem - Madurai) & NH 87 (Pamban Bridge)' },
  'bengaluru_madurai': { km: 435, durationText: '~7 hr 15 mins', via: 'via NH 44 (Hosur - Salem - Dindigul)' },
  'bangalore_madurai': { km: 435, durationText: '~7 hr 15 mins', via: 'via NH 44 (Hosur - Salem - Dindigul)' },
  'bengaluru_kanyakumari': { km: 665, durationText: '~11 hrs', via: 'via NH 44 South Corridor' },
  'bangalore_kanyakumari': { km: 665, durationText: '~11 hrs', via: 'via NH 44 South Corridor' },
  'bengaluru_chennai': { km: 345, durationText: '~6 hr 30 mins', via: 'via NH 48 (Hosur - Krishnagiri - Vellore)' },
  'bangalore_chennai': { km: 345, durationText: '~6 hr 30 mins', via: 'via NH 48 (Hosur - Krishnagiri - Vellore)' },
  'bengaluru_salem': { km: 205, durationText: '~3 hr 30 mins', via: 'via NH 44' },
  'bangalore_salem': { km: 205, durationText: '~3 hr 30 mins', via: 'via NH 44' },
  'bengaluru_coimbatore': { km: 365, durationText: '~6 hrs', via: 'via NH 44 & NH 544' },
  'bangalore_coimbatore': { km: 365, durationText: '~6 hrs', via: 'via NH 44 & NH 544' },
  'bengaluru_trichy': { km: 340, durationText: '~5 hr 45 mins', via: 'via NH 44 & NH 81' },
  'bangalore_trichy': { km: 340, durationText: '~5 hr 45 mins', via: 'via NH 44 & NH 81' },
  'bengaluru_tirunelveli': { km: 580, durationText: '~9 hrs', via: 'via NH 44' },
  'bangalore_tirunelveli': { km: 580, durationText: '~9 hrs', via: 'via NH 44' },
  'bengaluru_thanjavur': { km: 395, durationText: '~6 hr 30 mins', via: 'via NH 44 & NH 81' },
  'bangalore_thanjavur': { km: 395, durationText: '~6 hr 30 mins', via: 'via NH 44 & NH 81' },
  'bengaluru_kumbakonam': { km: 390, durationText: '~6 hr 30 mins', via: 'via NH 44 & NH 81' },
  'bangalore_kumbakonam': { km: 390, durationText: '~6 hr 30 mins', via: 'via NH 44 & NH 81' },
  'bengaluru_velankanni': { km: 480, durationText: '~8 hr 30 mins', via: 'via NH 44 & NH 83' },
  'bangalore_velankanni': { km: 480, durationText: '~8 hr 30 mins', via: 'via NH 44 & NH 83' },
  'bengaluru_kodaikanal': { km: 465, durationText: '~8 hrs', via: 'via NH 44 & Dindigul Ghat' },
  'bangalore_kodaikanal': { km: 465, durationText: '~8 hrs', via: 'via NH 44 & Dindigul Ghat' },
  'bengaluru_tiruvannamalai': { km: 200, durationText: '~3 hr 45 mins', via: 'via Krishnagiri & Chengam' },
  'bangalore_tiruvannamalai': { km: 200, durationText: '~3 hr 45 mins', via: 'via Krishnagiri & Chengam' },
  'bengaluru_vellore': { km: 215, durationText: '~3 hr 45 mins', via: 'via NH 48' },
  'bangalore_vellore': { km: 215, durationText: '~3 hr 45 mins', via: 'via NH 48' },
  'bengaluru_hosur': { km: 40, durationText: '~1 hr', via: 'via Hosur Road NH 44' },
  'bengaluru_krishnagiri': { km: 90, durationText: '~1 hr 45 mins', via: 'via NH 44' },
  'bengaluru_dharmapuri': { km: 140, durationText: '~2 hr 30 mins', via: 'via NH 44' },
  'bengaluru_erode': { km: 265, durationText: '~4 hr 30 mins', via: 'via NH 44 & NH 544' },
  'bengaluru_tirupur': { km: 315, durationText: '~5 hrs', via: 'via NH 44 & NH 544' },
  'bengaluru_pondicherry': { km: 310, durationText: '~6 hr 30 mins', via: 'via Krishnagiri' },
  'bangalore_pondicherry': { km: 310, durationText: '~6 hr 30 mins', via: 'via Krishnagiri' },
  'bengaluru_ooty': { km: 275, durationText: '~6 hrs', via: 'via Mysore & Bandipur Forest Corridor' },
  'bangalore_ooty': { km: 275, durationText: '~6 hrs', via: 'via Mysore & Bandipur Forest Corridor' },

  // --- KERALA PRIMARY CORRIDORS (VERIFIED) ---
  'bengaluru_munnar': { km: 475, durationText: '~9 hr 30 mins', via: 'via Salem - Udumalpet Ghat' },
  'bangalore_munnar': { km: 475, durationText: '~9 hr 30 mins', via: 'via Salem - Udumalpet Ghat' },
  'bengaluru_kochi': { km: 535, durationText: '~9 hrs', via: 'via NH 44 & NH 544' },
  'bangalore_kochi': { km: 535, durationText: '~9 hrs', via: 'via NH 44 & NH 544' },
  'bengaluru_alleppey': { km: 580, durationText: '~10 hrs', via: 'via NH 544 & NH 66' },
  'bangalore_alleppey': { km: 580, durationText: '~10 hrs', via: 'via NH 544 & NH 66' },
  'bengaluru_wayanad': { km: 280, durationText: '~6 hrs', via: 'via Mysore / Gundlupet NH 766' },
  'bangalore_wayanad': { km: 280, durationText: '~6 hrs', via: 'via Mysore / Gundlupet NH 766' },
  'bengaluru_calicut': { km: 355, durationText: '~7 hr 30 mins', via: 'via Mysore & Thamarassery Ghat' },
  'bengaluru_kozhikode': { km: 355, durationText: '~7 hr 30 mins', via: 'via Mysore & Thamarassery Ghat' },
  'bengaluru_trivandrum': { km: 680, durationText: '~11 hr 30 mins', via: 'via NH 44 (Nagercoil / Tirunelveli)' },
  'bangalore_trivandrum': { km: 680, durationText: '~11 hr 30 mins', via: 'via NH 44 (Nagercoil / Tirunelveli)' },

  // --- ANDHRA PRADESH & TELANGANA CORRIDORS ---
  'bengaluru_hyderabad': { km: 570, durationText: '~8 hrs', via: 'via NH 44 North Expressway' },
  'bangalore_hyderabad': { km: 570, durationText: '~8 hrs', via: 'via NH 44 North Expressway' },
  'bengaluru_tirupati': { km: 250, durationText: '~5 hrs', via: 'via NH 71 / Kolar Highway' },
  'bangalore_tirupati': { km: 250, durationText: '~5 hrs', via: 'via NH 71 / Kolar Highway' },
  'bengaluru_vijayawada': { km: 650, durationText: '~10 hrs', via: 'via NH 44 & NH 16' },
  'bengaluru_kurnool': { km: 360, durationText: '~5 hr 30 mins', via: 'via NH 44' },
  'bengaluru_anantapur': { km: 215, durationText: '~3 hr 30 mins', via: 'via NH 44' },

  // --- GOA & MAHARASHTRA CORRIDORS ---
  'bengaluru_goa': { km: 560, durationText: '~10 hrs', via: 'via Hubballi / Karwar / NH 48' },
  'bangalore_goa': { km: 560, durationText: '~10 hrs', via: 'via Hubballi / Karwar / NH 48' },
  'bengaluru_mumbai': { km: 985, durationText: '~15 hrs', via: 'via NH 48 (Pune - Mumbai Expressway)' },
  'bangalore_mumbai': { km: 985, durationText: '~15 hrs', via: 'via NH 48 (Pune - Mumbai Expressway)' },
  'bengaluru_pune': { km: 840, durationText: '~13 hrs', via: 'via NH 48' },
  'bangalore_pune': { km: 840, durationText: '~13 hrs', via: 'via NH 48' },
  'bengaluru_shirdi': { km: 1020, durationText: '~16 hrs', via: 'via Pune & Ahmednagar' },
  'bangalore_shirdi': { km: 1020, durationText: '~16 hrs', via: 'via Pune & Ahmednagar' },

  // --- OTHER MAJOR KARNATAKA OUTSTATIONS ---
  'bengaluru_coorg': { km: 250, durationText: '~5 hr 30 mins', via: 'via Mysore Expressway & Kushalnagar' },
  'bangalore_coorg': { km: 250, durationText: '~5 hr 30 mins', via: 'via Mysore Expressway & Kushalnagar' },
  'bengaluru_chikmagalur': { km: 245, durationText: '~4 hr 45 mins', via: 'via NH 75 Hassan Highway' },
  'bangalore_chikmagalur': { km: 245, durationText: '~4 hr 45 mins', via: 'via NH 75 Hassan Highway' },
  'bengaluru_hampi': { km: 340, durationText: '~6 hr 30 mins', via: 'via NH 48 / NH 50' },
  'bangalore_hampi': { km: 340, durationText: '~6 hr 30 mins', via: 'via NH 48 / NH 50' },
  'bengaluru_hassan': { km: 185, durationText: '~3 hr 30 mins', via: 'via NH 75' },
  'bengaluru_sakleshpur': { km: 220, durationText: '~4 hr 15 mins', via: 'via NH 75' },
  'bengaluru_mangalore': { km: 350, durationText: '~7 hrs', via: 'via Shiradi Ghat NH 75' },
  'bengaluru_udupi': { km: 400, durationText: '~8 hrs', via: 'via NH 75' }
};

const GENERIC_CITY_KEYS = new Set(['bangalore', 'bengaluru', 'karnataka', 'city', 'india', 'state']);

export function extractLocationKey(text: string): string | null {
  const clean = String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const allKeys = Object.keys(KNOWN_COORDINATES);
  // Pass 1: Match specific localities, landmarks, tech parks and towns first
  const specificKeys = allKeys.filter(k => !GENERIC_CITY_KEYS.has(k)).sort((a, b) => b.length - a.length);
  for (const key of specificKeys) {
    if (clean.includes(key)) return key;
  }
  // Pass 2: Fall back to generic city names only if no specific locality is present
  for (const key of GENERIC_CITY_KEYS) {
    if (KNOWN_COORDINATES[key] && clean.includes(key)) return key;
  }
  return null;
}

export function calculateHaversineRoadKm(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
  const R = 6371; // Earth radius in km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const airKm = R * c;

  // Road factor based on distance class (higher tortuosity for inter-state & ghat roads)
  const factor = airKm < 25 ? 1.38 : (airKm < 150 ? 1.25 : (airKm < 500 ? 1.30 : 1.33));
  return Math.round(airKm * factor);
}

// Synchronous high-accuracy calculation matching Ola/Uber
export function calculateRouteSync(pickup: string, destination: string, tripType: string): RouteInfo {
  const normTripType = String(tripType || '').toUpperCase();
  const k1 = extractLocationKey(pickup);
  const k2 = extractLocationKey(destination);

  // 1. Direct verified highway distance lookup
  if (k1 && k2) {
    const pair1 = `${k1}_${k2}`;
    const pair2 = `${k2}_${k1}`;
    const hit = VERIFIED_HIGHWAY_PAIRS[pair1] || VERIFIED_HIGHWAY_PAIRS[pair2];
    if (hit) {
      const isOutstation = hit.km > 45 || normTripType === 'OUTSTATION' || normTripType === 'ROUND_TRIP';
      const minRange = Math.max(1, Math.round(hit.km * 0.94));
      const maxRange = Math.round(hit.km * 1.16);
      return {
        distanceKm: hit.km,
        distanceRange: isOutstation ? `${hit.km} km` : `${minRange} km to ${maxRange} km`,
        durationSeconds: parseDurationToSeconds(hit.durationText),
        durationText: hit.durationText,
        routeVia: hit.via,
        isOutstation,
        detectedPickup: k1,
        detectedDest: k2
      };
    }

    // 2. Haversine Road Calculation from Coordinates
    const c1 = KNOWN_COORDINATES[k1];
    const c2 = KNOWN_COORDINATES[k2];
    if (c1 && c2) {
      const roadKm = Math.max(5, calculateHaversineRoadKm(c1, c2));
      const isOutstation = roadKm > 45 || normTripType === 'OUTSTATION' || normTripType === 'ROUND_TRIP';
      const avgSpeedKmh = isOutstation ? (roadKm > 300 ? 60 : 55) : 20;
      const durSecs = Math.round((roadKm / avgSpeedKmh) * 3600);
      const durMins = Math.round(durSecs / 60);
      const durationText = durMins >= 60 
        ? `~${Math.floor(durMins / 60)} hr ${durMins % 60 ? (durMins % 60) + ' mins' : ''}`.trim()
        : `~${durMins} mins`;
      const routeVia = isOutstation 
        ? (roadKm >= 500 
            ? 'via National Highway Express Corridor (NH 44 / NH 48)' 
            : (k1.includes('mysor') || k2.includes('mysor') 
                ? 'via Bengaluru-Mysuru Expressway (NH 275)' 
                : 'via National & State Highway Corridors'))
        : (roadKm >= 15 ? 'via Outer Ring Rd & City Corridors' : 'via City Arterial Roads');

      const minRange = Math.max(1, Math.round(roadKm * 0.94));
      const maxRange = Math.round(roadKm * 1.16);

      return {
        distanceKm: roadKm,
        distanceRange: isOutstation ? `${roadKm} km` : `${minRange} km to ${maxRange} km`,
        durationSeconds: durSecs,
        durationText,
        routeVia,
        isOutstation,
        detectedPickup: k1,
        detectedDest: k2
      };
    }
  }

  // 3. Fallbacks by trip type & keyword heuristics (State-Aware)
  const pLower = String(pickup || '').toLowerCase();
  const dLower = String(destination || '').toLowerCase();

  let fallbackKm = 18;
  let fallbackVia = 'via City Arterial Roads';
  let fallbackDur = '~1 hr 5 mins';
  let fallbackSecs = 3900;
  let isOutstation = false;

  // Specific high-volume outstation destinations
  if (pLower.includes('rameshwar') || dLower.includes('rameshwar') || pLower.includes('rameswar') || dLower.includes('rameswar') || pLower.includes('ramanathapuram') || dLower.includes('ramanathapuram')) {
    fallbackKm = 600;
    fallbackVia = 'via NH 44 (Salem - Madurai) & NH 87 (Pamban Bridge)';
    fallbackDur = '~10 hr 45 mins';
    fallbackSecs = 38700;
    isOutstation = true;
  } else if (pLower.includes('kanyakumari') || dLower.includes('kanyakumari')) {
    fallbackKm = 665;
    fallbackVia = 'via NH 44 South Corridor';
    fallbackDur = '~11 hrs';
    fallbackSecs = 39600;
    isOutstation = true;
  } else if (pLower.includes('madurai') || dLower.includes('madurai')) {
    fallbackKm = 435;
    fallbackVia = 'via NH 44 (Hosur - Salem - Dindigul)';
    fallbackDur = '~7 hr 15 mins';
    fallbackSecs = 26100;
    isOutstation = true;
  } else if (pLower.includes('mysor') || dLower.includes('mysor')) {
    fallbackKm = 145;
    fallbackVia = 'via Bengaluru-Mysuru Expressway (NH 275)';
    fallbackDur = '~2 hr 35 mins';
    fallbackSecs = 9300;
    isOutstation = true;
  } else if (pLower.includes('coorg') || dLower.includes('coorg') || pLower.includes('madikeri') || dLower.includes('madikeri')) {
    fallbackKm = 250;
    fallbackVia = 'via Mysore Expressway & Kushalnagar';
    fallbackDur = '~5 hr 30 mins';
    fallbackSecs = 19800;
    isOutstation = true;
  } else if (pLower.includes('ooty') || dLower.includes('ooty')) {
    fallbackKm = 275;
    fallbackVia = 'via Mysore & Bandipur Forest Corridor';
    fallbackDur = '~6 hrs';
    fallbackSecs = 21600;
    isOutstation = true;
  } else if (pLower.includes('chikmagalur') || dLower.includes('chikmagalur')) {
    fallbackKm = 245;
    fallbackVia = 'via NH 75 Hassan Highway';
    fallbackDur = '~4 hr 45 mins';
    fallbackSecs = 17100;
    isOutstation = true;
  } else if (pLower.includes('tirupati') || dLower.includes('tirupati')) {
    fallbackKm = 250;
    fallbackVia = 'via NH 71 / Kolar Highway';
    fallbackDur = '~5 hrs';
    fallbackSecs = 18000;
    isOutstation = true;
  } else if (pLower.includes('munnar') || dLower.includes('munnar')) {
    fallbackKm = 475;
    fallbackVia = 'via Salem & Udumalpet Ghat';
    fallbackDur = '~9 hr 30 mins';
    fallbackSecs = 34200;
    isOutstation = true;
  } else if (pLower.includes('kochi') || dLower.includes('kochi') || pLower.includes('cochin') || dLower.includes('cochin')) {
    fallbackKm = 535;
    fallbackVia = 'via NH 44 & NH 544';
    fallbackDur = '~9 hrs';
    fallbackSecs = 32400;
    isOutstation = true;
  } else if (pLower.includes('goa') || dLower.includes('goa')) {
    fallbackKm = 560;
    fallbackVia = 'via Hubballi / Karwar / NH 48';
    fallbackDur = '~10 hrs';
    fallbackSecs = 36000;
    isOutstation = true;
  } else if (pLower.includes('hyderabad') || dLower.includes('hyderabad')) {
    fallbackKm = 570;
    fallbackVia = 'via NH 44 North Expressway';
    fallbackDur = '~8 hrs';
    fallbackSecs = 28800;
    isOutstation = true;
  } else if (pLower.includes('mumbai') || dLower.includes('mumbai')) {
    fallbackKm = 985;
    fallbackVia = 'via NH 48 (Pune - Mumbai Expressway)';
    fallbackDur = '~15 hrs';
    fallbackSecs = 54000;
    isOutstation = true;
  } else if (pLower.includes('pune') || dLower.includes('pune')) {
    fallbackKm = 840;
    fallbackVia = 'via NH 48';
    fallbackDur = '~13 hrs';
    fallbackSecs = 46800;
    isOutstation = true;
  }
  // State-Level Geographies (Prevents 145km fallback for out-of-Karnataka trips)
  else if (pLower.includes('tamil nadu') || dLower.includes('tamil nadu') || pLower.includes('tamilnadu') || dLower.includes('tamilnadu') || pLower.includes(', tn') || dLower.includes(', tn')) {
    fallbackKm = 450;
    fallbackVia = 'via NH 44 / NH 48 Inter-State Highway Corridor';
    fallbackDur = '~7 hr 30 mins';
    fallbackSecs = 27000;
    isOutstation = true;
  } else if (pLower.includes('kerala') || dLower.includes('kerala') || pLower.includes(', kl') || dLower.includes(', kl')) {
    fallbackKm = 480;
    fallbackVia = 'via NH 544 / NH 766 Inter-State Highway Corridor';
    fallbackDur = '~8 hrs';
    fallbackSecs = 28800;
    isOutstation = true;
  } else if (pLower.includes('andhra') || dLower.includes('andhra') || pLower.includes('telangana') || dLower.includes('telangana') || pLower.includes(', ap') || dLower.includes(', ap')) {
    fallbackKm = 420;
    fallbackVia = 'via NH 44 / NH 16 Inter-State Highway Corridor';
    fallbackDur = '~7 hrs';
    fallbackSecs = 25200;
    isOutstation = true;
  } else if (pLower.includes('maharashtra') || dLower.includes('maharashtra') || pLower.includes(', mh') || dLower.includes(', mh')) {
    fallbackKm = 820;
    fallbackVia = 'via NH 48 North Highway Corridor';
    fallbackDur = '~13 hrs';
    fallbackSecs = 46800;
    isOutstation = true;
  } else if (pLower.includes('airport') || dLower.includes('airport')) {
    fallbackKm = 38;
    fallbackVia = 'via Bellary Road / Airport Expressway';
    fallbackDur = '~55 mins';
    fallbackSecs = 3300;
    isOutstation = false;
  } else if (normTripType === 'LOCAL') {
    fallbackKm = 80;
    fallbackVia = 'City-wide flexible disposal';
    fallbackDur = '8 Hours Full Day Rental';
    fallbackSecs = 28800;
    isOutstation = false;
  } else if (normTripType === 'OUTSTATION' || normTripType === 'ROUND_TRIP') {
    fallbackKm = 250;
    fallbackVia = 'via National & State Highway Corridors';
    fallbackDur = '~4 hr 30 mins';
    fallbackSecs = 16200;
    isOutstation = true;
  }

  return {
    distanceKm: fallbackKm,
    distanceRange: `${fallbackKm} km`,
    durationSeconds: fallbackSecs,
    durationText: fallbackDur,
    routeVia: fallbackVia,
    isOutstation,
    detectedPickup: k1 || undefined,
    detectedDest: k2 || undefined
  };
}

// Live geocoder for any place in India via Photon & Nominatim
export async function geocodeLocationIndia(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const clean = String(query || '').trim();
  if (!clean) return null;
  const key = extractLocationKey(clean);
  if (key && KNOWN_COORDINATES[key]) {
    return { ...KNOWN_COORDINATES[key], displayName: key };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(clean + ' India')}&limit=1`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const feature = data?.features?.[0];
      if (feature?.geometry?.coordinates) {
        const [lng, lat] = feature.geometry.coordinates;
        return { lat, lng, displayName: feature.properties?.name || clean };
      }
    }
  } catch {
    // Fall back to Nominatim
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(clean)}&countrycodes=in&format=json&limit=1`;
    const res = await fetch(url, { signal: controller.signal, headers: { 'Accept-Language': 'en' } });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
      }
    }
  } catch {
    // Network fallback
  }

  return null;
}

// Asynchronous route calculator with live OSRM routing and instant sync fallback
export async function calculateRoute(pickup: string, destination: string, tripType: string): Promise<RouteInfo> {
  const syncResult = calculateRouteSync(pickup, destination, tripType);
  const k1 = extractLocationKey(pickup);
  const k2 = extractLocationKey(destination);

  // If already found in verified highway table, return immediately
  if (k1 && k2 && (VERIFIED_HIGHWAY_PAIRS[`${k1}_${k2}`] || VERIFIED_HIGHWAY_PAIRS[`${k2}_${k1}`])) {
    return syncResult;
  }

  // Attempt live driving distance calculation via OSRM if coordinates exist locally
  let c1 = k1 ? KNOWN_COORDINATES[k1] : undefined;
  let c2 = k2 ? KNOWN_COORDINATES[k2] : undefined;

  // If either coordinate is missing from dictionary, geocode dynamically anywhere in India
  if (!c1 || !c2) {
    try {
      const [g1, g2] = await Promise.all([
        c1 ? Promise.resolve(c1) : geocodeLocationIndia(pickup),
        c2 ? Promise.resolve(c2) : geocodeLocationIndia(destination)
      ]);
      if (g1) c1 = g1;
      if (g2) c2 = g2;
    } catch {
      // Keep static
    }
  }

  if (c1 && c2) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const url = `https://router.project-osrm.org/route/v1/driving/${c1.lng},${c1.lat};${c2.lng},${c2.lat}?overview=false`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data?.routes?.[0]?.distance) {
          const liveKm = Math.round((data.routes[0].distance / 1000) * 10) / 10;
          const liveSec = Math.round(data.routes[0].duration);
          const liveMins = Math.round(liveSec / 60);
          const durationText = liveMins >= 60 
            ? `~${Math.floor(liveMins / 60)} hr ${liveMins % 60 ? (liveMins % 60) + ' mins' : ''}`.trim()
            : `~${liveMins} mins`;
          return {
            ...syncResult,
            distanceKm: liveKm,
            distanceRange: `${liveKm} km`,
            durationSeconds: liveSec,
            durationText,
            isOutstation: liveKm > 45 || syncResult.isOutstation,
            routeVia: liveKm >= 300 ? 'via National Highway Express Corridor' : syncResult.routeVia
          };
        }
      }
    } catch {
      // Fall back to Haversine with road factor
    }

    const roadKm = Math.max(5, calculateHaversineRoadKm(c1, c2));
    const durSecs = Math.round((roadKm / 55) * 3600);
    const durMins = Math.round(durSecs / 60);
    const durationText = durMins >= 60 
      ? `~${Math.floor(durMins / 60)} hr ${durMins % 60 ? (durMins % 60) + ' mins' : ''}`.trim()
      : `~${durMins} mins`;
    return {
      ...syncResult,
      distanceKm: roadKm,
      distanceRange: `${roadKm} km`,
      durationSeconds: durSecs,
      durationText,
      isOutstation: roadKm > 45 || syncResult.isOutstation,
      routeVia: roadKm >= 300 ? 'via National Highway Express Corridor' : syncResult.routeVia
    };
  }

  return syncResult;
}

function parseDurationToSeconds(text: string): number {
  if (!text) return 3600;
  let seconds = 0;
  const hrMatch = text.match(/(\d+)\s*hr/);
  const minMatch = text.match(/(\d+)\s*min/);
  if (hrMatch) seconds += parseInt(hrMatch[1], 10) * 3600;
  if (minMatch) seconds += parseInt(minMatch[1], 10) * 60;
  return seconds;
}

export function isAirportLocation(text: string): boolean {
  if (!text) return false;
  const clean = text.toLowerCase();
  return (
    clean.includes('airport') ||
    clean.includes('kempegowda') ||
    clean.includes('blr') ||
    clean.includes('kia') ||
    clean.includes('bial') ||
    clean.includes('terminal 1') ||
    clean.includes('terminal 2') ||
    clean.includes('t1') ||
    clean.includes('t2') ||
    clean.includes('devanahalli airport')
  );
}

export function validateAirportTrip(pickup: string, destination: string): {
  isValid: boolean;
  error?: string;
  hasPickupAirport: boolean;
  hasDropAirport: boolean;
  direction?: 'TO_AIRPORT' | 'FROM_AIRPORT';
} {
  const pAirport = isAirportLocation(pickup);
  const dAirport = isAirportLocation(destination);

  if (!pAirport && !dAirport) {
    return {
      isValid: false,
      error: 'Airport Transfer requires Kempegowda International Airport (BLR) as pickup or drop location.',
      hasPickupAirport: false,
      hasDropAirport: false
    };
  }

  return {
    isValid: true,
    hasPickupAirport: pAirport,
    hasDropAirport: dAirport,
    direction: dAirport ? 'TO_AIRPORT' : 'FROM_AIRPORT'
  };
}

export function isOutstationDestination(dest: string, pickup: string = ''): boolean {
  if (!dest) return false;
  const clean = dest.toLowerCase();
  if (isAirportLocation(clean)) return false;

  const outstationKeywords = [
    // Tamil Nadu
    'rameshwaram', 'rameswaram', 'ramanathapuram', 'tamil nadu', 'tamilnadu', 'madurai', 'kanyakumari',
    'chennai', 'salem', 'coimbatore', 'trichy', 'tiruchirappalli', 'tirunelveli', 'thanjavur', 'tanjore',
    'kumbakonam', 'velankanni', 'kodaikanal', 'palani', 'tiruvannamalai', 'vellore', 'hosur', 'krishnagiri',
    'dharmapuri', 'erode', 'tirupur', 'dindigul', 'namakkal', 'karur', 'yelagiri', 'courtallam', 'tenkasi',
    'thoothukudi', 'tuticorin', 'ooty', 'coonoor', 'pondicherry', 'puducherry',
    // Kerala
    'kerala', 'munnar', 'kochi', 'cochin', 'ernakulam', 'alleppey', 'alappuzha', 'wayanad', 'sulthan bathery',
    'kalpetta', 'kozhikode', 'calicut', 'thiruvananthapuram', 'trivandrum', 'thekkady', 'varkala', 'kovalam',
    'thrissur', 'palakkad', 'kannur', 'kasaragod', 'guruvayur', 'sabarimala',
    // Andhra & Telangana
    'andhra', 'telangana', 'hyderabad', 'tirupati', 'tirumala', 'vijayawada', 'visakhapatnam', 'vizag',
    'kurnool', 'anantapur', 'chittoor', 'kadapa', 'nellore', 'guntur', 'srisailam', 'lepakshi', 'puttaparthi',
    // Goa & Maharashtra
    'goa', 'panaji', 'calangute', 'baga', 'margao', 'mumbai', 'pune', 'shirdi', 'nashik', 'kolhapur',
    'solapur', 'mahabaleshwar', 'lonavala', 'nagpur',
    // Karnataka Outstation
    'mysore', 'mysuru', 'coorg', 'madikeri', 'kushalnagar', 'chikmagalur', 'chikkamagaluru', 'mullayanagiri',
    'hassan', 'sakleshpur', 'belur', 'halebeedu', 'shravanabelagola', 'hampi', 'hospet', 'shivamogga',
    'shimoga', 'jog falls', 'davanagere', 'chitradurga', 'tumakuru', 'tumkur', 'kolar', 'chikkaballapur',
    'bandipur', 'kabini', 'mangaluru', 'mangalore', 'udupi', 'malpe', 'dharmasthala', 'subramanya', 'kukke',
    'gokarna', 'murudeshwar', 'hubballi', 'hubli', 'belagavi', 'belgaum', 'mandya', 'srirangapatna',
    'badami', 'pattadakal', 'bijapur', 'vijayapura', 'bidar', 'kalaburagi', 'karwar', 'dandeli',
    // Pan-India
    'delhi', 'agra', 'jaipur', 'udaipur', 'varanasi', 'ayodhya', 'ahmedabad', 'surat', 'indore', 'kolkata'
  ];

  if (outstationKeywords.some(k => clean.includes(k))) return true;

  if (pickup) {
    const route = calculateRouteSync(pickup, dest, 'POINT_TO_POINT');
    if (route.distanceKm > 45 && !isAirportLocation(dest)) {
      return true;
    }
  }

  return false;
}

export interface BookingTripMetrics {
  distanceKm: number;
  distanceDisplay: string;
  durationText: string;
  routeVia: string;
  perKmRateText: string;
  isOutstation: boolean;
}

export function getBookingTripMetrics(ride: any): BookingTripMetrics {
  if (!ride) {
    return {
      distanceKm: 0,
      distanceDisplay: '0 km',
      durationText: '--',
      routeVia: 'Direct Route',
      perKmRateText: '--',
      isOutstation: false
    };
  }

  let distKm = Number(ride.distance_km ?? ride.distanceKm ?? ride.billable_distance ?? 0);
  let durText = String(ride.duration_text || ride.durationText || '').trim();
  let routeVia = String(ride.route_via || ride.routeVia || '').trim();

  const pickup = String(ride.pickup || '').trim();
  const destination = String(ride.destination || '').trim();
  const tripType = String(ride.trip_type || ride.tripType || 'POINT_TO_POINT').trim();

  if ((!distKm || distKm <= 0) && pickup && destination) {
    const route = calculateRouteSync(pickup, destination, tripType);
    distKm = route.distanceKm;
    if (!durText) durText = route.durationText;
    if (!routeVia) routeVia = route.routeVia;
  }

  if (!distKm || distKm <= 0) {
    if (isAirportLocation(destination) || isAirportLocation(pickup)) {
      distKm = 48;
      durText = durText || '~1 hr 15 mins';
      routeVia = routeVia || 'Airport Expressway via Hebbal';
    } else {
      distKm = tripType === 'LOCAL' ? 80 : (tripType === 'OUTSTATION' || tripType === 'ROUND_TRIP' ? 145 : 18);
      durText = durText || (tripType === 'LOCAL' ? '8 Hours' : '~45 mins');
      routeVia = routeVia || 'City Arterial Corridor';
    }
  }

  const isOutstation = distKm > 45 || tripType === 'OUTSTATION' || tripType === 'ROUND_TRIP';
  const fare = Number(ride.quoted_amount ?? ride.quotedAmount ?? ride.fare ?? 0);
  const perKmRate = distKm > 0 && fare > 0 ? Math.round(fare / distKm) : (isOutstation ? 12 : 14);

  return {
    distanceKm: distKm,
    distanceDisplay: `${distKm} km`,
    durationText: durText || (isOutstation ? '~3 hr 30 mins' : '~45 mins'),
    routeVia: routeVia || (isOutstation ? 'via National & State Highway Corridors' : 'via City Arterial Roads'),
    perKmRateText: `₹${perKmRate}/km`,
    isOutstation
  };
}
