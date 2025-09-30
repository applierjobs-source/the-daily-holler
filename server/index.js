const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// Production configuration
const isProduction = process.env.NODE_ENV === 'production';
const corsOrigin = isProduction 
  ? process.env.CORS_ORIGIN || 'https://your-domain.com'
  : 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files will be served after API routes

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const CITIES_FILE = path.join(DATA_DIR, 'cities.json');
const ARTICLES_FILE = path.join(DATA_DIR, process.env.NODE_ENV === 'production' ? 'articles_sample_production.json' : 'articles.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Comprehensive US cities data (10,000+ cities)
const generateUSCities = () => {
  const states = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];


  const cities = [];
  let id = 1;


  // Comprehensive list of real US cities with correct states
  const realCities = [
    // Alabama
    { name: "Alexander City", state: "AL", stateName: "Alabama", population: 14875 },
    { name: "Andalusia", state: "AL", stateName: "Alabama", population: 9015 },
    { name: "Anniston", state: "AL", stateName: "Alabama", population: 21569 },
    { name: "Athens", state: "AL", stateName: "Alabama", population: 27102 },
    { name: "Atmore", state: "AL", stateName: "Alabama", population: 8908 },
    { name: "Auburn", state: "AL", stateName: "Alabama", population: 76508 },
    { name: "Bessemer", state: "AL", stateName: "Alabama", population: 26019 },
    { name: "Birmingham", state: "AL", stateName: "Alabama", population: 200733 },
    { name: "Chickasaw", state: "AL", stateName: "Alabama", population: 6106 },
    { name: "Clanton", state: "AL", stateName: "Alabama", population: 8719 },
    { name: "Cullman", state: "AL", stateName: "Alabama", population: 16033 },
    { name: "Decatur", state: "AL", stateName: "Alabama", population: 55206 },
    { name: "Demopolis", state: "AL", stateName: "Alabama", population: 7358 },
    { name: "Dothan", state: "AL", stateName: "Alabama", population: 71402 },
    { name: "Enterprise", state: "AL", stateName: "Alabama", population: 28403 },
    { name: "Eufaula", state: "AL", stateName: "Alabama", population: 12750 },
    { name: "Florence", state: "AL", stateName: "Alabama", population: 40625 },
    { name: "Fort Payne", state: "AL", stateName: "Alabama", population: 14312 },
    { name: "Gadsden", state: "AL", stateName: "Alabama", population: 35241 },
    { name: "Greenville", state: "AL", stateName: "Alabama", population: 7135 },
    { name: "Guntersville", state: "AL", stateName: "Alabama", population: 8384 },
    { name: "Huntsville", state: "AL", stateName: "Alabama", population: 215006 },
    { name: "Jasper", state: "AL", stateName: "Alabama", population: 13898 },
    { name: "Marion", state: "AL", stateName: "Alabama", population: 3194 },
    { name: "Mobile", state: "AL", stateName: "Alabama", population: 187041 },
    { name: "Montgomery", state: "AL", stateName: "Alabama", population: 200022 },
    { name: "Opelika", state: "AL", stateName: "Alabama", population: 30808 },
    { name: "Ozark", state: "AL", stateName: "Alabama", population: 14272 },
    { name: "Phenix City", state: "AL", stateName: "Alabama", population: 38017 },
    { name: "Prichard", state: "AL", stateName: "Alabama", population: 19567 },
    { name: "Scottsboro", state: "AL", stateName: "Alabama", population: 14651 },
    { name: "Selma", state: "AL", stateName: "Alabama", population: 17429 },
    { name: "Sheffield", state: "AL", stateName: "Alabama", population: 9083 },
    { name: "Sylacauga", state: "AL", stateName: "Alabama", population: 12749 },
    { name: "Talladega", state: "AL", stateName: "Alabama", population: 15676 },
    { name: "Troy", state: "AL", stateName: "Alabama", population: 18933 },
    { name: "Tuscaloosa", state: "AL", stateName: "Alabama", population: 101129 },
    { name: "Tuscumbia", state: "AL", stateName: "Alabama", population: 8445 },
    { name: "Tuskegee", state: "AL", stateName: "Alabama", population: 8646 },
    
    // Alaska
    { name: "Anchorage", state: "AK", stateName: "Alaska", population: 291247 },
    { name: "Cordova", state: "AK", stateName: "Alaska", population: 2155 },
    { name: "Fairbanks", state: "AK", stateName: "Alaska", population: 32415 },
    { name: "Haines", state: "AK", stateName: "Alaska", population: 1715 },
    { name: "Homer", state: "AK", stateName: "Alaska", population: 5643 },
    { name: "Juneau", state: "AK", stateName: "Alaska", population: 32113 },
    { name: "Ketchikan", state: "AK", stateName: "Alaska", population: 8188 },
    { name: "Kodiak", state: "AK", stateName: "Alaska", population: 6123 },
    { name: "Kotzebue", state: "AK", stateName: "Alaska", population: 3201 },
    { name: "Nome", state: "AK", stateName: "Alaska", population: 3598 },
    { name: "Palmer", state: "AK", stateName: "Alaska", population: 5937 },
    { name: "Seward", state: "AK", stateName: "Alaska", population: 2827 },
    { name: "Sitka", state: "AK", stateName: "Alaska", population: 8647 },
    { name: "Skagway", state: "AK", stateName: "Alaska", population: 1080 },
    { name: "Valdez", state: "AK", stateName: "Alaska", population: 3975 },
    
    // Arizona
    { name: "Ajo", state: "AZ", stateName: "Arizona", population: 3304 },
    { name: "Avondale", state: "AZ", stateName: "Arizona", population: 89467 },
    { name: "Bisbee", state: "AZ", stateName: "Arizona", population: 5190 },
    { name: "Casa Grande", state: "AZ", stateName: "Arizona", population: 58032 },
    { name: "Chandler", state: "AZ", stateName: "Arizona", population: 279458 },
    { name: "Clifton", state: "AZ", stateName: "Arizona", population: 3827 },
    { name: "Douglas", state: "AZ", stateName: "Arizona", population: 16151 },
    { name: "Flagstaff", state: "AZ", stateName: "Arizona", population: 76089 },
    { name: "Florence", state: "AZ", stateName: "Arizona", population: 26190 },
    { name: "Gila Bend", state: "AZ", stateName: "Arizona", population: 1922 },
    { name: "Glendale", state: "AZ", stateName: "Arizona", population: 248325 },
    { name: "Globe", state: "AZ", stateName: "Arizona", population: 7352 },
    { name: "Kingman", state: "AZ", stateName: "Arizona", population: 32544 },
    { name: "Lake Havasu City", state: "AZ", stateName: "Arizona", population: 57544 },
    { name: "Mesa", state: "AZ", stateName: "Arizona", population: 504258 },
    { name: "Nogales", state: "AZ", stateName: "Arizona", population: 20037 },
    { name: "Oraibi", state: "AZ", stateName: "Arizona", population: 953 },
    { name: "Phoenix", state: "AZ", stateName: "Arizona", population: 1680992 },
    { name: "Prescott", state: "AZ", stateName: "Arizona", population: 45605 },
    { name: "Scottsdale", state: "AZ", stateName: "Arizona", population: 241361 },
    { name: "Sierra Vista", state: "AZ", stateName: "Arizona", population: 45844 },
    { name: "Tempe", state: "AZ", stateName: "Arizona", population: 185038 },
    { name: "Tombstone", state: "AZ", stateName: "Arizona", population: 1308 },
    { name: "Tucson", state: "AZ", stateName: "Arizona", population: 548073 },
    { name: "Walpi", state: "AZ", stateName: "Arizona", population: 12 },
    { name: "Window Rock", state: "AZ", stateName: "Arizona", population: 2655 },
    { name: "Winslow", state: "AZ", stateName: "Arizona", population: 9158 },
    { name: "Yuma", state: "AZ", stateName: "Arizona", population: 95061 },
    
    // Arkansas
    { name: "Arkadelphia", state: "AR", stateName: "Arkansas", population: 10880 },
    { name: "Arkansas Post", state: "AR", stateName: "Arkansas", population: 0 },
    { name: "Batesville", state: "AR", stateName: "Arkansas", population: 11091 },
    { name: "Benton", state: "AR", stateName: "Arkansas", population: 35721 },
    { name: "Blytheville", state: "AR", stateName: "Arkansas", population: 13840 },
    { name: "Camden", state: "AR", stateName: "Arkansas", population: 10967 },
    { name: "Conway", state: "AR", stateName: "Arkansas", population: 67140 },
    { name: "Crossett", state: "AR", stateName: "Arkansas", population: 5193 },
    { name: "El Dorado", state: "AR", stateName: "Arkansas", population: 17655 },
    { name: "Fayetteville", state: "AR", stateName: "Arkansas", population: 95230 },
    { name: "Forrest City", state: "AR", stateName: "Arkansas", population: 13315 },
    { name: "Fort Smith", state: "AR", stateName: "Arkansas", population: 89942 },
    { name: "Harrison", state: "AR", stateName: "Arkansas", population: 13108 },
    { name: "Helena", state: "AR", stateName: "Arkansas", population: 10057 },
    { name: "Hope", state: "AR", stateName: "Arkansas", population: 9686 },
    { name: "Hot Springs", state: "AR", stateName: "Arkansas", population: 37193 },
    { name: "Jacksonville", state: "AR", stateName: "Arkansas", population: 29477 },
    { name: "Jonesboro", state: "AR", stateName: "Arkansas", population: 78394 },
    { name: "Little Rock", state: "AR", stateName: "Arkansas", population: 198541 },
    { name: "Magnolia", state: "AR", stateName: "Arkansas", population: 11577 },
    { name: "Morrilton", state: "AR", stateName: "Arkansas", population: 6767 },
    { name: "Newport", state: "AR", stateName: "Arkansas", population: 7991 },
    { name: "North Little Rock", state: "AR", stateName: "Arkansas", population: 64991 },
    { name: "Osceola", state: "AR", stateName: "Arkansas", population: 6964 },
    { name: "Pine Bluff", state: "AR", stateName: "Arkansas", population: 41825 },
    { name: "Rogers", state: "AR", stateName: "Arkansas", population: 69727 },
    { name: "Searcy", state: "AR", stateName: "Arkansas", population: 23115 },
    { name: "Stuttgart", state: "AR", stateName: "Arkansas", population: 8862 },
    { name: "Van Buren", state: "AR", stateName: "Arkansas", population: 23409 },
    { name: "West Memphis", state: "AR", stateName: "Arkansas", population: 24670 },
    
    // California
    { name: "Alameda", state: "CA", stateName: "California", population: 78004 },
    { name: "Alhambra", state: "CA", stateName: "California", population: 82351 },
    { name: "Anaheim", state: "CA", stateName: "California", population: 346824 },
    { name: "Antioch", state: "CA", stateName: "California", population: 115291 },
    { name: "Arcadia", state: "CA", stateName: "California", population: 56681 },
    { name: "Bakersfield", state: "CA", stateName: "California", population: 384145 },
    { name: "Barstow", state: "CA", stateName: "California", population: 25195 },
    { name: "Belmont", state: "CA", stateName: "California", population: 28406 },
    { name: "Berkeley", state: "CA", stateName: "California", population: 124321 },
    { name: "Beverly Hills", state: "CA", stateName: "California", population: 34964 },
    { name: "Brea", state: "CA", stateName: "California", population: 47126 },
    { name: "Buena Park", state: "CA", stateName: "California", population: 83578 },
    { name: "Burbank", state: "CA", stateName: "California", population: 107337 },
    { name: "Calexico", state: "CA", stateName: "California", population: 40138 },
    { name: "Calistoga", state: "CA", stateName: "California", population: 5331 },
    { name: "Carlsbad", state: "CA", stateName: "California", population: 114746 },
    { name: "Carmel", state: "CA", stateName: "California", population: 3722 },
    { name: "Chico", state: "CA", stateName: "California", population: 101475 },
    { name: "Chula Vista", state: "CA", stateName: "California", population: 275487 },
    { name: "Claremont", state: "CA", stateName: "California", population: 37152 },
    { name: "Compton", state: "CA", stateName: "California", population: 95840 },
    { name: "Concord", state: "CA", stateName: "California", population: 129295 },
    { name: "Corona", state: "CA", stateName: "California", population: 157136 },
    { name: "Coronado", state: "CA", stateName: "California", population: 20757 },
    { name: "Costa Mesa", state: "CA", stateName: "California", population: 111918 },
    { name: "Culver City", state: "CA", stateName: "California", population: 40389 },
    { name: "Daly City", state: "CA", stateName: "California", population: 107197 },
    { name: "Davis", state: "CA", stateName: "California", population: 68838 },
    { name: "Downey", state: "CA", stateName: "California", population: 111772 },
    { name: "El Centro", state: "CA", stateName: "California", population: 44322 },
    { name: "El Cerrito", state: "CA", stateName: "California", population: 25106 },
    { name: "El Monte", state: "CA", stateName: "California", population: 109450 },
    { name: "Escondido", state: "CA", stateName: "California", population: 151038 },
    { name: "Eureka", state: "CA", stateName: "California", population: 26747 },
    { name: "Fairfield", state: "CA", stateName: "California", population: 119881 },
    { name: "Fontana", state: "CA", stateName: "California", population: 208393 },
    { name: "Fremont", state: "CA", stateName: "California", population: 230504 },
    { name: "Fresno", state: "CA", stateName: "California", population: 542107 },
    { name: "Fullerton", state: "CA", stateName: "California", population: 135161 },
    { name: "Garden Grove", state: "CA", stateName: "California", population: 172130 },
    { name: "Glendale", state: "CA", stateName: "California", population: 196543 },
    { name: "Hayward", state: "CA", stateName: "California", population: 162954 },
    { name: "Hollywood", state: "CA", stateName: "California", population: 153627 },
    { name: "Huntington Beach", state: "CA", stateName: "California", population: 198711 },
    { name: "Indio", state: "CA", stateName: "California", population: 89940 },
    { name: "Inglewood", state: "CA", stateName: "California", population: 107762 },
    { name: "Irvine", state: "CA", stateName: "California", population: 307670 },
    { name: "La Habra", state: "CA", stateName: "California", population: 62496 },
    { name: "Laguna Beach", state: "CA", stateName: "California", population: 23032 },
    { name: "Lancaster", state: "CA", stateName: "California", population: 157265 },
    { name: "Livermore", state: "CA", stateName: "California", population: 87155 },
    { name: "Lodi", state: "CA", stateName: "California", population: 66819 },
    { name: "Lompoc", state: "CA", stateName: "California", population: 43834 },
    { name: "Long Beach", state: "CA", stateName: "California", population: 462257 },
    { name: "Los Angeles", state: "CA", stateName: "California", population: 3979576 },
    { name: "Malibu", state: "CA", stateName: "California", population: 10654 },
    { name: "Martinez", state: "CA", stateName: "California", population: 37674 },
    { name: "Marysville", state: "CA", stateName: "California", population: 125844 },
    { name: "Menlo Park", state: "CA", stateName: "California", population: 33927 },
    { name: "Merced", state: "CA", stateName: "California", population: 86187 },
    { name: "Modesto", state: "CA", stateName: "California", population: 218464 },
    { name: "Monterey", state: "CA", stateName: "California", population: 30160 },
    { name: "Mountain View", state: "CA", stateName: "California", population: 82104 },
    { name: "Napa", state: "CA", stateName: "California", population: 79326 },
    { name: "Needles", state: "CA", stateName: "California", population: 4959 },
    { name: "Newport Beach", state: "CA", stateName: "California", population: 85594 },
    { name: "Norwalk", state: "CA", stateName: "California", population: 102773 },
    { name: "Novato", state: "CA", stateName: "California", population: 53175 },
    { name: "Oakland", state: "CA", stateName: "California", population: 433031 },
    { name: "Oceanside", state: "CA", stateName: "California", population: 174068 },
    { name: "Ojai", state: "CA", stateName: "California", population: 7631 },
    { name: "Ontario", state: "CA", stateName: "California", population: 175265 },
    { name: "Orange", state: "CA", stateName: "California", population: 139911 },
    { name: "Oroville", state: "CA", stateName: "California", population: 20223 },
    { name: "Oxnard", state: "CA", stateName: "California", population: 202063 },
    { name: "Pacific Grove", state: "CA", stateName: "California", population: 15522 },
    { name: "Palm Springs", state: "CA", stateName: "California", population: 48041 },
    { name: "Palmdale", state: "CA", stateName: "California", population: 169450 },
    { name: "Palo Alto", state: "CA", stateName: "California", population: 66853 },
    { name: "Pasadena", state: "CA", stateName: "California", population: 141029 },
    { name: "Petaluma", state: "CA", stateName: "California", population: 59776 },
    { name: "Pomona", state: "CA", stateName: "California", population: 151713 },
    { name: "Port Hueneme", state: "CA", stateName: "California", population: 21803 },
    { name: "Rancho Cucamonga", state: "CA", stateName: "California", population: 174453 },
    { name: "Red Bluff", state: "CA", stateName: "California", population: 14380 },
    { name: "Redding", state: "CA", stateName: "California", population: 93111 },
    { name: "Redlands", state: "CA", stateName: "California", population: 71380 },
    { name: "Redondo Beach", state: "CA", stateName: "California", population: 71548 },
    { name: "Redwood City", state: "CA", stateName: "California", population: 84615 },
    { name: "Richmond", state: "CA", stateName: "California", population: 110567 },
    { name: "Riverside", state: "CA", stateName: "California", population: 314998 },
    { name: "Roseville", state: "CA", stateName: "California", population: 147773 },
    { name: "Sacramento", state: "CA", stateName: "California", population: 513624 },
    { name: "Salinas", state: "CA", stateName: "California", population: 163542 },
    { name: "San Bernardino", state: "CA", stateName: "California", population: 222101 },
    { name: "San Clemente", state: "CA", stateName: "California", population: 65022 },
    { name: "San Diego", state: "CA", stateName: "California", population: 1423851 },
    { name: "San Fernando", state: "CA", stateName: "California", population: 23452 },
    { name: "San Francisco", state: "CA", stateName: "California", population: 883305 },
    { name: "San Gabriel", state: "CA", stateName: "California", population: 40141 },
    { name: "San Jose", state: "CA", stateName: "California", population: 1035317 },
    { name: "San Juan Capistrano", state: "CA", stateName: "California", population: 35983 },
    { name: "San Leandro", state: "CA", stateName: "California", population: 90820 },
    { name: "San Luis Obispo", state: "CA", stateName: "California", population: 47536 },
    { name: "San Marino", state: "CA", stateName: "California", population: 13000 },
    { name: "San Mateo", state: "CA", stateName: "California", population: 103959 },
    { name: "San Pedro", state: "CA", stateName: "California", population: 78305 },
    { name: "San Rafael", state: "CA", stateName: "California", population: 59162 },
    { name: "San Simeon", state: "CA", stateName: "California", population: 462 },
    { name: "Santa Ana", state: "CA", stateName: "California", population: 332318 },
    { name: "Santa Barbara", state: "CA", stateName: "California", population: 90934 },
    { name: "Santa Clara", state: "CA", stateName: "California", population: 127647 },
    { name: "Santa Clarita", state: "CA", stateName: "California", population: 228673 },
    { name: "Santa Cruz", state: "CA", stateName: "California", population: 64776 },
    { name: "Santa Monica", state: "CA", stateName: "California", population: 93206 },
    { name: "Santa Rosa", state: "CA", stateName: "California", population: 178127 },
    { name: "Sausalito", state: "CA", stateName: "California", population: 7193 },
    { name: "Simi Valley", state: "CA", stateName: "California", population: 126356 },
    { name: "Sonoma", state: "CA", stateName: "California", population: 10808 },
    { name: "South San Francisco", state: "CA", stateName: "California", population: 66886 },
    { name: "Stockton", state: "CA", stateName: "California", population: 310496 },
    { name: "Sunnyvale", state: "CA", stateName: "California", population: 155805 },
    { name: "Susanville", state: "CA", stateName: "California", population: 15945 },
    { name: "Thousand Oaks", state: "CA", stateName: "California", population: 126683 },
    { name: "Torrance", state: "CA", stateName: "California", population: 141126 },
    { name: "Turlock", state: "CA", stateName: "California", population: 72290 },
    { name: "Ukiah", state: "CA", stateName: "California", population: 16275 },
    { name: "Vallejo", state: "CA", stateName: "California", population: 126090 },
    { name: "Ventura", state: "CA", stateName: "California", population: 110763 },
    { name: "Victorville", state: "CA", stateName: "California", population: 134810 },
    { name: "Visalia", state: "CA", stateName: "California", population: 141384 },
    { name: "Walnut Creek", state: "CA", stateName: "California", population: 70027 },
    { name: "Watts", state: "CA", stateName: "California", population: 0 },
    { name: "West Covina", state: "CA", stateName: "California", population: 106098 },
    { name: "Whittier", state: "CA", stateName: "California", population: 87251 },
    { name: "Woodland", state: "CA", stateName: "California", population: 61671 },
    { name: "Yorba Linda", state: "CA", stateName: "California", population: 68085 },
    { name: "Yuba City", state: "CA", stateName: "California", population: 66941 },
    
    // Colorado
    { name: "Alamosa", state: "CO", stateName: "Colorado", population: 9586 },
    { name: "Aspen", state: "CO", stateName: "Colorado", population: 7423 },
    { name: "Aurora", state: "CO", stateName: "Colorado", population: 386261 },
    { name: "Boulder", state: "CO", stateName: "Colorado", population: 108250 },
    { name: "Breckenridge", state: "CO", stateName: "Colorado", population: 5045 },
    { name: "Brighton", state: "CO", stateName: "Colorado", population: 40583 },
    { name: "Canon City", state: "CO", stateName: "Colorado", population: 17241 },
    { name: "Central City", state: "CO", stateName: "Colorado", population: 779 },
    { name: "Climax", state: "CO", stateName: "Colorado", population: 0 },
    { name: "Colorado Springs", state: "CO", stateName: "Colorado", population: 478221 },
    { name: "Cortez", state: "CO", stateName: "Colorado", population: 8872 },
    { name: "Cripple Creek", state: "CO", stateName: "Colorado", population: 1189 },
    { name: "Denver", state: "CO", stateName: "Colorado", population: 715522 },
    { name: "Durango", state: "CO", stateName: "Colorado", population: 19364 },
    { name: "Englewood", state: "CO", stateName: "Colorado", population: 33411 },
    { name: "Estes Park", state: "CO", stateName: "Colorado", population: 5933 },
    { name: "Fort Collins", state: "CO", stateName: "Colorado", population: 169810 },
    { name: "Fort Morgan", state: "CO", stateName: "Colorado", population: 11315 },
    { name: "Georgetown", state: "CO", stateName: "Colorado", population: 1074 },
    { name: "Glenwood Springs", state: "CO", stateName: "Colorado", population: 10105 },
    { name: "Golden", state: "CO", stateName: "Colorado", population: 20808 },
    { name: "Grand Junction", state: "CO", stateName: "Colorado", population: 65185 },
    { name: "Greeley", state: "CO", stateName: "Colorado", population: 108795 },
    { name: "Gunnison", state: "CO", stateName: "Colorado", population: 6534 },
    { name: "La Junta", state: "CO", stateName: "Colorado", population: 7058 },
    { name: "Leadville", state: "CO", stateName: "Colorado", population: 2602 },
    { name: "Littleton", state: "CO", stateName: "Colorado", population: 45382 },
    { name: "Longmont", state: "CO", stateName: "Colorado", population: 98885 },
    { name: "Loveland", state: "CO", stateName: "Colorado", population: 76001 },
    { name: "Montrose", state: "CO", stateName: "Colorado", population: 20117 },
    { name: "Ouray", state: "CO", stateName: "Colorado", population: 1000 },
    { name: "Pagosa Springs", state: "CO", stateName: "Colorado", population: 1727 },
    { name: "Pueblo", state: "CO", stateName: "Colorado", population: 111876 },
    { name: "Silverton", state: "CO", stateName: "Colorado", population: 637 },
    { name: "Steamboat Springs", state: "CO", stateName: "Colorado", population: 13304 },
    { name: "Sterling", state: "CO", stateName: "Colorado", population: 14127 },
    { name: "Telluride", state: "CO", stateName: "Colorado", population: 2595 },
    { name: "Trinidad", state: "CO", stateName: "Colorado", population: 8178 },
    { name: "Vail", state: "CO", stateName: "Colorado", population: 5488 },
    { name: "Walsenburg", state: "CO", stateName: "Colorado", population: 3006 },
    { name: "Westminster", state: "CO", stateName: "Colorado", population: 116317 },
    
    // Connecticut
    { name: "Ansonia", state: "CT", stateName: "Connecticut", population: 18764 },
    { name: "Berlin", state: "CT", stateName: "Connecticut", population: 19966 },
    { name: "Bloomfield", state: "CT", stateName: "Connecticut", population: 21330 },
    { name: "Branford", state: "CT", stateName: "Connecticut", population: 28026 },
    { name: "Bridgeport", state: "CT", stateName: "Connecticut", population: 148654 },
    { name: "Bristol", state: "CT", stateName: "Connecticut", population: 60083 },
    { name: "Coventry", state: "CT", stateName: "Connecticut", population: 12381 },
    { name: "Danbury", state: "CT", stateName: "Connecticut", population: 86068 },
    { name: "Darien", state: "CT", stateName: "Connecticut", population: 21699 },
    { name: "Derby", state: "CT", stateName: "Connecticut", population: 12325 },
    { name: "East Hartford", state: "CT", stateName: "Connecticut", population: 51324 },
    { name: "East Haven", state: "CT", stateName: "Connecticut", population: 29257 },
    { name: "Enfield", state: "CT", stateName: "Connecticut", population: 42465 },
    { name: "Fairfield", state: "CT", stateName: "Connecticut", population: 62579 },
    { name: "Farmington", state: "CT", stateName: "Connecticut", population: 25834 },
    { name: "Greenwich", state: "CT", stateName: "Connecticut", population: 63457 },
    { name: "Groton", state: "CT", stateName: "Connecticut", population: 9654 },
    { name: "Guilford", state: "CT", stateName: "Connecticut", population: 22398 },
    { name: "Hamden", state: "CT", stateName: "Connecticut", population: 61230 },
    { name: "Hartford", state: "CT", stateName: "Connecticut", population: 121054 },
    { name: "Lebanon", state: "CT", stateName: "Connecticut", population: 7424 },
    { name: "Litchfield", state: "CT", stateName: "Connecticut", population: 1202 },
    { name: "Manchester", state: "CT", stateName: "Connecticut", population: 57713 },
    { name: "Mansfield", state: "CT", stateName: "Connecticut", population: 26205 },
    { name: "Meriden", state: "CT", stateName: "Connecticut", population: 60668 },
    { name: "Middletown", state: "CT", stateName: "Connecticut", population: 47359 },
    { name: "Milford", state: "CT", stateName: "Connecticut", population: 54584 },
    { name: "Mystic", state: "CT", stateName: "Connecticut", population: 4205 },
    { name: "Naugatuck", state: "CT", stateName: "Connecticut", population: 31229 },
    { name: "New Britain", state: "CT", stateName: "Connecticut", population: 74406 },
    { name: "New Haven", state: "CT", stateName: "Connecticut", population: 134023 },
    { name: "New London", state: "CT", stateName: "Connecticut", population: 27159 },
    { name: "North Haven", state: "CT", stateName: "Connecticut", population: 24478 },
    { name: "Norwalk", state: "CT", stateName: "Connecticut", population: 91323 },
    { name: "Norwich", state: "CT", stateName: "Connecticut", population: 40493 },
    { name: "Old Saybrook", state: "CT", stateName: "Connecticut", population: 10242 },
    { name: "Orange", state: "CT", stateName: "Connecticut", population: 13956 },
    { name: "Seymour", state: "CT", stateName: "Connecticut", population: 16262 },
    { name: "Shelton", state: "CT", stateName: "Connecticut", population: 41041 },
    { name: "Simsbury", state: "CT", stateName: "Connecticut", population: 23511 },
    { name: "Southington", state: "CT", stateName: "Connecticut", population: 43406 },
    { name: "Stamford", state: "CT", stateName: "Connecticut", population: 135470 },
    { name: "Stonington", state: "CT", stateName: "Connecticut", population: 18408 },
    { name: "Stratford", state: "CT", stateName: "Connecticut", population: 51884 },
    { name: "Torrington", state: "CT", stateName: "Connecticut", population: 35202 },
    { name: "Wallingford", state: "CT", stateName: "Connecticut", population: 44721 },
    { name: "Waterbury", state: "CT", stateName: "Connecticut", population: 114403 },
    { name: "Waterford", state: "CT", stateName: "Connecticut", population: 19517 },
    { name: "Watertown", state: "CT", stateName: "Connecticut", population: 22105 },
    { name: "West Hartford", state: "CT", stateName: "Connecticut", population: 63268 },
    { name: "West Haven", state: "CT", stateName: "Connecticut", population: 55341 },
    { name: "Westport", state: "CT", stateName: "Connecticut", population: 28141 },
    { name: "Wethersfield", state: "CT", stateName: "Connecticut", population: 27298 },
    { name: "Willimantic", state: "CT", stateName: "Connecticut", population: 18493 },
    { name: "Windham", state: "CT", stateName: "Connecticut", population: 2568 },
    { name: "Windsor", state: "CT", stateName: "Connecticut", population: 29247 },
    { name: "Windsor Locks", state: "CT", stateName: "Connecticut", population: 12798 },
    { name: "Winsted", state: "CT", stateName: "Connecticut", population: 7271 },
    
    // Delaware
    { name: "Dover", state: "DE", stateName: "Delaware", population: 38791 },
    { name: "Lewes", state: "DE", stateName: "Delaware", population: 3261 },
    { name: "Milford", state: "DE", stateName: "Delaware", population: 11403 },
    { name: "New Castle", state: "DE", stateName: "Delaware", population: 5422 },
    { name: "Newark", state: "DE", stateName: "Delaware", population: 31531 },
    { name: "Smyrna", state: "DE", stateName: "Delaware", population: 11970 },
    { name: "Wilmington", state: "DE", stateName: "Delaware", population: 70851 },
    
    // Florida
    { name: "Apalachicola", state: "FL", stateName: "Florida", population: 2331 },
    { name: "Bartow", state: "FL", stateName: "Florida", population: 19298 },
    { name: "Belle Glade", state: "FL", stateName: "Florida", population: 19906 },
    { name: "Boca Raton", state: "FL", stateName: "Florida", population: 97422 },
    { name: "Bradenton", state: "FL", stateName: "Florida", population: 55708 },
    { name: "Cape Coral", state: "FL", stateName: "Florida", population: 194016 },
    { name: "Clearwater", state: "FL", stateName: "Florida", population: 117292 },
    { name: "Cocoa Beach", state: "FL", stateName: "Florida", population: 11521 },
    { name: "Cocoa-Rockledge", state: "FL", stateName: "Florida", population: 56221 },
    { name: "Coral Gables", state: "FL", stateName: "Florida", population: 49968 },
    { name: "Daytona Beach", state: "FL", stateName: "Florida", population: 72193 },
    { name: "De Land", state: "FL", stateName: "Florida", population: 37551 },
    { name: "Deerfield Beach", state: "FL", stateName: "Florida", population: 86255 },
    { name: "Delray Beach", state: "FL", stateName: "Florida", population: 66958 },
    { name: "Fernandina Beach", state: "FL", stateName: "Florida", population: 13054 },
    { name: "Fort Lauderdale", state: "FL", stateName: "Florida", population: 182437 },
    { name: "Fort Myers", state: "FL", stateName: "Florida", population: 87403 },
    { name: "Fort Pierce", state: "FL", stateName: "Florida", population: 45866 },
    { name: "Fort Walton Beach", state: "FL", stateName: "Florida", population: 21551 },
    { name: "Gainesville", state: "FL", stateName: "Florida", population: 141085 },
    { name: "Hallandale Beach", state: "FL", stateName: "Florida", population: 41056 },
    { name: "Hialeah", state: "FL", stateName: "Florida", population: 223109 },
    { name: "Hollywood", state: "FL", stateName: "Florida", population: 153627 },
    { name: "Homestead", state: "FL", stateName: "Florida", population: 80531 },
    { name: "Jacksonville", state: "FL", stateName: "Florida", population: 949611 },
    { name: "Key West", state: "FL", stateName: "Florida", population: 25578 },
    { name: "Lake City", state: "FL", stateName: "Florida", population: 12289 },
    { name: "Lake Wales", state: "FL", stateName: "Florida", population: 16567 },
    { name: "Lakeland", state: "FL", stateName: "Florida", population: 112641 },
    { name: "Largo", state: "FL", stateName: "Florida", population: 84842 },
    { name: "Melbourne", state: "FL", stateName: "Florida", population: 84678 },
    { name: "Miami", state: "FL", stateName: "Florida", population: 467963 },
    { name: "Miami Beach", state: "FL", stateName: "Florida", population: 822921 },
    { name: "Naples", state: "FL", stateName: "Florida", population: 21908 },
    { name: "New Smyrna Beach", state: "FL", stateName: "Florida", population: 27244 },
    { name: "Ocala", state: "FL", stateName: "Florida", population: 63791 },
    { name: "Orlando", state: "FL", stateName: "Florida", population: 307573 },
    { name: "Ormond Beach", state: "FL", stateName: "Florida", population: 43209 },
    { name: "Palatka", state: "FL", stateName: "Florida", population: 10338 },
    { name: "Palm Bay", state: "FL", stateName: "Florida", population: 119760 },
    { name: "Palm Beach", state: "FL", stateName: "Florida", population: 8847 },
    { name: "Panama City", state: "FL", stateName: "Florida", population: 36084 },
    { name: "Pensacola", state: "FL", stateName: "Florida", population: 52908 },
    { name: "Pompano Beach", state: "FL", stateName: "Florida", population: 112046 },
    { name: "Saint Augustine", state: "FL", stateName: "Florida", population: 14581 },
    { name: "Saint Petersburg", state: "FL", stateName: "Florida", population: 258308 },
    { name: "Sanford", state: "FL", stateName: "Florida", population: 59284 },
    { name: "Sarasota", state: "FL", stateName: "Florida", population: 58000 },
    { name: "Sebring", state: "FL", stateName: "Florida", population: 10586 },
    { name: "Tallahassee", state: "FL", stateName: "Florida", population: 196169 },
    { name: "Tampa", state: "FL", stateName: "Florida", population: 399700 },
    { name: "Tarpon Springs", state: "FL", stateName: "Florida", population: 25881 },
    { name: "Titusville", state: "FL", stateName: "Florida", population: 46709 },
    { name: "Venice", state: "FL", stateName: "Florida", population: 24389 },
    { name: "West Palm Beach", state: "FL", stateName: "Florida", population: 117415 },
    { name: "White Springs", state: "FL", stateName: "Florida", population: 777 },
    { name: "Winter Haven", state: "FL", stateName: "Florida", population: 49219 },
    { name: "Winter Park", state: "FL", stateName: "Florida", population: 29965 },
    
    // Georgia
    { name: "Albany", state: "GA", stateName: "Georgia", population: 69325 },
    { name: "Americus", state: "GA", stateName: "Georgia", population: 16131 },
    { name: "Andersonville", state: "GA", stateName: "Georgia", population: 250 },
    { name: "Athens", state: "GA", stateName: "Georgia", population: 127913 },
    { name: "Atlanta", state: "GA", stateName: "Georgia", population: 498715 },
    { name: "Augusta", state: "GA", stateName: "Georgia", population: 202081 },
    { name: "Bainbridge", state: "GA", stateName: "Georgia", population: 12138 },
    { name: "Blairsville", state: "GA", stateName: "Georgia", population: 652 },
    { name: "Brunswick", state: "GA", stateName: "Georgia", population: 15763 },
    { name: "Calhoun", state: "GA", stateName: "Georgia", population: 17162 },
    { name: "Carrollton", state: "GA", stateName: "Georgia", population: 26708 },
    { name: "Columbus", state: "GA", stateName: "Georgia", population: 206922 },
    { name: "Dahlonega", state: "GA", stateName: "Georgia", population: 7002 },
    { name: "Dalton", state: "GA", stateName: "Georgia", population: 34417 },
    { name: "Darien", state: "GA", stateName: "Georgia", population: 1894 },
    { name: "Decatur", state: "GA", stateName: "Georgia", population: 24828 },
    { name: "Douglas", state: "GA", stateName: "Georgia", population: 11789 },
    { name: "East Point", state: "GA", stateName: "Georgia", population: 38041 },
    { name: "Fitzgerald", state: "GA", stateName: "Georgia", population: 9067 },
    { name: "Fort Valley", state: "GA", stateName: "Georgia", population: 8955 },
    { name: "Gainesville", state: "GA", stateName: "Georgia", population: 42743 },
    { name: "La Grange", state: "GA", stateName: "Georgia", population: 30873 },
    { name: "Macon", state: "GA", stateName: "Georgia", population: 152663 },
    { name: "Marietta", state: "GA", stateName: "Georgia", population: 60867 },
    { name: "Milledgeville", state: "GA", stateName: "Georgia", population: 19087 },
    { name: "Plains", state: "GA", stateName: "Georgia", population: 776 },
    { name: "Rome", state: "GA", stateName: "Georgia", population: 37413 },
    { name: "Savannah", state: "GA", stateName: "Georgia", population: 147780 },
    { name: "Toccoa", state: "GA", stateName: "Georgia", population: 8321 },
    { name: "Valdosta", state: "GA", stateName: "Georgia", population: 55995 },
    { name: "Warm Springs", state: "GA", stateName: "Georgia", population: 425 },
    { name: "Warner Robins", state: "GA", stateName: "Georgia", population: 80008 },
    { name: "Washington", state: "GA", stateName: "Georgia", population: 3951 },
    { name: "Waycross", state: "GA", stateName: "Georgia", population: 13941 },
    
    // Hawaii
    { name: "Hanalei", state: "HI", stateName: "Hawaii", population: 450 },
    { name: "Hilo", state: "HI", stateName: "Hawaii", population: 45759 },
    { name: "Honaunau", state: "HI", stateName: "Hawaii", population: 0 },
    { name: "Honolulu", state: "HI", stateName: "Hawaii", population: 347397 },
    { name: "Kahului", state: "HI", stateName: "Hawaii", population: 26440 },
    { name: "Kaneohe", state: "HI", stateName: "Hawaii", population: 34597 },
    { name: "Kapaa", state: "HI", stateName: "Hawaii", population: 10699 },
    { name: "Kawaihae", state: "HI", stateName: "Hawaii", population: 0 },
    { name: "Lahaina", state: "HI", stateName: "Hawaii", population: 11225 },
    { name: "Laie", state: "HI", stateName: "Hawaii", population: 6127 },
    { name: "Wahiawa", state: "HI", stateName: "Hawaii", population: 17721 },
    { name: "Wailuku", state: "HI", stateName: "Hawaii", population: 15313 },
    { name: "Waimea", state: "HI", stateName: "Hawaii", population: 0 },
    
    // Idaho
    { name: "Blackfoot", state: "ID", stateName: "Idaho", population: 11904 },
    { name: "Boise", state: "ID", stateName: "Idaho", population: 235684 },
    { name: "Bonners Ferry", state: "ID", stateName: "Idaho", population: 2538 },
    { name: "Caldwell", state: "ID", stateName: "Idaho", population: 59661 },
    { name: "Coeur d'Alene", state: "ID", stateName: "Idaho", population: 55285 },
    { name: "Idaho City", state: "ID", stateName: "Idaho", population: 485 },
    { name: "Idaho Falls", state: "ID", stateName: "Idaho", population: 64975 },
    { name: "Kellogg", state: "ID", stateName: "Idaho", population: 2093 },
    { name: "Lewiston", state: "ID", stateName: "Idaho", population: 34117 },
    { name: "Moscow", state: "ID", stateName: "Idaho", population: 25851 },
    { name: "Nampa", state: "ID", stateName: "Idaho", population: 100200 },
    { name: "Pocatello", state: "ID", stateName: "Idaho", population: 56961 },
    { name: "Priest River", state: "ID", stateName: "Idaho", population: 1747 },
    { name: "Rexburg", state: "ID", stateName: "Idaho", population: 28618 },
    { name: "Sun Valley", state: "ID", stateName: "Idaho", population: 1406 },
    { name: "Twin Falls", state: "ID", stateName: "Idaho", population: 51380 },
    
    // Illinois
    { name: "Alton", state: "IL", stateName: "Illinois", population: 25875 },
    { name: "Arlington Heights", state: "IL", stateName: "Illinois", population: 77331 },
    { name: "Arthur", state: "IL", stateName: "Illinois", population: 2273 },
    { name: "Aurora", state: "IL", stateName: "Illinois", population: 180542 },
    { name: "Belleville", state: "IL", stateName: "Illinois", population: 42478 },
    { name: "Belvidere", state: "IL", stateName: "Illinois", population: 25126 },
    { name: "Bloomington", state: "IL", stateName: "Illinois", population: 78402 },
    { name: "Brookfield", state: "IL", stateName: "Illinois", population: 18798 },
    { name: "Cahokia", state: "IL", stateName: "Illinois", population: 0 },
    { name: "Cairo", state: "IL", stateName: "Illinois", population: 1858 },
    { name: "Calumet City", state: "IL", stateName: "Illinois", population: 36157 },
    { name: "Canton", state: "IL", stateName: "Illinois", population: 14185 },
    { name: "Carbondale", state: "IL", stateName: "Illinois", population: 25965 },
    { name: "Carlinville", state: "IL", stateName: "Illinois", population: 5485 },
    { name: "Carthage", state: "IL", stateName: "Illinois", population: 2618 },
    { name: "Centralia", state: "IL", stateName: "Illinois", population: 12310 },
    { name: "Champaign", state: "IL", stateName: "Illinois", population: 88402 },
    { name: "Charleston", state: "IL", stateName: "Illinois", population: 17119 },
    { name: "Chester", state: "IL", stateName: "Illinois", population: 8331 },
    { name: "Chicago", state: "IL", stateName: "Illinois", population: 2693976 },
    { name: "Chicago Heights", state: "IL", stateName: "Illinois", population: 27373 },
    { name: "Cicero", state: "IL", stateName: "Illinois", population: 85103 },
    { name: "Collinsville", state: "IL", stateName: "Illinois", population: 25079 },
    { name: "Danville", state: "IL", stateName: "Illinois", population: 31533 },
    { name: "Decatur", state: "IL", stateName: "Illinois", population: 70699 },
    { name: "DeKalb", state: "IL", stateName: "Illinois", population: 43463 },
    { name: "Des Plaines", state: "IL", stateName: "Illinois", population: 58599 },
    { name: "Dixon", state: "IL", stateName: "Illinois", population: 15174 },
    { name: "East Moline", state: "IL", stateName: "Illinois", population: 21486 },
    { name: "East Saint Louis", state: "IL", stateName: "Illinois", population: 25995 },
    { name: "Effingham", state: "IL", stateName: "Illinois", population: 12328 },
    { name: "Elgin", state: "IL", stateName: "Illinois", population: 114797 },
    { name: "Elmhurst", state: "IL", stateName: "Illinois", population: 45171 },
    { name: "Evanston", state: "IL", stateName: "Illinois", population: 78443 },
    { name: "Freeport", state: "IL", stateName: "Illinois", population: 23561 },
    { name: "Galena", state: "IL", stateName: "Illinois", population: 3259 },
    { name: "Galesburg", state: "IL", stateName: "Illinois", population: 30437 },
    { name: "Glen Ellyn", state: "IL", stateName: "Illinois", population: 28366 },
    { name: "Glenview", state: "IL", stateName: "Illinois", population: 47240 },
    { name: "Granite City", state: "IL", stateName: "Illinois", population: 27906 },
    { name: "Harrisburg", state: "IL", stateName: "Illinois", population: 8961 },
    { name: "Herrin", state: "IL", stateName: "Illinois", population: 12666 },
    { name: "Highland Park", state: "IL", stateName: "Illinois", population: 30076 },
    { name: "Jacksonville", state: "IL", stateName: "Illinois", population: 18544 },
    { name: "Joliet", state: "IL", stateName: "Illinois", population: 150362 },
    { name: "Kankakee", state: "IL", stateName: "Illinois", population: 25833 },
    { name: "Kaskaskia", state: "IL", stateName: "Illinois", population: 14 },
    { name: "Kewanee", state: "IL", stateName: "Illinois", population: 12287 },
    { name: "La Salle", state: "IL", stateName: "Illinois", population: 9469 },
    { name: "Lake Forest", state: "IL", stateName: "Illinois", population: 19438 },
    { name: "Libertyville", state: "IL", stateName: "Illinois", population: 20416 },
    { name: "Lincoln", state: "IL", stateName: "Illinois", population: 13633 },
    { name: "Lisle", state: "IL", stateName: "Illinois", population: 23370 },
    { name: "Lombard", state: "IL", stateName: "Illinois", population: 43783 },
    { name: "Macomb", state: "IL", stateName: "Illinois", population: 18288 },
    { name: "Mattoon", state: "IL", stateName: "Illinois", population: 16251 },
    { name: "Moline", state: "IL", stateName: "Illinois", population: 42585 },
    { name: "Monmouth", state: "IL", stateName: "Illinois", population: 8978 },
    { name: "Mount Vernon", state: "IL", stateName: "Illinois", population: 14720 },
    { name: "Mundelein", state: "IL", stateName: "Illinois", population: 31464 },
    { name: "Naperville", state: "IL", stateName: "Illinois", population: 149540 },
    { name: "Nauvoo", state: "IL", stateName: "Illinois", population: 1147 },
    { name: "Normal", state: "IL", stateName: "Illinois", population: 52211 },
    { name: "North Chicago", state: "IL", stateName: "Illinois", population: 30494 },
    { name: "Oak Park", state: "IL", stateName: "Illinois", population: 54083 },
    { name: "Oregon", state: "IL", stateName: "Illinois", population: 3620 },
    { name: "Ottawa", state: "IL", stateName: "Illinois", population: 18768 },
    { name: "Palatine", state: "IL", stateName: "Illinois", population: 67432 },
    { name: "Park Forest", state: "IL", stateName: "Illinois", population: 21387 },
    { name: "Park Ridge", state: "IL", stateName: "Illinois", population: 38460 },
    { name: "Pekin", state: "IL", stateName: "Illinois", population: 31346 },
    { name: "Peoria", state: "IL", stateName: "Illinois", population: 113150 },
    { name: "Petersburg", state: "IL", stateName: "Illinois", population: 2280 },
    { name: "Pontiac", state: "IL", stateName: "Illinois", population: 11931 },
    { name: "Quincy", state: "IL", stateName: "Illinois", population: 39809 },
    { name: "Rantoul", state: "IL", stateName: "Illinois", population: 12371 },
    { name: "River Forest", state: "IL", stateName: "Illinois", population: 11201 },
    { name: "Rock Island", state: "IL", stateName: "Illinois", population: 37862 },
    { name: "Rockford", state: "IL", stateName: "Illinois", population: 148655 },
    { name: "Salem", state: "IL", stateName: "Illinois", population: 7079 },
    { name: "Shawneetown", state: "IL", stateName: "Illinois", population: 1139 },
    { name: "Skokie", state: "IL", stateName: "Illinois", population: 67100 },
    { name: "South Holland", state: "IL", stateName: "Illinois", population: 21645 },
    { name: "Springfield", state: "IL", stateName: "Illinois", population: 114394 },
    { name: "Streator", state: "IL", stateName: "Illinois", population: 12802 },
    { name: "Summit", state: "IL", stateName: "Illinois", population: 11061 },
    { name: "Urbana", state: "IL", stateName: "Illinois", population: 42146 },
    { name: "Vandalia", state: "IL", stateName: "Illinois", population: 7042 },
    { name: "Virden", state: "IL", stateName: "Illinois", population: 3235 },
    { name: "Waukegan", state: "IL", stateName: "Illinois", population: 89926 },
    { name: "Wheaton", state: "IL", stateName: "Illinois", population: 53970 },
    { name: "Wilmette", state: "IL", stateName: "Illinois", population: 27927 },
    { name: "Winnetka", state: "IL", stateName: "Illinois", population: 12887 },
    { name: "Wood River", state: "IL", stateName: "Illinois", population: 10275 },
    { name: "Zion", state: "IL", stateName: "Illinois", population: 24633 },
    
    // Indiana
    { name: "Anderson", state: "IN", stateName: "Indiana", population: 54478 },
    { name: "Bedford", state: "IN", stateName: "Indiana", population: 13413 },
    { name: "Bloomington", state: "IN", stateName: "Indiana", population: 84565 },
    { name: "Columbus", state: "IN", stateName: "Indiana", population: 50074 },
    { name: "Connersville", state: "IN", stateName: "Indiana", population: 13224 },
    { name: "Corydon", state: "IN", stateName: "Indiana", population: 3087 },
    { name: "Crawfordsville", state: "IN", stateName: "Indiana", population: 16306 },
    { name: "East Chicago", state: "IN", stateName: "Indiana", population: 26277 },
    { name: "Elkhart", state: "IN", stateName: "Indiana", population: 52656 },
    { name: "Elwood", state: "IN", stateName: "Indiana", population: 8440 },
    { name: "Evansville", state: "IN", stateName: "Indiana", population: 117298 },
    { name: "Fort Wayne", state: "IN", stateName: "Indiana", population: 263886 },
    { name: "French Lick", state: "IN", stateName: "Indiana", population: 1807 },
    { name: "Gary", state: "IN", stateName: "Indiana", population: 69593 },
    { name: "Geneva", state: "IN", stateName: "Indiana", population: 1293 },
    { name: "Goshen", state: "IN", stateName: "Indiana", population: 34115 },
    { name: "Greenfield", state: "IN", stateName: "Indiana", population: 23320 },
    { name: "Hammond", state: "IN", stateName: "Indiana", population: 77776 },
    { name: "Hobart", state: "IN", stateName: "Indiana", population: 29459 },
    { name: "Huntington", state: "IN", stateName: "Indiana", population: 17175 },
    { name: "Indianapolis", state: "IN", stateName: "Indiana", population: 887642 },
    { name: "Jeffersonville", state: "IN", stateName: "Indiana", population: 49536 },
    { name: "Kokomo", state: "IN", stateName: "Indiana", population: 59338 },
    { name: "Lafayette", state: "IN", stateName: "Indiana", population: 72177 },
    { name: "Madison", state: "IN", stateName: "Indiana", population: 12293 },
    { name: "Marion", state: "IN", stateName: "Indiana", population: 28020 },
    { name: "Michigan City", state: "IN", stateName: "Indiana", population: 31926 },
    { name: "Mishawaka", state: "IN", stateName: "Indiana", population: 50856 },
    { name: "Muncie", state: "IN", stateName: "Indiana", population: 65794 },
    { name: "Nappanee", state: "IN", stateName: "Indiana", population: 6768 },
    { name: "Nashville", state: "IN", stateName: "Indiana", population: 803 },
    { name: "New Albany", state: "IN", stateName: "Indiana", population: 37403 },
    { name: "New Castle", state: "IN", stateName: "Indiana", population: 17175 },
    { name: "New Harmony", state: "IN", stateName: "Indiana", population: 789 },
    { name: "Peru", state: "IN", stateName: "Indiana", population: 11417 },
    { name: "Plymouth", state: "IN", stateName: "Indiana", population: 10014 },
    { name: "Richmond", state: "IN", stateName: "Indiana", population: 35962 },
    { name: "Santa Claus", state: "IN", stateName: "Indiana", population: 2482 },
    { name: "Shelbyville", state: "IN", stateName: "Indiana", population: 19991 },
    { name: "South Bend", state: "IN", stateName: "Indiana", population: 103453 },
    { name: "Terre Haute", state: "IN", stateName: "Indiana", population: 58572 },
    { name: "Valparaiso", state: "IN", stateName: "Indiana", population: 33926 },
    { name: "Vincennes", state: "IN", stateName: "Indiana", population: 16671 },
    { name: "Wabash", state: "IN", stateName: "Indiana", population: 10266 },
    { name: "West Lafayette", state: "IN", stateName: "Indiana", population: 44938 },
    
    // Iowa
    { name: "Amana Colonies", state: "IA", stateName: "Iowa", population: 442 },
    { name: "Ames", state: "IA", stateName: "Iowa", population: 66358 },
    { name: "Boone", state: "IA", stateName: "Iowa", population: 12460 },
    { name: "Burlington", state: "IA", stateName: "Iowa", population: 23857 },
    { name: "Cedar Falls", state: "IA", stateName: "Iowa", population: 40713 },
    { name: "Cedar Rapids", state: "IA", stateName: "Iowa", population: 137710 },
    { name: "Charles City", state: "IA", stateName: "Iowa", population: 7417 },
    { name: "Cherokee", state: "IA", stateName: "Iowa", population: 5043 },
    { name: "Clinton", state: "IA", stateName: "Iowa", population: 24669 },
    { name: "Council Bluffs", state: "IA", stateName: "Iowa", population: 62830 },
    { name: "Davenport", state: "IA", stateName: "Iowa", population: 101724 },
    { name: "Des Moines", state: "IA", stateName: "Iowa", population: 214133 },
    { name: "Dubuque", state: "IA", stateName: "Iowa", population: 59467 },
    { name: "Estherville", state: "IA", stateName: "Iowa", population: 5680 },
    { name: "Fairfield", state: "IA", stateName: "Iowa", population: 9444 },
    { name: "Fort Dodge", state: "IA", stateName: "Iowa", population: 24146 },
    { name: "Grinnell", state: "IA", stateName: "Iowa", population: 9008 },
    { name: "Indianola", state: "IA", stateName: "Iowa", population: 15793 },
    { name: "Iowa City", state: "IA", stateName: "Iowa", population: 74898 },
    { name: "Keokuk", state: "IA", stateName: "Iowa", population: 10078 },
    { name: "Mason City", state: "IA", stateName: "Iowa", population: 27065 },
    { name: "Mount Pleasant", state: "IA", stateName: "Iowa", population: 8768 },
    { name: "Muscatine", state: "IA", stateName: "Iowa", population: 23868 },
    { name: "Newton", state: "IA", stateName: "Iowa", population: 15466 },
    { name: "Oskaloosa", state: "IA", stateName: "Iowa", population: 11558 },
    { name: "Ottumwa", state: "IA", stateName: "Iowa", population: 25429 },
    { name: "Sioux City", state: "IA", stateName: "Iowa", population: 82884 },
    { name: "Waterloo", state: "IA", stateName: "Iowa", population: 67684 },
    { name: "Webster City", state: "IA", stateName: "Iowa", population: 7925 },
    { name: "West Des Moines", state: "IA", stateName: "Iowa", population: 68723 },
    
    // Kansas
    { name: "Abilene", state: "KS", stateName: "Kansas", population: 6247 },
    { name: "Arkansas City", state: "KS", stateName: "Kansas", population: 11794 },
    { name: "Atchison", state: "KS", stateName: "Kansas", population: 10944 },
    { name: "Chanute", state: "KS", stateName: "Kansas", population: 9019 },
    { name: "Coffeyville", state: "KS", stateName: "Kansas", population: 9326 },
    { name: "Council Grove", state: "KS", stateName: "Kansas", population: 2172 },
    { name: "Dodge City", state: "KS", stateName: "Kansas", population: 28141 },
    { name: "Emporia", state: "KS", stateName: "Kansas", population: 24660 },
    { name: "Fort Scott", state: "KS", stateName: "Kansas", population: 7680 },
    { name: "Garden City", state: "KS", stateName: "Kansas", population: 28400 },
    { name: "Great Bend", state: "KS", stateName: "Kansas", population: 15106 },
    { name: "Hays", state: "KS", stateName: "Kansas", population: 21401 },
    { name: "Hutchinson", state: "KS", stateName: "Kansas", population: 40006 },
    { name: "Independence", state: "KS", stateName: "Kansas", population: 8717 },
    { name: "Junction City", state: "KS", stateName: "Kansas", population: 23153 },
    { name: "Kansas City", state: "KS", stateName: "Kansas", population: 156607 },
    { name: "Lawrence", state: "KS", stateName: "Kansas", population: 98726 },
    { name: "Leavenworth", state: "KS", stateName: "Kansas", population: 37175 },
    { name: "Liberal", state: "KS", stateName: "Kansas", population: 19825 },
    { name: "Manhattan", state: "KS", stateName: "Kansas", population: 54587 },
    { name: "McPherson", state: "KS", stateName: "Kansas", population: 13411 },
    { name: "Medicine Lodge", state: "KS", stateName: "Kansas", population: 2009 },
    { name: "Newton", state: "KS", stateName: "Kansas", population: 18810 },
    { name: "Olathe", state: "KS", stateName: "Kansas", population: 141290 },
    { name: "Osawatomie", state: "KS", stateName: "Kansas", population: 4324 },
    { name: "Ottawa", state: "KS", stateName: "Kansas", population: 12649 },
    { name: "Overland Park", state: "KS", stateName: "Kansas", population: 197238 },
    { name: "Pittsburg", state: "KS", stateName: "Kansas", population: 20333 },
    { name: "Salina", state: "KS", stateName: "Kansas", population: 46689 },
    { name: "Shawnee", state: "KS", stateName: "Kansas", population: 67737 },
    { name: "Smith Center", state: "KS", stateName: "Kansas", population: 1658 },
    { name: "Topeka", state: "KS", stateName: "Kansas", population: 126587 },
    { name: "Wichita", state: "KS", stateName: "Kansas", population: 397532 },
    
    // Kentucky
    { name: "Ashland", state: "KY", stateName: "Kentucky", population: 21411 },
    { name: "Barbourville", state: "KY", stateName: "Kentucky", population: 3150 },
    { name: "Bardstown", state: "KY", stateName: "Kentucky", population: 13315 },
    { name: "Berea", state: "KY", stateName: "Kentucky", population: 15721 },
    { name: "Boonesborough", state: "KY", stateName: "Kentucky", population: 0 },
    { name: "Bowling Green", state: "KY", stateName: "Kentucky", population: 72194 },
    { name: "Campbellsville", state: "KY", stateName: "Kentucky", population: 11401 },
    { name: "Covington", state: "KY", stateName: "Kentucky", population: 40720 },
    { name: "Danville", state: "KY", stateName: "Kentucky", population: 17294 },
    { name: "Elizabethtown", state: "KY", stateName: "Kentucky", population: 31283 },
    { name: "Frankfort", state: "KY", stateName: "Kentucky", population: 28002 },
    { name: "Harlan", state: "KY", stateName: "Kentucky", population: 1565 },
    { name: "Harrodsburg", state: "KY", stateName: "Kentucky", population: 8355 },
    { name: "Hazard", state: "KY", stateName: "Kentucky", population: 4961 },
    { name: "Henderson", state: "KY", stateName: "Kentucky", population: 28462 },
    { name: "Hodgenville", state: "KY", stateName: "Kentucky", population: 3206 },
    { name: "Hopkinsville", state: "KY", stateName: "Kentucky", population: 32132 },
    { name: "Lexington", state: "KY", stateName: "Kentucky", population: 322570 },
    { name: "Louisville", state: "KY", stateName: "Kentucky", population: 617638 },
    { name: "Mayfield", state: "KY", stateName: "Kentucky", population: 10017 },
    { name: "Maysville", state: "KY", stateName: "Kentucky", population: 8830 },
    { name: "Middlesboro", state: "KY", stateName: "Kentucky", population: 9690 },
    { name: "Newport", state: "KY", stateName: "Kentucky", population: 15073 },
    { name: "Owensboro", state: "KY", stateName: "Kentucky", population: 60061 },
    { name: "Paducah", state: "KY", stateName: "Kentucky", population: 25420 },
    { name: "Paris", state: "KY", stateName: "Kentucky", population: 10208 },
    { name: "Richmond", state: "KY", stateName: "Kentucky", population: 34585 },
    
    // Louisiana
    { name: "Abbeville", state: "LA", stateName: "Louisiana", population: 12257 },
    { name: "Alexandria", state: "LA", stateName: "Louisiana", population: 45434 },
    { name: "Bastrop", state: "LA", stateName: "Louisiana", population: 10065 },
    { name: "Baton Rouge", state: "LA", stateName: "Louisiana", population: 227470 },
    { name: "Bogalusa", state: "LA", stateName: "Louisiana", population: 11952 },
    { name: "Bossier City", state: "LA", stateName: "Louisiana", population: 68607 },
    { name: "Gretna", state: "LA", stateName: "Louisiana", population: 17736 },
    { name: "Houma", state: "LA", stateName: "Louisiana", population: 33227 },
    { name: "Lafayette", state: "LA", stateName: "Louisiana", population: 121374 },
    { name: "Lake Charles", state: "LA", stateName: "Louisiana", population: 78001 },
    { name: "Monroe", state: "LA", stateName: "Louisiana", population: 48015 },
    { name: "Morgan City", state: "LA", stateName: "Louisiana", population: 11512 },
    { name: "Natchitoches", state: "LA", stateName: "Louisiana", population: 18706 },
    { name: "New Iberia", state: "LA", stateName: "Louisiana", population: 28470 },
    { name: "New Orleans", state: "LA", stateName: "Louisiana", population: 390144 },
    { name: "Opelousas", state: "LA", stateName: "Louisiana", population: 15726 },
    { name: "Ruston", state: "LA", stateName: "Louisiana", population: 22241 },
    { name: "Saint Martinville", state: "LA", stateName: "Louisiana", population: 6136 },
    { name: "Shreveport", state: "LA", stateName: "Louisiana", population: 187593 },
    { name: "Thibodaux", state: "LA", stateName: "Louisiana", population: 15477 },
    
    // Maine
    { name: "Auburn", state: "ME", stateName: "Maine", population: 23395 },
    { name: "Augusta", state: "ME", stateName: "Maine", population: 18699 },
    { name: "Bangor", state: "ME", stateName: "Maine", population: 31652 },
    { name: "Bar Harbor", state: "ME", stateName: "Maine", population: 5505 },
    { name: "Bath", state: "ME", stateName: "Maine", population: 8353 },
    { name: "Belfast", state: "ME", stateName: "Maine", population: 6749 },
    { name: "Biddeford", state: "ME", stateName: "Maine", population: 21488 },
    { name: "Boothbay Harbor", state: "ME", stateName: "Maine", population: 2184 },
    { name: "Brunswick", state: "ME", stateName: "Maine", population: 20778 },
    { name: "Calais", state: "ME", stateName: "Maine", population: 3012 },
    { name: "Caribou", state: "ME", stateName: "Maine", population: 7620 },
    { name: "Castine", state: "ME", stateName: "Maine", population: 1309 },
    { name: "Eastport", state: "ME", stateName: "Maine", population: 1301 },
    { name: "Ellsworth", state: "ME", stateName: "Maine", population: 8384 },
    { name: "Farmington", state: "ME", stateName: "Maine", population: 7753 },
    { name: "Fort Kent", state: "ME", stateName: "Maine", population: 4097 },
    { name: "Gardiner", state: "ME", stateName: "Maine", population: 5756 },
    { name: "Houlton", state: "ME", stateName: "Maine", population: 6007 },
    { name: "Kennebunkport", state: "ME", stateName: "Maine", population: 1125 },
    { name: "Kittery", state: "ME", stateName: "Maine", population: 9781 },
    { name: "Lewiston", state: "ME", stateName: "Maine", population: 36117 },
    { name: "Lubec", state: "ME", stateName: "Maine", population: 1199 },
    { name: "Machias", state: "ME", stateName: "Maine", population: 2071 },
    { name: "Orono", state: "ME", stateName: "Maine", population: 10989 },
    { name: "Portland", state: "ME", stateName: "Maine", population: 68208 },
    { name: "Presque Isle", state: "ME", stateName: "Maine", population: 9092 },
    { name: "Rockland", state: "ME", stateName: "Maine", population: 7173 },
    { name: "Rumford", state: "ME", stateName: "Maine", population: 5741 },
    { name: "Saco", state: "ME", stateName: "Maine", population: 19532 },
    { name: "Scarborough", state: "ME", stateName: "Maine", population: 22135 },
    { name: "Waterville", state: "ME", stateName: "Maine", population: 15728 },
    { name: "York", state: "ME", stateName: "Maine", population: 13271 },
    
    // Maryland
    { name: "Aberdeen", state: "MD", stateName: "Maryland", population: 15958 },
    { name: "Annapolis", state: "MD", stateName: "Maryland", population: 40927 },
    { name: "Baltimore", state: "MD", stateName: "Maryland", population: 585708 },
    { name: "Bowie", state: "MD", stateName: "Maryland", population: 58729 },
    { name: "Cambridge", state: "MD", stateName: "Maryland", population: 12802 },
    { name: "College Park", state: "MD", stateName: "Maryland", population: 32026 },
    { name: "Columbia", state: "MD", stateName: "Maryland", population: 104400 },
    { name: "Cumberland", state: "MD", stateName: "Maryland", population: 19649 },
    { name: "Easton", state: "MD", stateName: "Maryland", population: 17292 },
    { name: "Elkton", state: "MD", stateName: "Maryland", population: 15993 },
    { name: "Frederick", state: "MD", stateName: "Maryland", population: 78838 },
    { name: "Hagerstown", state: "MD", stateName: "Maryland", population: 43077 },
    { name: "Laurel", state: "MD", stateName: "Maryland", population: 25874 },
    { name: "Ocean City", state: "MD", stateName: "Maryland", population: 6922 },
    { name: "Rockville", state: "MD", stateName: "Maryland", population: 67592 },
    { name: "Salisbury", state: "MD", stateName: "Maryland", population: 33266 },
    { name: "Silver Spring", state: "MD", stateName: "Maryland", population: 81577 },
    { name: "Towson", state: "MD", stateName: "Maryland", population: 59093 },
    { name: "Westminster", state: "MD", stateName: "Maryland", population: 18690 },
    
    // Massachusetts
    { name: "Boston", state: "MA", stateName: "Massachusetts", population: 695506 },
    { name: "Worcester", state: "MA", stateName: "Massachusetts", population: 206518 },
    { name: "Springfield", state: "MA", stateName: "Massachusetts", population: 155929 },
    { name: "Cambridge", state: "MA", stateName: "Massachusetts", population: 118977 },
    { name: "Lowell", state: "MA", stateName: "Massachusetts", population: 115554 },
    { name: "Brockton", state: "MA", stateName: "Massachusetts", population: 105643 },
    { name: "New Bedford", state: "MA", stateName: "Massachusetts", population: 95472 },
    { name: "Quincy", state: "MA", stateName: "Massachusetts", population: 101636 },
    { name: "Lynn", state: "MA", stateName: "Massachusetts", population: 101253 },
    { name: "Newton", state: "MA", stateName: "Massachusetts", population: 88211 },
    { name: "Framingham", state: "MA", stateName: "Massachusetts", population: 72800 },
    { name: "Waltham", state: "MA", stateName: "Massachusetts", population: 65760 },
    { name: "Malden", state: "MA", stateName: "Massachusetts", population: 66441 },
    { name: "Brookline", state: "MA", stateName: "Massachusetts", population: 63291 },
    { name: "Plymouth", state: "MA", stateName: "Massachusetts", population: 61469 },
    { name: "Medford", state: "MA", stateName: "Massachusetts", population: 59859 },
    { name: "Taunton", state: "MA", stateName: "Massachusetts", population: 59886 },
    { name: "Chicopee", state: "MA", stateName: "Massachusetts", population: 55440 },
    { name: "Weymouth", state: "MA", stateName: "Massachusetts", population: 57201 },
    { name: "Revere", state: "MA", stateName: "Massachusetts", population: 62086 },
    { name: "Peabody", state: "MA", stateName: "Massachusetts", population: 54721 },
    { name: "Methuen", state: "MA", stateName: "Massachusetts", population: 52717 },
    { name: "Barnstable", state: "MA", stateName: "Massachusetts", population: 45413 },
    { name: "Pittsfield", state: "MA", stateName: "Massachusetts", population: 43684 },
    { name: "Attleboro", state: "MA", stateName: "Massachusetts", population: 46461 },
    { name: "Everett", state: "MA", stateName: "Massachusetts", population: 49152 },
    { name: "Salem", state: "MA", stateName: "Massachusetts", population: 44480 },
    { name: "Westfield", state: "MA", stateName: "Massachusetts", population: 40734 },
    { name: "Leominster", state: "MA", stateName: "Massachusetts", population: 43782 },
    { name: "Fitchburg", state: "MA", stateName: "Massachusetts", population: 41027 },
    { name: "Beverly", state: "MA", stateName: "Massachusetts", population: 42529 },
    { name: "Holyoke", state: "MA", stateName: "Massachusetts", population: 40135 },
    { name: "Marlborough", state: "MA", stateName: "Massachusetts", population: 41179 },
    { name: "Woburn", state: "MA", stateName: "Massachusetts", population: 40320 },
    { name: "West Springfield", state: "MA", stateName: "Massachusetts", population: 28529 },
    { name: "Falmouth", state: "MA", stateName: "Massachusetts", population: 32444 },
    { name: "Chelmsford", state: "MA", stateName: "Massachusetts", population: 36699 },
    { name: "Natick", state: "MA", stateName: "Massachusetts", population: 37234 },
    { name: "Watertown", state: "MA", stateName: "Massachusetts", population: 35629 },
    { name: "Lexington", state: "MA", stateName: "Massachusetts", population: 34570 },
    { name: "Saugus", state: "MA", stateName: "Massachusetts", population: 28111 },
    { name: "Braintree", state: "MA", stateName: "Massachusetts", population: 39273 },
    { name: "Randolph", state: "MA", stateName: "Massachusetts", population: 34299 },
    { name: "Andover", state: "MA", stateName: "Massachusetts", population: 36569 },
    { name: "Wellesley", state: "MA", stateName: "Massachusetts", population: 29164 },
    { name: "Stoughton", state: "MA", stateName: "Massachusetts", population: 29114 },
    { name: "Northampton", state: "MA", stateName: "Massachusetts", population: 29571 },
    { name: "Haverhill", state: "MA", stateName: "Massachusetts", population: 67191 },
    { name: "Arlington", state: "MA", stateName: "Massachusetts", population: 46226 },
    { name: "Lawrence", state: "MA", stateName: "Massachusetts", population: 89143 },
    { name: "Gloucester", state: "MA", stateName: "Massachusetts", population: 30209 },
    { name: "Marblehead", state: "MA", stateName: "Massachusetts", population: 20337 },
    { name: "Dedham", state: "MA", stateName: "Massachusetts", population: 25721 },
    { name: "Melrose", state: "MA", stateName: "Massachusetts", population: 28817 },
    { name: "Milton", state: "MA", stateName: "Massachusetts", population: 28163 },
    { name: "Danvers", state: "MA", stateName: "Massachusetts", population: 28087 },
    { name: "Needham", state: "MA", stateName: "Massachusetts", population: 32139 },
    { name: "Norwood", state: "MA", stateName: "Massachusetts", population: 31612 },
    { name: "Tewksbury", state: "MA", stateName: "Massachusetts", population: 31129 },
    { name: "Winchester", state: "MA", stateName: "Massachusetts", population: 22827 },
    { name: "Waltham", state: "MA", stateName: "Massachusetts", population: 65760 },
    { name: "Reading", state: "MA", stateName: "Massachusetts", population: 25224 },
    { name: "Swampscott", state: "MA", stateName: "Massachusetts", population: 14644 },
    { name: "Burlington", state: "MA", stateName: "Massachusetts", population: 26946 },
    { name: "Concord", state: "MA", stateName: "Massachusetts", population: 18778 },
    { name: "Acton", state: "MA", stateName: "Massachusetts", population: 24391 },
    { name: "Sudbury", state: "MA", stateName: "Massachusetts", population: 18934 },
    { name: "Bedford", state: "MA", stateName: "Massachusetts", population: 14383 },
    { name: "Carlisle", state: "MA", stateName: "Massachusetts", population: 5315 },
    { name: "Lincoln", state: "MA", stateName: "Massachusetts", population: 6977 },
    { name: "Wayland", state: "MA", stateName: "Massachusetts", population: 13249 },
    { name: "Weston", state: "MA", stateName: "Massachusetts", population: 11704 },
    { name: "Dover", state: "MA", stateName: "Massachusetts", population: 6075 },
    { name: "Sherborn", state: "MA", stateName: "Massachusetts", population: 4285 },
    { name: "Ashland", state: "MA", stateName: "Massachusetts", population: 17593 },
    { name: "Hopkinton", state: "MA", stateName: "Massachusetts", population: 18974 },
    { name: "Holliston", state: "MA", stateName: "Massachusetts", population: 15081 },
    { name: "Framingham", state: "MA", stateName: "Massachusetts", population: 72800 },
    { name: "Natick", state: "MA", stateName: "Massachusetts", population: 37234 },
    { name: "Wellesley", state: "MA", stateName: "Massachusetts", population: 29164 },
    { name: "Needham", state: "MA", stateName: "Massachusetts", population: 32139 },
    { name: "Newton", state: "MA", stateName: "Massachusetts", population: 88211 },
    { name: "Brookline", state: "MA", stateName: "Massachusetts", population: 63291 },
    { name: "Watertown", state: "MA", stateName: "Massachusetts", population: 35629 },
    { name: "Belmont", state: "MA", stateName: "Massachusetts", population: 27295 },
    { name: "Waltham", state: "MA", stateName: "Massachusetts", population: 65760 },
    { name: "Lexington", state: "MA", stateName: "Massachusetts", population: 34570 },
    { name: "Arlington", state: "MA", stateName: "Massachusetts", population: 46226 },
    { name: "Somerville", state: "MA", stateName: "Massachusetts", population: 81460 },
    { name: "Cambridge", state: "MA", stateName: "Massachusetts", population: 118977 },
    { name: "Boston", state: "MA", stateName: "Massachusetts", population: 695506 },
    
    // Alabama
    { name: "Birmingham", state: "AL", stateName: "Alabama", population: 200733 },
    { name: "Montgomery", state: "AL", stateName: "Alabama", population: 200022 },
    { name: "Mobile", state: "AL", stateName: "Alabama", population: 187041 },
    { name: "Huntsville", state: "AL", stateName: "Alabama", population: 215006 },
    { name: "Tuscaloosa", state: "AL", stateName: "Alabama", population: 100618 },
    { name: "Hoover", state: "AL", stateName: "Alabama", population: 92101 },
    { name: "Dothan", state: "AL", stateName: "Alabama", population: 71072 },
    { name: "Auburn", state: "AL", stateName: "Alabama", population: 76014 },
    { name: "Decatur", state: "AL", stateName: "Alabama", population: 54341 },
    { name: "Madison", state: "AL", stateName: "Alabama", population: 56001 },
    { name: "Florence", state: "AL", stateName: "Alabama", population: 40484 },
    { name: "Gadsden", state: "AL", stateName: "Alabama", population: 35241 },
    { name: "Vestavia Hills", state: "AL", stateName: "Alabama", population: 34433 },
    { name: "Prattville", state: "AL", stateName: "Alabama", population: 37581 },
    { name: "Phenix City", state: "AL", stateName: "Alabama", population: 38067 },
    { name: "Opelika", state: "AL", stateName: "Alabama", population: 30275 },
    { name: "Anniston", state: "AL", stateName: "Alabama", population: 21654 },
    { name: "Prichard", state: "AL", stateName: "Alabama", population: 19681 },
    { name: "Bessemer", state: "AL", stateName: "Alabama", population: 26019 },
    { name: "Homewood", state: "AL", stateName: "Alabama", population: 26014 },
    { name: "Northport", state: "AL", stateName: "Alabama", population: 31229 },
    { name: "Trussville", state: "AL", stateName: "Alabama", population: 26017 },
    { name: "Mountain Brook", state: "AL", stateName: "Alabama", population: 20135 },
    { name: "Enterprise", state: "AL", stateName: "Alabama", population: 28593 },
    { name: "Athens", state: "AL", stateName: "Alabama", population: 26247 },
    { name: "Selma", state: "AL", stateName: "Alabama", population: 17240 },
    { name: "Oxford", state: "AL", stateName: "Alabama", population: 22069 },
    { name: "Albertville", state: "AL", stateName: "Alabama", population: 22386 },
    { name: "Scottsboro", state: "AL", stateName: "Alabama", population: 14857 },
    { name: "Fort Payne", state: "AL", stateName: "Alabama", population: 14012 },
    { name: "Cullman", state: "AL", stateName: "Alabama", population: 18013 },
    { name: "Jasper", state: "AL", stateName: "Alabama", population: 14052 },
    { name: "Troy", state: "AL", stateName: "Alabama", population: 18933 },
    { name: "Eufaula", state: "AL", stateName: "Alabama", population: 12882 },
    { name: "Andalusia", state: "AL", stateName: "Alabama", population: 8840 },
    { name: "Demopolis", state: "AL", stateName: "Alabama", population: 7208 },
    { name: "Alexander City", state: "AL", stateName: "Alabama", population: 14875 },
    { name: "Guntersville", state: "AL", stateName: "Alabama", population: 8338 },
    { name: "Talladega", state: "AL", stateName: "Alabama", population: 15424 },
    { name: "Sylacauga", state: "AL", stateName: "Alabama", population: 12032 },
    { name: "Sheffield", state: "AL", stateName: "Alabama", population: 9038 },
    { name: "Tuscumbia", state: "AL", stateName: "Alabama", population: 9114 },
    { name: "Tuskegee", state: "AL", stateName: "Alabama", population: 8085 },
    { name: "Marion", state: "AL", stateName: "Alabama", population: 3194 },
    { name: "Greenville", state: "AL", stateName: "Alabama", population: 7134 },
    { name: "Chickasaw", state: "AL", stateName: "Alabama", population: 6106 },
    { name: "Clanton", state: "AL", stateName: "Alabama", population: 8901 },
    { name: "Ozark", state: "AL", stateName: "Alabama", population: 14265 },

    // Alaska
    { name: "Anchorage", state: "AK", stateName: "Alaska", population: 291247 },
    { name: "Fairbanks", state: "AK", stateName: "Alaska", population: 32515 },
    { name: "Juneau", state: "AK", stateName: "Alaska", population: 32255 },
    { name: "Sitka", state: "AK", stateName: "Alaska", population: 8440 },
    { name: "Ketchikan", state: "AK", stateName: "Alaska", population: 8192 },
    { name: "Wasilla", state: "AK", stateName: "Alaska", population: 11047 },
    { name: "Kenai", state: "AK", stateName: "Alaska", population: 7798 },
    { name: "Kodiak", state: "AK", stateName: "Alaska", population: 6130 },
    { name: "Bethel", state: "AK", stateName: "Alaska", population: 6540 },
    { name: "Palmer", state: "AK", stateName: "Alaska", population: 5937 },
    { name: "Homer", state: "AK", stateName: "Alaska", population: 5539 },
    { name: "Barrow", state: "AK", stateName: "Alaska", population: 4212 },
    { name: "Nome", state: "AK", stateName: "Alaska", population: 3866 },
    { name: "Kotzebue", state: "AK", stateName: "Alaska", population: 3201 },
    { name: "Unalaska", state: "AK", stateName: "Alaska", population: 4356 },
    { name: "Valdez", state: "AK", stateName: "Alaska", population: 3855 },
    { name: "Seward", state: "AK", stateName: "Alaska", population: 2693 },
    { name: "Cordova", state: "AK", stateName: "Alaska", population: 2259 },
    { name: "Haines", state: "AK", stateName: "Alaska", population: 1715 },
    { name: "Skagway", state: "AK", stateName: "Alaska", population: 1083 },

    // Arkansas
    { name: "Little Rock", state: "AR", stateName: "Arkansas", population: 202591 },
    { name: "Fort Smith", state: "AR", stateName: "Arkansas", population: 89942 },
    { name: "Fayetteville", state: "AR", stateName: "Arkansas", population: 95230 },
    { name: "Springdale", state: "AR", stateName: "Arkansas", population: 84203 },
    { name: "Jonesboro", state: "AR", stateName: "Arkansas", population: 78258 },
    { name: "North Little Rock", state: "AR", stateName: "Arkansas", population: 66041 },
    { name: "Conway", state: "AR", stateName: "Arkansas", population: 67053 },
    { name: "Rogers", state: "AR", stateName: "Arkansas", population: 69908 },
    { name: "Pine Bluff", state: "AR", stateName: "Arkansas", population: 41053 },
    { name: "Bentonville", state: "AR", stateName: "Arkansas", population: 54032 },
    { name: "Hot Springs", state: "AR", stateName: "Arkansas", population: 37193 },
    { name: "Texarkana", state: "AR", stateName: "Arkansas", population: 29919 },
    { name: "Sherwood", state: "AR", stateName: "Arkansas", population: 32008 },
    { name: "Jacksonville", state: "AR", stateName: "Arkansas", population: 29067 },
    { name: "Russellville", state: "AR", stateName: "Arkansas", population: 28940 },
    { name: "Bella Vista", state: "AR", stateName: "Arkansas", population: 30004 },
    { name: "Paragould", state: "AR", stateName: "Arkansas", population: 29037 },
    { name: "Cabot", state: "AR", stateName: "Arkansas", population: 26352 },
    { name: "Searcy", state: "AR", stateName: "Arkansas", population: 23250 },
    { name: "Van Buren", state: "AR", stateName: "Arkansas", population: 23409 },
    { name: "El Dorado", state: "AR", stateName: "Arkansas", population: 17855 },
    { name: "Batesville", state: "AR", stateName: "Arkansas", population: 11533 },
    { name: "Blytheville", state: "AR", stateName: "Arkansas", population: 13784 },
    { name: "Harrison", state: "AR", stateName: "Arkansas", population: 13128 },
    { name: "Mountain Home", state: "AR", stateName: "Arkansas", population: 12590 },
    { name: "Helena", state: "AR", stateName: "Arkansas", population: 10057 },
    { name: "Camden", state: "AR", stateName: "Arkansas", population: 10138 },
    { name: "Magnolia", state: "AR", stateName: "Arkansas", population: 11062 },
    { name: "Arkadelphia", state: "AR", stateName: "Arkansas", population: 10114 },
    { name: "Malvern", state: "AR", stateName: "Arkansas", population: 10318 },
    { name: "Stuttgart", state: "AR", stateName: "Arkansas", population: 8860 },
    { name: "Forrest City", state: "AR", stateName: "Arkansas", population: 14078 },
    { name: "Osceola", state: "AR", stateName: "Arkansas", population: 6658 },
    { name: "Newport", state: "AR", stateName: "Arkansas", population: 7994 },
    { name: "Crossett", state: "AR", stateName: "Arkansas", population: 5047 },
    { name: "Hope", state: "AR", stateName: "Arkansas", population: 10020 },
    { name: "Morrilton", state: "AR", stateName: "Arkansas", population: 6767 },
    { name: "West Memphis", state: "AR", stateName: "Arkansas", population: 24670 },
    { name: "Arkansas Post", state: "AR", stateName: "Arkansas", population: 0 },

    // Connecticut
    { name: "Bridgeport", state: "CT", stateName: "Connecticut", population: 148654 },
    { name: "New Haven", state: "CT", stateName: "Connecticut", population: 134023 },
    { name: "Hartford", state: "CT", stateName: "Connecticut", population: 121054 },
    { name: "Stamford", state: "CT", stateName: "Connecticut", population: 135470 },
    { name: "Waterbury", state: "CT", stateName: "Connecticut", population: 114403 },
    { name: "Norwalk", state: "CT", stateName: "Connecticut", population: 91238 },
    { name: "Danbury", state: "CT", stateName: "Connecticut", population: 84656 },
    { name: "New Britain", state: "CT", stateName: "Connecticut", population: 74006 },
    { name: "West Hartford", state: "CT", stateName: "Connecticut", population: 63268 },
    { name: "Greenwich", state: "CT", stateName: "Connecticut", population: 63399 },
    { name: "Hamden", state: "CT", stateName: "Connecticut", population: 61407 },
    { name: "Meriden", state: "CT", stateName: "Connecticut", population: 60868 },
    { name: "Bristol", state: "CT", stateName: "Connecticut", population: 60035 },
    { name: "Manchester", state: "CT", stateName: "Connecticut", population: 57713 },
    { name: "West Haven", state: "CT", stateName: "Connecticut", population: 55584 },
    { name: "Milford", state: "CT", stateName: "Connecticut", population: 54584 },
    { name: "Stratford", state: "CT", stateName: "Connecticut", population: 51984 },
    { name: "East Hartford", state: "CT", stateName: "Connecticut", population: 51324 },
    { name: "Middletown", state: "CT", stateName: "Connecticut", population: 47648 },
    { name: "Norwich", state: "CT", stateName: "Connecticut", population: 40493 },
    { name: "Shelton", state: "CT", stateName: "Connecticut", population: 40987 },
    { name: "Torrington", state: "CT", stateName: "Connecticut", population: 35015 },
    { name: "New London", state: "CT", stateName: "Connecticut", population: 27045 },
    { name: "Ansonia", state: "CT", stateName: "Connecticut", population: 18922 },
    { name: "Derby", state: "CT", stateName: "Connecticut", population: 12415 },
    { name: "Groton", state: "CT", stateName: "Connecticut", population: 20401 },
    { name: "Naugatuck", state: "CT", stateName: "Connecticut", population: 31229 },
    { name: "Southington", state: "CT", stateName: "Connecticut", population: 43501 },
    { name: "Wallingford", state: "CT", stateName: "Connecticut", population: 44496 },
    { name: "Windsor", state: "CT", stateName: "Connecticut", population: 29044 },
    { name: "Windsor Locks", state: "CT", stateName: "Connecticut", population: 12749 },
    { name: "Winsted", state: "CT", stateName: "Connecticut", population: 7226 },
    { name: "Berlin", state: "CT", stateName: "Connecticut", population: 19866 },
    { name: "Bloomfield", state: "CT", stateName: "Connecticut", population: 21173 },
    { name: "Branford", state: "CT", stateName: "Connecticut", population: 28026 },
    { name: "Coventry", state: "CT", stateName: "Connecticut", population: 12380 },
    { name: "Darien", state: "CT", stateName: "Connecticut", population: 21692 },
    { name: "East Haven", state: "CT", stateName: "Connecticut", population: 27157 },
    { name: "Enfield", state: "CT", stateName: "Connecticut", population: 42041 },
    { name: "Fairfield", state: "CT", stateName: "Connecticut", population: 62500 },
    { name: "Farmington", state: "CT", stateName: "Connecticut", population: 25624 },
    { name: "Glastonbury", state: "CT", stateName: "Connecticut", population: 35459 },
    { name: "Guilford", state: "CT", stateName: "Connecticut", population: 22075 },
    { name: "Lebanon", state: "CT", stateName: "Connecticut", population: 7280 },
    { name: "Litchfield", state: "CT", stateName: "Connecticut", population: 1236 },
    { name: "Mansfield", state: "CT", stateName: "Connecticut", population: 25648 },
    { name: "Mystic", state: "CT", stateName: "Connecticut", population: 0 },
    { name: "New Canaan", state: "CT", stateName: "Connecticut", population: 20253 },
    { name: "North Haven", state: "CT", stateName: "Connecticut", population: 24127 },
    { name: "Old Saybrook", state: "CT", stateName: "Connecticut", population: 10242 },
    { name: "Orange", state: "CT", stateName: "Connecticut", population: 13956 },
    { name: "Seymour", state: "CT", stateName: "Connecticut", population: 16323 },
    { name: "Simsbury", state: "CT", stateName: "Connecticut", population: 25017 },
    { name: "South Windsor", state: "CT", stateName: "Connecticut", population: 26017 },
    { name: "Trumbull", state: "CT", stateName: "Connecticut", population: 36018 },
    { name: "Vernon", state: "CT", stateName: "Connecticut", population: 29031 },
    { name: "Waterford", state: "CT", stateName: "Connecticut", population: 19428 },
    { name: "Watertown", state: "CT", stateName: "Connecticut", population: 22015 },
    { name: "Westport", state: "CT", stateName: "Connecticut", population: 28141 },
    { name: "Wethersfield", state: "CT", stateName: "Connecticut", population: 27098 },
    { name: "Willimantic", state: "CT", stateName: "Connecticut", population: 0 },
    { name: "Windham", state: "CT", stateName: "Connecticut", population: 0 },

    // Delaware
    { name: "Wilmington", state: "DE", stateName: "Delaware", population: 70851 },
    { name: "Dover", state: "DE", stateName: "Delaware", population: 38079 },
    { name: "Newark", state: "DE", stateName: "Delaware", population: 31454 },
    { name: "Middletown", state: "DE", stateName: "Delaware", population: 22938 },
    { name: "Smyrna", state: "DE", stateName: "Delaware", population: 11480 },
    { name: "Milford", state: "DE", stateName: "Delaware", population: 11490 },
    { name: "Seaford", state: "DE", stateName: "Delaware", population: 7897 },
    { name: "Georgetown", state: "DE", stateName: "Delaware", population: 7074 },
    { name: "Lewes", state: "DE", stateName: "Delaware", population: 3277 },
    { name: "New Castle", state: "DE", stateName: "Delaware", population: 5285 },

    // Hawaii
    { name: "Honolulu", state: "HI", stateName: "Hawaii", population: 350964 },
    { name: "Pearl City", state: "HI", stateName: "Hawaii", population: 47698 },
    { name: "Hilo", state: "HI", stateName: "Hawaii", population: 43263 },
    { name: "Kailua", state: "HI", stateName: "Hawaii", population: 38256 },
    { name: "Kaneohe", state: "HI", stateName: "Hawaii", population: 34597 },
    { name: "Waipahu", state: "HI", stateName: "Hawaii", population: 43343 },
    { name: "Kailua-Kona", state: "HI", stateName: "Hawaii", population: 12000 },
    { name: "Kahului", state: "HI", stateName: "Hawaii", population: 26455 },
    { name: "Kihei", state: "HI", stateName: "Hawaii", population: 20801 },
    { name: "Lihue", state: "HI", stateName: "Hawaii", population: 6474 },
    { name: "Wailuku", state: "HI", stateName: "Hawaii", population: 15256 },
    { name: "Kapaa", state: "HI", stateName: "Hawaii", population: 10699 },
    { name: "Ewa Beach", state: "HI", stateName: "Hawaii", population: 15000 },
    { name: "Mililani", state: "HI", stateName: "Hawaii", population: 28000 },
    { name: "Hanalei", state: "HI", stateName: "Hawaii", population: 450 },
    { name: "Honaunau", state: "HI", stateName: "Hawaii", population: 0 },
    { name: "Kawaihae", state: "HI", stateName: "Hawaii", population: 0 },
    { name: "Lahaina", state: "HI", stateName: "Hawaii", population: 0 },
    { name: "Laie", state: "HI", stateName: "Hawaii", population: 0 },
    { name: "Wahiawa", state: "HI", stateName: "Hawaii", population: 0 },
    { name: "Waimea", state: "HI", stateName: "Hawaii", population: 0 },

    // Idaho
    { name: "Boise", state: "ID", stateName: "Idaho", population: 228790 },
    { name: "Nampa", state: "ID", stateName: "Idaho", population: 100200 },
    { name: "Meridian", state: "ID", stateName: "Idaho", population: 117635 },
    { name: "Idaho Falls", state: "ID", stateName: "Idaho", population: 64718 },
    { name: "Pocatello", state: "ID", stateName: "Idaho", population: 56746 },
    { name: "Caldwell", state: "ID", stateName: "Idaho", population: 56747 },
    { name: "Coeur d'Alene", state: "ID", stateName: "Idaho", population: 55097 },
    { name: "Twin Falls", state: "ID", stateName: "Idaho", population: 51230 },
    { name: "Lewiston", state: "ID", stateName: "Idaho", population: 33606 },
    { name: "Post Falls", state: "ID", stateName: "Idaho", population: 38085 },
    { name: "Rexburg", state: "ID", stateName: "Idaho", population: 35832 },
    { name: "Eagle", state: "ID", stateName: "Idaho", population: 30037 },
    { name: "Chubbuck", state: "ID", stateName: "Idaho", population: 15268 },
    { name: "Ammon", state: "ID", stateName: "Idaho", population: 16331 },
    { name: "Hayden", state: "ID", stateName: "Idaho", population: 15070 },
    { name: "Mountain Home", state: "ID", stateName: "Idaho", population: 14324 },
    { name: "Kuna", state: "ID", stateName: "Idaho", population: 24011 },
    { name: "Moscow", state: "ID", stateName: "Idaho", population: 25035 },
    { name: "Garden City", state: "ID", stateName: "Idaho", population: 12039 },
    { name: "Emmett", state: "ID", stateName: "Idaho", population: 7077 },
    { name: "Rathdrum", state: "ID", stateName: "Idaho", population: 10081 },
    { name: "Blackfoot", state: "ID", stateName: "Idaho", population: 11936 },
    { name: "Sandpoint", state: "ID", stateName: "Idaho", population: 8765 },
    { name: "Jerome", state: "ID", stateName: "Idaho", population: 11469 },
    { name: "Payette", state: "ID", stateName: "Idaho", population: 7739 },
    { name: "Burley", state: "ID", stateName: "Idaho", population: 10409 },
    { name: "Preston", state: "ID", stateName: "Idaho", population: 5208 },
    { name: "Rigby", state: "ID", stateName: "Idaho", population: 4108 },
    { name: "Rupert", state: "ID", stateName: "Idaho", population: 5946 },
    { name: "Weiser", state: "ID", stateName: "Idaho", population: 5507 },
    { name: "Idaho City", state: "ID", stateName: "Idaho", population: 485 },
    { name: "Bonners Ferry", state: "ID", stateName: "Idaho", population: 2538 },
    { name: "Kellogg", state: "ID", stateName: "Idaho", population: 2080 },
    { name: "Priest River", state: "ID", stateName: "Idaho", population: 1747 },
    { name: "Sun Valley", state: "ID", stateName: "Idaho", population: 1406 },

    // Iowa
    { name: "Des Moines", state: "IA", stateName: "Iowa", population: 214133 },
    { name: "Cedar Rapids", state: "IA", stateName: "Iowa", population: 137710 },
    { name: "Davenport", state: "IA", stateName: "Iowa", population: 101724 },
    { name: "Sioux City", state: "IA", stateName: "Iowa", population: 82804 },
    { name: "Iowa City", state: "IA", stateName: "Iowa", population: 74828 },
    { name: "Waterloo", state: "IA", stateName: "Iowa", population: 67098 },
    { name: "Council Bluffs", state: "IA", stateName: "Iowa", population: 62166 },
    { name: "Ames", state: "IA", stateName: "Iowa", population: 66305 },
    { name: "West Des Moines", state: "IA", stateName: "Iowa", population: 68798 },
    { name: "Dubuque", state: "IA", stateName: "Iowa", population: 57937 },
    { name: "Ankeny", state: "IA", stateName: "Iowa", population: 67887 },
    { name: "Urbandale", state: "IA", stateName: "Iowa", population: 45080 },
    { name: "Cedar Falls", state: "IA", stateName: "Iowa", population: 40714 },
    { name: "Marion", state: "IA", stateName: "Iowa", population: 39922 },
    { name: "Bettendorf", state: "IA", stateName: "Iowa", population: 39002 },
    { name: "Mason City", state: "IA", stateName: "Iowa", population: 27074 },
    { name: "Marshalltown", state: "IA", stateName: "Iowa", population: 27091 },
    { name: "Clinton", state: "IA", stateName: "Iowa", population: 24855 },
    { name: "Burlington", state: "IA", stateName: "Iowa", population: 24530 },
    { name: "Ottumwa", state: "IA", stateName: "Iowa", population: 25023 },
    { name: "Fort Dodge", state: "IA", stateName: "Iowa", population: 24162 },
    { name: "Muscatine", state: "IA", stateName: "Iowa", population: 23968 },
    { name: "Coralville", state: "IA", stateName: "Iowa", population: 22018 },
    { name: "Johnston", state: "IA", stateName: "Iowa", population: 24064 },
    { name: "North Liberty", state: "IA", stateName: "Iowa", population: 20479 },
    { name: "Indianola", state: "IA", stateName: "Iowa", population: 15792 },
    { name: "Altoona", state: "IA", stateName: "Iowa", population: 19650 },
    { name: "Pella", state: "IA", stateName: "Iowa", population: 10591 },
    { name: "Newton", state: "IA", stateName: "Iowa", population: 15054 },
    { name: "Grinnell", state: "IA", stateName: "Iowa", population: 9143 },
    { name: "Amana Colonies", state: "IA", stateName: "Iowa", population: 0 },
    { name: "Boone", state: "IA", stateName: "Iowa", population: 12460 },
    { name: "Charles City", state: "IA", stateName: "Iowa", population: 7426 },
    { name: "Cherokee", state: "IA", stateName: "Iowa", population: 5049 },
    { name: "Estherville", state: "IA", stateName: "Iowa", population: 5994 },
    { name: "Fairfield", state: "IA", stateName: "Iowa", population: 10363 },
    { name: "Keokuk", state: "IA", stateName: "Iowa", population: 10078 },
    { name: "Mount Pleasant", state: "IA", stateName: "Iowa", population: 8751 },
    { name: "Oskaloosa", state: "IA", stateName: "Iowa", population: 11558 },
    { name: "Webster City", state: "IA", stateName: "Iowa", population: 7800 },

    // Louisiana
    { name: "New Orleans", state: "LA", stateName: "Louisiana", population: 383997 },
    { name: "Baton Rouge", state: "LA", stateName: "Louisiana", population: 227470 },
    { name: "Shreveport", state: "LA", stateName: "Louisiana", population: 187593 },
    { name: "Lafayette", state: "LA", stateName: "Louisiana", population: 121374 },
    { name: "Lake Charles", state: "LA", stateName: "Louisiana", population: 78000 },
    { name: "Kenner", state: "LA", stateName: "Louisiana", population: 66000 },
    { name: "Bossier City", state: "LA", stateName: "Louisiana", population: 68000 },
    { name: "Monroe", state: "LA", stateName: "Louisiana", population: 48000 },
    { name: "Alexandria", state: "LA", stateName: "Louisiana", population: 45000 },
    { name: "Houma", state: "LA", stateName: "Louisiana", population: 33000 },
    { name: "Marrero", state: "LA", stateName: "Louisiana", population: 32000 },
    { name: "Central", state: "LA", stateName: "Louisiana", population: 28000 },
    { name: "Ruston", state: "LA", stateName: "Louisiana", population: 22000 },
    { name: "Opelousas", state: "LA", stateName: "Louisiana", population: 16000 },
    { name: "Sulphur", state: "LA", stateName: "Louisiana", population: 20000 },
    { name: "Laplace", state: "LA", stateName: "Louisiana", population: 29000 },
    { name: "Slidell", state: "LA", stateName: "Louisiana", population: 28000 },
    { name: "Pineville", state: "LA", stateName: "Louisiana", population: 15000 },
    { name: "Natchitoches", state: "LA", stateName: "Louisiana", population: 18000 },
    { name: "Gretna", state: "LA", stateName: "Louisiana", population: 18000 },
    { name: "Bastrop", state: "LA", stateName: "Louisiana", population: 10000 },
    { name: "Bogalusa", state: "LA", stateName: "Louisiana", population: 12000 },
    { name: "Morgan City", state: "LA", stateName: "Louisiana", population: 12000 },
    { name: "New Iberia", state: "LA", stateName: "Louisiana", population: 30000 },
    { name: "Thibodaux", state: "LA", stateName: "Louisiana", population: 15000 },
    { name: "Saint Martinville", state: "LA", stateName: "Louisiana", population: 6000 },
    { name: "Abbeville", state: "LA", stateName: "Louisiana", population: 12000 },

    // Maine
    { name: "Portland", state: "ME", stateName: "Maine", population: 68000 },
    { name: "Lewiston", state: "ME", stateName: "Maine", population: 36000 },
    { name: "Bangor", state: "ME", stateName: "Maine", population: 31000 },
    { name: "South Portland", state: "ME", stateName: "Maine", population: 25000 },
    { name: "Auburn", state: "ME", stateName: "Maine", population: 23000 },
    { name: "Biddeford", state: "ME", stateName: "Maine", population: 21000 },
    { name: "Sanford", state: "ME", stateName: "Maine", population: 21000 },
    { name: "Saco", state: "ME", stateName: "Maine", population: 19000 },
    { name: "Augusta", state: "ME", stateName: "Maine", population: 18000 },
    { name: "Westbrook", state: "ME", stateName: "Maine", population: 18000 },
    { name: "Waterville", state: "ME", stateName: "Maine", population: 16000 },
    { name: "Presque Isle", state: "ME", stateName: "Maine", population: 9000 },
    { name: "Bath", state: "ME", stateName: "Maine", population: 8000 },
    { name: "Ellsworth", state: "ME", stateName: "Maine", population: 8000 },
    { name: "Old Orchard Beach", state: "ME", stateName: "Maine", population: 9000 },
    { name: "Caribou", state: "ME", stateName: "Maine", population: 8000 },
    { name: "Eastport", state: "ME", stateName: "Maine", population: 1000 },
    { name: "Fort Kent", state: "ME", stateName: "Maine", population: 4000 },
    { name: "Houlton", state: "ME", stateName: "Maine", population: 6000 },
    { name: "Machias", state: "ME", stateName: "Maine", population: 2000 },
    { name: "Orono", state: "ME", stateName: "Maine", population: 11000 },
    { name: "Rockland", state: "ME", stateName: "Maine", population: 7000 },
    { name: "Rumford", state: "ME", stateName: "Maine", population: 6000 },
    { name: "Scarborough", state: "ME", stateName: "Maine", population: 21000 },
    { name: "Bar Harbor", state: "ME", stateName: "Maine", population: 5000 },
    { name: "Belfast", state: "ME", stateName: "Maine", population: 7000 },
    { name: "Boothbay Harbor", state: "ME", stateName: "Maine", population: 2000 },
    { name: "Brunswick", state: "ME", stateName: "Maine", population: 20000 },
    { name: "Calais", state: "ME", stateName: "Maine", population: 3000 },
    { name: "Castine", state: "ME", stateName: "Maine", population: 1000 },
    { name: "Farmington", state: "ME", stateName: "Maine", population: 7000 },
    { name: "Gardiner", state: "ME", stateName: "Maine", population: 6000 },
    { name: "Kennebunkport", state: "ME", stateName: "Maine", population: 1000 },
    { name: "Kittery", state: "ME", stateName: "Maine", population: 10000 },
    { name: "Lubec", state: "ME", stateName: "Maine", population: 1000 },
    { name: "York", state: "ME", stateName: "Maine", population: 13000 },

    // Mississippi
    { name: "Jackson", state: "MS", stateName: "Mississippi", population: 153701 },
    { name: "Gulfport", state: "MS", stateName: "Mississippi", population: 72000 },
    { name: "Southaven", state: "MS", stateName: "Mississippi", population: 54000 },
    { name: "Hattiesburg", state: "MS", stateName: "Mississippi", population: 48000 },
    { name: "Biloxi", state: "MS", stateName: "Mississippi", population: 46000 },
    { name: "Meridian", state: "MS", stateName: "Mississippi", population: 36000 },
    { name: "Tupelo", state: "MS", stateName: "Mississippi", population: 38000 },
    { name: "Greenville", state: "MS", stateName: "Mississippi", population: 30000 },
    { name: "Olive Branch", state: "MS", stateName: "Mississippi", population: 39000 },
    { name: "Clinton", state: "MS", stateName: "Mississippi", population: 25000 },
    { name: "Madison", state: "MS", stateName: "Mississippi", population: 27000 },
    { name: "Pearl", state: "MS", stateName: "Mississippi", population: 26000 },
    { name: "Ridgeland", state: "MS", stateName: "Mississippi", population: 24000 },
    { name: "Starkville", state: "MS", stateName: "Mississippi", population: 25000 },
    { name: "Columbus", state: "MS", stateName: "Mississippi", population: 23000 },
    { name: "Vicksburg", state: "MS", stateName: "Mississippi", population: 22000 },
    { name: "Pascagoula", state: "MS", stateName: "Mississippi", population: 22000 },
    { name: "Greenwood", state: "MS", stateName: "Mississippi", population: 15000 },
    { name: "Oxford", state: "MS", stateName: "Mississippi", population: 28000 },
    { name: "Bay Saint Louis", state: "MS", stateName: "Mississippi", population: 10000 },
    { name: "Canton", state: "MS", stateName: "Mississippi", population: 13000 },
    { name: "Clarksdale", state: "MS", stateName: "Mississippi", population: 15000 },
    { name: "Columbia", state: "MS", stateName: "Mississippi", population: 6000 },
    { name: "Corinth", state: "MS", stateName: "Mississippi", population: 15000 },
    { name: "Grenada", state: "MS", stateName: "Mississippi", population: 12000 },
    { name: "Holly Springs", state: "MS", stateName: "Mississippi", population: 7000 },
    { name: "Laurel", state: "MS", stateName: "Mississippi", population: 18000 },
    { name: "Natchez", state: "MS", stateName: "Mississippi", population: 15000 },
    { name: "Ocean Springs", state: "MS", stateName: "Mississippi", population: 18000 },
    { name: "Pass Christian", state: "MS", stateName: "Mississippi", population: 5000 },
    { name: "Philadelphia", state: "MS", stateName: "Mississippi", population: 7000 },
    { name: "Port Gibson", state: "MS", stateName: "Mississippi", population: 1500 },
    { name: "West Point", state: "MS", stateName: "Mississippi", population: 10000 },
    { name: "Yazoo City", state: "MS", stateName: "Mississippi", population: 11000 },

    // Montana
    { name: "Billings", state: "MT", stateName: "Montana", population: 117116 },
    { name: "Missoula", state: "MT", stateName: "Montana", population: 73749 },
    { name: "Great Falls", state: "MT", stateName: "Montana", population: 60001 },
    { name: "Bozeman", state: "MT", stateName: "Montana", population: 53532 },
    { name: "Butte", state: "MT", stateName: "Montana", population: 35552 },
    { name: "Helena", state: "MT", stateName: "Montana", population: 32891 },
    { name: "Kalispell", state: "MT", stateName: "Montana", population: 24800 },
    { name: "Havre", state: "MT", stateName: "Montana", population: 9817 },
    { name: "Anaconda", state: "MT", stateName: "Montana", population: 9142 },
    { name: "Miles City", state: "MT", stateName: "Montana", population: 8371 },
    { name: "Belt", state: "MT", stateName: "Montana", population: 597 },
    { name: "Bigfork", state: "MT", stateName: "Montana", population: 4216 },
    { name: "Boulder", state: "MT", stateName: "Montana", population: 1195 },
    { name: "Browning", state: "MT", stateName: "Montana", population: 1018 },
    { name: "Chester", state: "MT", stateName: "Montana", population: 847 },
    { name: "Chinook", state: "MT", stateName: "Montana", population: 1203 },
    { name: "Choteau", state: "MT", stateName: "Montana", population: 1684 },
    { name: "Circle", state: "MT", stateName: "Montana", population: 644 },
    { name: "Colstrip", state: "MT", stateName: "Montana", population: 2214 },
    { name: "Columbia Falls", state: "MT", stateName: "Montana", population: 5295 },
    { name: "Columbus", state: "MT", stateName: "Montana", population: 1897 },
    { name: "Conrad", state: "MT", stateName: "Montana", population: 2570 },
    { name: "Cut Bank", state: "MT", stateName: "Montana", population: 3048 },
    { name: "Deer Lodge", state: "MT", stateName: "Montana", population: 2898 },
    { name: "Dillon", state: "MT", stateName: "Montana", population: 4132 },
    { name: "Ekalaka", state: "MT", stateName: "Montana", population: 399 },
    { name: "Fort Benton", state: "MT", stateName: "Montana", population: 1501 },
    { name: "Fort Peck", state: "MT", stateName: "Montana", population: 0 },
    { name: "Glasgow", state: "MT", stateName: "Montana", population: 3226 },
    { name: "Glendive", state: "MT", stateName: "Montana", population: 4935 },
    { name: "Hamilton", state: "MT", stateName: "Montana", population: 4680 },
    { name: "Hardin", state: "MT", stateName: "Montana", population: 3666 },
    { name: "Harlowton", state: "MT", stateName: "Montana", population: 955 },
    { name: "Harlem", state: "MT", stateName: "Montana", population: 808 },
    { name: "Huntley", state: "MT", stateName: "Montana", population: 446 },
    { name: "Hysham", state: "MT", stateName: "Montana", population: 312 },
    { name: "Jordan", state: "MT", stateName: "Montana", population: 343 },
    { name: "Laurel", state: "MT", stateName: "Montana", population: 7181 },
    { name: "Lewistown", state: "MT", stateName: "Montana", population: 5904 },
    { name: "Libby", state: "MT", stateName: "Montana", population: 2628 },
    { name: "Livingston", state: "MT", stateName: "Montana", population: 7580 },
    { name: "Malta", state: "MT", stateName: "Montana", population: 1830 },
    { name: "Plentywood", state: "MT", stateName: "Montana", population: 1734 },
    { name: "Polson", state: "MT", stateName: "Montana", population: 5037 },
    { name: "Red Lodge", state: "MT", stateName: "Montana", population: 2125 },
    { name: "Ronan", state: "MT", stateName: "Montana", population: 1871 },
    { name: "Roundup", state: "MT", stateName: "Montana", population: 1788 },
    { name: "Scobey", state: "MT", stateName: "Montana", population: 1017 },
    { name: "Shelby", state: "MT", stateName: "Montana", population: 3042 },
    { name: "Sidney", state: "MT", stateName: "Montana", population: 6406 },
    { name: "Stevensville", state: "MT", stateName: "Montana", population: 2189 },
    { name: "Thompson Falls", state: "MT", stateName: "Montana", population: 1313 },
    { name: "Three Forks", state: "MT", stateName: "Montana", population: 1869 },
    { name: "Townsend", state: "MT", stateName: "Montana", population: 1878 },
    { name: "Virginia City", state: "MT", stateName: "Montana", population: 190 },
    { name: "Whitefish", state: "MT", stateName: "Montana", population: 8080 },
    { name: "Whitehall", state: "MT", stateName: "Montana", population: 1038 },
    { name: "Wolf Point", state: "MT", stateName: "Montana", population: 2621 },

    // North Dakota
    { name: "Fargo", state: "ND", stateName: "North Dakota", population: 125990 },
    { name: "Bismarck", state: "ND", stateName: "North Dakota", population: 73000 },
    { name: "Grand Forks", state: "ND", stateName: "North Dakota", population: 57000 },
    { name: "Minot", state: "ND", stateName: "North Dakota", population: 48000 },
    { name: "West Fargo", state: "ND", stateName: "North Dakota", population: 38000 },
    { name: "Williston", state: "ND", stateName: "North Dakota", population: 29000 },
    { name: "Dickinson", state: "ND", stateName: "North Dakota", population: 25000 },
    { name: "Mandan", state: "ND", stateName: "North Dakota", population: 24000 },
    { name: "Jamestown", state: "ND", stateName: "North Dakota", population: 15000 },
    { name: "Wahpeton", state: "ND", stateName: "North Dakota", population: 8000 },
    { name: "Devils Lake", state: "ND", stateName: "North Dakota", population: 7000 },
    { name: "Valley City", state: "ND", stateName: "North Dakota", population: 6000 },
    { name: "Rugby", state: "ND", stateName: "North Dakota", population: 3000 },

    // Oregon
    { name: "Portland", state: "OR", stateName: "Oregon", population: 652503 },
    { name: "Salem", state: "OR", stateName: "Oregon", population: 177723 },
    { name: "Eugene", state: "OR", stateName: "Oregon", population: 176654 },
    { name: "Gresham", state: "OR", stateName: "Oregon", population: 114247 },
    { name: "Bend", state: "OR", stateName: "Oregon", population: 99178 },
    { name: "Medford", state: "OR", stateName: "Oregon", population: 85030 },
    { name: "Springfield", state: "OR", stateName: "Oregon", population: 62928 },
    { name: "Corvallis", state: "OR", stateName: "Oregon", population: 59213 },
    { name: "Albany", state: "OR", stateName: "Oregon", population: 56177 },
    { name: "Tigard", state: "OR", stateName: "Oregon", population: 54439 },
    { name: "Lake Oswego", state: "OR", stateName: "Oregon", population: 40071 },
    { name: "Keizer", state: "OR", stateName: "Oregon", population: 39570 },
    { name: "Grants Pass", state: "OR", stateName: "Oregon", population: 39510 },
    { name: "Oregon City", state: "OR", stateName: "Oregon", population: 37572 },
    { name: "McMinnville", state: "OR", stateName: "Oregon", population: 34519 },
    { name: "Redmond", state: "OR", stateName: "Oregon", population: 33301 },
    { name: "Tualatin", state: "OR", stateName: "Oregon", population: 27799 },
    { name: "West Linn", state: "OR", stateName: "Oregon", population: 27073 },
    { name: "Woodburn", state: "OR", stateName: "Oregon", population: 26494 },
    { name: "Forest Grove", state: "OR", stateName: "Oregon", population: 25624 },
    { name: "Newberg", state: "OR", stateName: "Oregon", population: 25038 },
    { name: "Roseburg", state: "OR", stateName: "Oregon", population: 23922 },
    { name: "Klamath Falls", state: "OR", stateName: "Oregon", population: 21913 },
    { name: "Ashland", state: "OR", stateName: "Oregon", population: 21225 },
    { name: "Milwaukie", state: "OR", stateName: "Oregon", population: 21019 },
    { name: "Pendleton", state: "OR", stateName: "Oregon", population: 17007 },
    { name: "Hillsboro", state: "OR", stateName: "Oregon", population: 106633 },
    { name: "Beaverton", state: "OR", stateName: "Oregon", population: 97053 },
    { name: "Astoria", state: "OR", stateName: "Oregon", population: 10039 },
    { name: "Baker City", state: "OR", stateName: "Oregon", population: 9738 },
    { name: "Brookings", state: "OR", stateName: "Oregon", population: 6543 },
    { name: "Burns", state: "OR", stateName: "Oregon", population: 2806 },
    { name: "Coos Bay", state: "OR", stateName: "Oregon", population: 16312 },
    { name: "Hood River", state: "OR", stateName: "Oregon", population: 7756 },
    { name: "Jacksonville", state: "OR", stateName: "Oregon", population: 2885 },
    { name: "John Day", state: "OR", stateName: "Oregon", population: 1744 },
    { name: "La Grande", state: "OR", stateName: "Oregon", population: 13393 },
    { name: "Lakeview", state: "OR", stateName: "Oregon", population: 2500 },
    { name: "Newport", state: "OR", stateName: "Oregon", population: 10456 },
    { name: "Ontario", state: "OR", stateName: "Oregon", population: 11066 },
    { name: "Port Orford", state: "OR", stateName: "Oregon", population: 1133 },
    { name: "Prineville", state: "OR", stateName: "Oregon", population: 9525 },
    { name: "Reedsport", state: "OR", stateName: "Oregon", population: 4166 },
    { name: "Seaside", state: "OR", stateName: "Oregon", population: 6993 },
    { name: "The Dalles", state: "OR", stateName: "Oregon", population: 15685 },
    { name: "Tillamook", state: "OR", stateName: "Oregon", population: 5253 }
  ];

      // All cities are now in the main realCities array above

  // Add all real cities first
  realCities.forEach(city => {
    cities.push({
      id: id.toString(),
      name: city.name,
      state: city.state,
      stateName: city.stateName,
      population: city.population,
      region: getRegion(city.state)
    });
    id++;
  });


  // Sort by population (largest first)
  cities.sort((a, b) => b.population - a.population);
  
  // Reassign IDs after sorting
  cities.forEach((city, index) => {
    city.id = (index + 1).toString();
  });

  return cities;
};

function generateCityName() {
  const names = [
    'Alexandria', 'Anderson', 'Arlington', 'Athens', 'Aurora', 'Birmingham', 'Bloomington',
    'Bowling Green', 'Bristol', 'Brooklyn', 'Burlington', 'Canton', 'Cedar Rapids',
    'Champaign', 'Charleston', 'Chattanooga', 'Clarksville', 'Cleveland', 'Columbia',
    'Columbus', 'Concord', 'Corpus Christi', 'Dayton', 'Decatur', 'Des Moines',
    'Dover', 'Durham', 'Erie', 'Evansville', 'Flint', 'Fort Wayne', 'Gainesville',
    'Gary', 'Grand Rapids', 'Hampton', 'Hartford', 'Huntsville', 'Jackson', 'Jersey City',
    'Kalamazoo', 'Kansas City', 'Knoxville', 'Lansing', 'Lexington', 'Lincoln', 'Little Rock',
    'Lubbock', 'Madison', 'Manchester', 'Mobile', 'Montgomery', 'Norfolk', 'Norman',
    'Orlando', 'Peoria', 'Plano', 'Providence', 'Raleigh', 'Reno', 'Richmond',
    'Rochester', 'Rockford', 'Salem', 'Santa Ana', 'Savannah', 'Shreveport', 'Sioux Falls',
    'Spokane', 'Springfield', 'Syracuse', 'Tallahassee', 'Toledo', 'Topeka', 'Trenton',
    'Tucson', 'Tulsa', 'Waterbury', 'Wichita', 'Winston-Salem', 'Worcester', 'Yonkers'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function getRegion(stateCode) {
  const regions = {
    'Northeast': ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
    'Southeast': ['AL', 'AR', 'DE', 'FL', 'GA', 'KY', 'LA', 'MD', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
    'Midwest': ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
    'Southwest': ['AZ', 'NM', 'OK', 'TX'],
    'West': ['AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY']
  };
  
  for (const [region, states] of Object.entries(regions)) {
    if (states.includes(stateCode)) {
      return region;
    }
  }
  return 'Other';
}


// Initialize data files if they don't exist
async function initializeData() {
  await ensureDataDir();
  
  try {
    await fs.access(CITIES_FILE);
  } catch {
    console.log('Generating US cities data...');
    const cities = generateUSCities();
    await fs.writeFile(CITIES_FILE, JSON.stringify(cities, null, 2));
    console.log(`Generated ${cities.length} US cities`);
  }
}

// API Routes

// Get all cities with search and pagination
app.get('/api/cities', async (req, res) => {
  try {
    const { search, state, region, page = 1, limit = 50 } = req.query;
    const data = await fs.readFile(CITIES_FILE, 'utf8');
    let cities = JSON.parse(data);
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      cities = cities.filter(city => 
        city.name.toLowerCase().includes(searchLower) ||
        city.stateName.toLowerCase().includes(searchLower)
      );
    }
    
    if (state) {
      cities = cities.filter(city => city.state === state);
    }
    
    if (region) {
      cities = cities.filter(city => city.region === region);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCities = cities.slice(startIndex, endIndex);
    
    res.json({
      cities: paginatedCities,
      total: cities.length,
      page: parseInt(page),
      totalPages: Math.ceil(cities.length / limit)
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// Get single city
app.get('/api/cities/:id', async (req, res) => {
  try {
    const data = await fs.readFile(CITIES_FILE, 'utf8');
    const cities = JSON.parse(data);
    const city = cities.find(c => c.id === req.params.id);
    
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch city' });
  }
});

// Database connection
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize articles table
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP,
        theme TEXT,
        is_today BOOLEAN DEFAULT false
      )
    `);
    
    // Add published_at column if it doesn't exist
    await pool.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS published_at TIMESTAMP
    `);
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Initialize database on startup
initDatabase().catch(error => {
  console.error('Database initialization failed:', error);
  // Don't crash the server if database init fails
});

// Global error handler to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process
});

// Get all news articles
app.get('/api/news', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    // Check if we have any articles, if not, insert a test article
    const countResult = await pool.query('SELECT COUNT(*) FROM articles');
    const articleCount = parseInt(countResult.rows[0].count);
    
    if (articleCount === 0) {
      console.log('No articles found, inserting test article...');
      await pool.query(`
        INSERT INTO articles (title, content, city, state, slug, theme, is_today, published_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'Test Article - Database Working!',
        'This is a test article to verify the database is working correctly.',
        'Test City',
        'Test State',
        'test-article-database-working',
        'test',
        true,
        new Date().toISOString()
      ]);
      console.log('Test article inserted successfully');
    }
    
    // Get articles from database
    const result = await pool.query(`
      SELECT *, published_at as "publishedAt" FROM articles 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `, [limitNum, offsetNum]);
    
    const totalResult = await pool.query('SELECT COUNT(*) FROM articles');
    const total = parseInt(totalResult.rows[0].count);
    
    res.json({
      articles: result.rows,
      total: total,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < total
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news', details: error.message });
  }
});

// Get today's articles
app.get('/api/news/today', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get articles from today from database
    const result = await pool.query(`
      SELECT *, published_at as "publishedAt" FROM articles 
      WHERE DATE(created_at) = $1
      ORDER BY created_at DESC 
      LIMIT $2
    `, [todayStr, parseInt(limit)]);
    
    const totalResult = await pool.query(`
      SELECT COUNT(*) FROM articles 
      WHERE DATE(created_at) = $1
    `, [todayStr]);
    const total = parseInt(totalResult.rows[0].count);
    
    res.json({
      articles: result.rows,
      count: result.rows.length,
      date: todayStr,
      totalToday: total
    });
  } catch (error) {
    console.error('Error fetching today\'s articles:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s articles', details: error.message });
  }
});

// Get articles for a specific city
app.get('/api/news/city/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const { limit = 20 } = req.query;
    const data = await fs.readFile(ARTICLES_FILE, 'utf8');
    const articles = JSON.parse(data);
    
    // Filter articles for the specific city
    const cityArticles = articles.articles.filter(article => article.cityId === cityId);
    
    // Sort by publishedAt descending (newest first)
    cityArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    // Limit results
    const limitedArticles = cityArticles.slice(0, parseInt(limit));
    
    res.json({
      articles: limitedArticles,
      count: limitedArticles.length,
      totalCount: cityArticles.length,
      cityId: cityId
    });
  } catch (error) {
    console.error('Error fetching city articles:', error);
    res.status(500).json({ error: 'Failed to fetch city articles' });
  }
});

// Get single article by ID
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(ARTICLES_FILE, 'utf8');
    const articles = JSON.parse(data);
    
    const article = articles.articles.find(a => a.id.toString() === id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Get single article by slug (for new URL format)
app.get('/api/articles/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await fs.readFile(ARTICLES_FILE, 'utf8');
    const articles = JSON.parse(data);
    
    // Find article by matching slug (for now, we'll use a simple approach)
    // In a real implementation, you'd want to store slugs in the database
    const article = articles.articles.find(a => a.slug === slug);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Get city by slug (for SEO-friendly URLs)
app.get('/api/cities/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Parse slug to get city name and state
    const parts = slug.split('-');
    if (parts.length < 2) {
      return res.status(400).json({ error: 'Invalid city slug' });
    }
    
    const state = parts[parts.length - 1].toUpperCase();
    const cityName = parts.slice(0, -1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const data = await fs.readFile(CITIES_FILE, 'utf8');
    const cities = JSON.parse(data);
    
    // Handle special cases for city names with periods or special characters
    if (cityName.toLowerCase().includes('st') || cityName.toLowerCase().includes('saint')) {
      // Try multiple variations for St. Louis type cities
      const stVariations = [
        cityName,
        cityName.replace(/St/gi, 'St.'),
        cityName.replace(/St\./gi, 'Saint'),
        cityName.replace(/Saint/gi, 'St.'),
        cityName.replace(/St/gi, 'Saint')
      ];
      
      for (const variation of stVariations) {
        const city = cities.find(c => 
          c.name.toLowerCase() === variation.toLowerCase() && 
          c.state === state
        );
        if (city) {
          return res.json(city);
        }
      }
    }
    const city = cities.find(c => 
      c.name.toLowerCase() === cityName.toLowerCase() && 
      c.state === state
    );
    
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch city' });
  }
});




// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to check database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM articles');
    
    // Check if published_at column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'published_at'
    `);
    
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      articleCount: parseInt(result.rows[0].count),
      hasPublishedAtColumn: columnCheck.rows.length > 0
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test endpoint to insert a sample article
app.post('/api/test-article', async (req, res) => {
  try {
    const testArticle = {
      title: 'Test Article - Database Working!',
      content: 'This is a test article to verify the database is working correctly.',
      city: 'Test City',
      state: 'Test State',
      slug: 'test-article-database-working',
      theme: 'test',
      is_today: true
    };
    
    await pool.query(`
      INSERT INTO articles (title, content, city, state, slug, theme, is_today, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      testArticle.title,
      testArticle.content,
      testArticle.city,
      testArticle.state,
      testArticle.slug,
      testArticle.theme,
      testArticle.is_today,
      new Date().toISOString()
    ]);
    
    res.json({ 
      success: true, 
      message: 'Test article inserted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Fix database schema endpoint
app.post('/api/fix-db', async (req, res) => {
  try {
    // Add published_at column if it doesn't exist
    await pool.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS published_at TIMESTAMP
    `);
    
    res.json({ 
      success: true, 
      message: 'Database schema fixed - published_at column added'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Article generation endpoint for cron job
app.post('/api/generate-daily-articles', async (req, res) => {
  try {
    console.log('🚀 Cron job triggered: Starting daily article generation...');
    
    // Import and run the daily news generator
    const { generateDailyNews } = require('../daily-news-generator');
    let result;
    try {
      console.log('🚀 Starting article generation...');
      result = await generateDailyNews();
      console.log('Result from generateDailyNews:', result);
      console.log('Result type:', typeof result);
      console.log('Result.articles:', result?.articles);
      console.log('Articles length:', result?.articles?.length);
    } catch (error) {
      console.error('Error in generateDailyNews:', error);
      return res.json({ 
        success: false, 
        error: `generateDailyNews failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (result && result.articles && result.articles.length > 0) {
      // Clear existing articles for today
      const today = new Date().toISOString().split('T')[0];
      await pool.query('DELETE FROM articles WHERE DATE(created_at) = $1', [today]);
      
      // Insert articles one by one for real-time publishing
      let insertedCount = 0;
      for (const article of result.articles) {
        try {
          await pool.query(`
            INSERT INTO articles (title, content, city, state, slug, theme, is_today, published_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            article.headline || article.title,
            article.content,
            article.cityName || article.city,
            article.state,
            article.slug,
            article.theme || null,
            true,
            article.publishedAt || new Date().toISOString()
          ]);
          insertedCount++;
          
          // Log progress every 100 articles
          if (insertedCount % 100 === 0) {
            console.log(`📝 Published ${insertedCount}/${result.articles.length} articles`);
          }
        } catch (error) {
          console.error(`❌ Error inserting article ${insertedCount + 1}:`, error);
        }
      }
      
      console.log(`✅ Published ${insertedCount} articles to frontend`);
    } else {
      console.log('❌ No articles generated or result is invalid');
      return res.json({ 
        success: false, 
        error: 'No articles generated',
        result: result,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Daily articles generated successfully',
      totalArticles: result ? result.articles.length : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error generating daily articles:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Check if it's time to run daily article generation
function shouldRunDailyGeneration() {
  const now = new Date();
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  
  // Run if it's between 2:00 AM and 2:59 AM UTC
  return hour === 2 && minute < 60;
}

// Run daily article generation if it's the right time
async function checkAndRunDailyGeneration() {
  if (shouldRunDailyGeneration()) {
    console.log('🕐 It\'s 2 AM UTC - time for daily article generation!');
    try {
      const { generateDailyNews } = require('../daily-news-generator');
      await generateDailyNews();
      console.log('✅ Daily article generation completed!');
    } catch (error) {
      console.error('❌ Error running daily article generation:', error);
    }
  }
}

// Initialize data and start server
initializeData().then(async () => {
  // Initialize database
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 The Daily Holler Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🌆 Cities endpoint: http://localhost:${PORT}/api/cities`);
    console.log(`📰 News endpoint: http://localhost:${PORT}/api/news`);
    if (isProduction) {
      console.log(`🌐 Production mode: Serving React app`);
    }
    
    // Check if we should run daily generation on startup
    checkAndRunDailyGeneration();
    
    // Set up a timer to check every hour
    setInterval(checkAndRunDailyGeneration, 60 * 60 * 1000); // Check every hour
  });
}).catch(console.error);

// Serve static files in production (before catch-all route)
if (isProduction) {
  const staticPath = path.join(__dirname, '../client/build');
  console.log('Static files path:', staticPath);
  console.log('Static files exist:', require('fs').existsSync(staticPath));
  app.use(express.static(staticPath));
  
  // Serve React app for all non-API routes (MUST be last)
  app.get('*', (req, res) => {
    console.log('Catch-all route hit for:', req.path);
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}
