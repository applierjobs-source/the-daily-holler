/**
 * Local Flavor Database for The Daily Holler
 * Contains real local details for major US cities to add authenticity
 */

class LocalFlavorDatabase {
  constructor() {
    this.cityData = {
      // Major Cities with Rich Local Details
      'New York': {
        state: 'NY',
        nickname: 'New Yorkers',
        landmarks: ['Times Square', 'Central Park', 'Brooklyn Bridge', 'Statue of Liberty', 'Empire State Building', 'One World Trade Center'],
        streets: ['Broadway', '5th Avenue', 'Wall Street', 'Park Avenue', 'Madison Avenue', 'Lexington Avenue'],
        neighborhoods: ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island', 'SoHo', 'Tribeca', 'Greenwich Village'],
        sports: ['Yankees', 'Mets', 'Knicks', 'Nets', 'Giants', 'Jets', 'Rangers', 'Islanders'],
        localBusinesses: ['Shake Shack', 'Gray\'s Papaya', 'Katz\'s Delicatessen', 'Russ & Daughters', 'Magnolia Bakery'],
        localTerms: ['bodega', 'subway', 'cabbie', 'the city', 'outer boroughs']
      },
      
      'Los Angeles': {
        state: 'CA',
        nickname: 'Angelenos',
        landmarks: ['Hollywood Sign', 'Griffith Observatory', 'Santa Monica Pier', 'Venice Beach', 'Rodeo Drive', 'The Getty Center'],
        streets: ['Sunset Boulevard', 'Hollywood Boulevard', 'Rodeo Drive', 'Melrose Avenue', 'Wilshire Boulevard', 'Pico Boulevard'],
        neighborhoods: ['Hollywood', 'Beverly Hills', 'Santa Monica', 'Venice', 'West Hollywood', 'Downtown LA', 'Silver Lake', 'Echo Park'],
        sports: ['Lakers', 'Clippers', 'Dodgers', 'Angels', 'Kings', 'Galaxy', 'LAFC'],
        localBusinesses: ['In-N-Out Burger', 'Pink\'s Hot Dogs', 'Musso & Frank Grill', 'The Original Pantry', 'Randy\'s Donuts'],
        localTerms: ['freeway', 'the 405', 'the 101', 'the 10', 'valley', 'beach cities']
      },
      
      'Chicago': {
        state: 'IL',
        nickname: 'Chicagoans',
        landmarks: ['Willis Tower', 'Navy Pier', 'Millennium Park', 'The Bean', 'Wrigley Field', 'Sears Tower'],
        streets: ['Michigan Avenue', 'State Street', 'Lake Shore Drive', 'Rush Street', 'Clark Street', 'Halsted Street'],
        neighborhoods: ['The Loop', 'Lincoln Park', 'Wicker Park', 'Lakeview', 'Wrigleyville', 'Gold Coast', 'River North', 'Pilsen'],
        sports: ['Cubs', 'White Sox', 'Bulls', 'Bears', 'Blackhawks', 'Fire'],
        localBusinesses: ['Portillo\'s', 'Giordano\'s', 'Lou Malnati\'s', 'Garrett Popcorn', 'The Berghoff'],
        localTerms: ['the L', 'CTA', 'the lake', 'downtown', 'the suburbs', 'the Loop']
      },
      
      'Houston': {
        state: 'TX',
        nickname: 'Houstonians',
        landmarks: ['Space Center Houston', 'Museum District', 'Hermann Park', 'Buffalo Bayou', 'Galleria', 'Minute Maid Park'],
        streets: ['Main Street', 'Westheimer Road', 'Richmond Avenue', 'Kirby Drive', 'Montrose Boulevard', 'Memorial Drive'],
        neighborhoods: ['Downtown', 'Montrose', 'Heights', 'Galleria', 'Museum District', 'Rice Village', 'Midtown', 'West University'],
        sports: ['Astros', 'Rockets', 'Texans', 'Dynamo'],
        localBusinesses: ['Whataburger', 'Pappasito\'s', 'Ninfa\'s', 'Killen\'s BBQ', 'The Breakfast Klub'],
        localTerms: ['the loop', '610', 'the beltway', 'the medical center', 'the energy corridor']
      },
      
      'Phoenix': {
        state: 'AZ',
        nickname: 'Phoenicians',
        landmarks: ['Camelback Mountain', 'Papago Park', 'Desert Botanical Garden', 'Phoenix Art Museum', 'Chase Field', 'Footprint Center'],
        streets: ['Central Avenue', 'Camelback Road', 'Indian School Road', 'Thomas Road', 'McDowell Road', 'Van Buren Street'],
        neighborhoods: ['Downtown', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Glendale', 'Peoria'],
        sports: ['Suns', 'Cardinals', 'Diamondbacks', 'Coyotes'],
        localBusinesses: ['In-N-Out Burger', 'Culver\'s', 'Fry\'s Food Stores', 'Bashas\'', 'Filiberto\'s'],
        localTerms: ['the valley', 'the desert', 'monsoon season', 'cactus', 'the mountains']
      },
      
      'Philadelphia': {
        state: 'PA',
        nickname: 'Philadelphians',
        landmarks: ['Liberty Bell', 'Independence Hall', 'Philadelphia Museum of Art', 'Reading Terminal Market', 'Rittenhouse Square', 'Love Park'],
        streets: ['Broad Street', 'Market Street', 'Chestnut Street', 'Walnut Street', 'South Street', 'Delaware Avenue'],
        neighborhoods: ['Center City', 'South Philly', 'Fishtown', 'Northern Liberties', 'University City', 'Manayunk', 'Chestnut Hill', 'Roxborough'],
        sports: ['Eagles', 'Phillies', '76ers', 'Flyers', 'Union'],
        localBusinesses: ['Pat\'s King of Steaks', 'Geno\'s Steaks', 'Reading Terminal Market', 'Federal Donuts', 'La Colombe'],
        localTerms: ['jawn', 'the city', 'the river', 'the shore', 'the suburbs', 'the Main Line']
      },
      
      'San Antonio': {
        state: 'TX',
        nickname: 'San Antonians',
        landmarks: ['The Alamo', 'River Walk', 'Tower of the Americas', 'San Antonio Missions', 'Market Square', 'Hemisfair Park'],
        streets: ['Broadway', 'Houston Street', 'Commerce Street', 'St. Mary\'s Street', 'San Pedro Avenue', 'Fredericksburg Road'],
        neighborhoods: ['Downtown', 'King William', 'Southtown', 'Pearl District', 'Alamo Heights', 'Terrell Hills', 'Monte Vista', 'Tobin Hill'],
        sports: ['Spurs', 'Rampage'],
        localBusinesses: ['Whataburger', 'Taco Cabana', 'Rudy\'s BBQ', 'Mi Tierra', 'Rosario\'s'],
        localTerms: ['the river', 'the missions', 'the hill country', 'the valley', 'puro San Antonio']
      },
      
      'San Diego': {
        state: 'CA',
        nickname: 'San Diegans',
        landmarks: ['Balboa Park', 'San Diego Zoo', 'Coronado Beach', 'La Jolla Cove', 'Gaslamp Quarter', 'USS Midway Museum'],
        streets: ['Broadway', '5th Avenue', 'Mission Boulevard', 'University Avenue', 'El Cajon Boulevard', 'Clairemont Drive'],
        neighborhoods: ['Downtown', 'La Jolla', 'Pacific Beach', 'Mission Beach', 'Hillcrest', 'North Park', 'Little Italy', 'Gaslamp Quarter'],
        sports: ['Padres', 'Chargers', 'Gulls'],
        localBusinesses: ['In-N-Out Burger', 'Phil\'s BBQ', 'Hodad\'s', 'The Crack Shack', 'Lucha Libre'],
        localTerms: ['the beach', 'the bay', 'the zoo', 'Balboa Park', 'the coast']
      },
      
      'Dallas': {
        state: 'TX',
        nickname: 'Dallasites',
        landmarks: ['Reunion Tower', 'Dallas Arboretum', 'Perot Museum', 'Klyde Warren Park', 'Deep Ellum', 'Bishop Arts District'],
        streets: ['Main Street', 'Elm Street', 'Commerce Street', 'Ross Avenue', 'McKinney Avenue', 'Greenville Avenue'],
        neighborhoods: ['Downtown', 'Deep Ellum', 'Bishop Arts', 'Uptown', 'Oak Lawn', 'Lakewood', 'Preston Hollow', 'Highland Park'],
        sports: ['Cowboys', 'Mavericks', 'Stars', 'Rangers', 'FC Dallas'],
        localBusinesses: ['Whataburger', 'Pecan Lodge', 'Lockhart Smokehouse', 'Velvet Taco', 'The Rustic'],
        localTerms: ['the metroplex', 'the tollway', 'the loop', 'the suburbs', 'the arts district']
      },
      
      'San Jose': {
        state: 'CA',
        nickname: 'San Joseans',
        landmarks: ['Tech Museum', 'Santana Row', 'Winchester Mystery House', 'Municipal Rose Garden', 'Happy Hollow Park', 'SAP Center'],
        streets: ['Santa Clara Street', 'First Street', 'Almaden Expressway', 'Capitol Expressway', 'Monterey Road', 'Bascom Avenue'],
        neighborhoods: ['Downtown', 'Santana Row', 'Willow Glen', 'Almaden Valley', 'Cambrian Park', 'Rose Garden', 'Naglee Park', 'The Alameda'],
        sports: ['Sharks', 'Earthquakes'],
        localBusinesses: ['In-N-Out Burger', 'La Victoria', 'Original Joe\'s', 'Falafel Drive-In', 'The Table'],
        localTerms: ['the valley', 'Silicon Valley', 'the tech scene', 'the bay area', 'the south bay']
      },
      
      'Austin': {
        state: 'TX',
        nickname: 'Austinites',
        landmarks: ['Texas State Capitol', 'South by Southwest', 'Zilker Park', 'Barton Springs', '6th Street', 'University of Texas'],
        streets: ['6th Street', 'South 1st Street', 'South Lamar Boulevard', 'Burnet Road', 'Guadalupe Street', 'Congress Avenue'],
        neighborhoods: ['Downtown', 'South Austin', 'East Austin', 'West Austin', 'North Austin', 'Hyde Park', 'Clarksville', 'Bouldin Creek'],
        sports: ['Longhorns', 'Austin FC'],
        localBusinesses: ['Franklin Barbecue', 'Salt Traders Coastal Cooking', 'Torchy\'s Tacos', 'Home Slice Pizza', 'Amy\'s Ice Creams'],
        localTerms: ['the capitol', 'the lake', 'the river', 'the hill country', 'keep Austin weird']
      },
      
      'Jacksonville': {
        state: 'FL',
        nickname: 'Jacksonvillians',
        landmarks: ['Jacksonville Landing', 'Cummer Museum', 'Museum of Science & History', 'Friendship Fountain', 'Riverside Arts Market', 'TIAA Bank Field'],
        streets: ['Bay Street', 'Ocean Street', 'Riverside Avenue', 'San Marco Boulevard', 'Atlantic Boulevard', 'Beach Boulevard'],
        neighborhoods: ['Downtown', 'Riverside', 'Avondale', 'San Marco', 'Springfield', 'Murray Hill', 'Ortega', 'Mandarin'],
        sports: ['Jaguars'],
        localBusinesses: ['Maple Street Biscuit Company', 'The Bearded Pig', 'Biscottis', 'Orsay', 'Black Sheep Restaurant'],
        localTerms: ['the river', 'the beaches', 'the intracoastal', 'the bridge', 'the landing']
      },
      
      'Fort Worth': {
        state: 'TX',
        nickname: 'Fort Worthians',
        landmarks: ['Stockyards National Historic District', 'Kimbell Art Museum', 'Modern Art Museum', 'Sundance Square', 'Botanic Garden', 'Amon Carter Museum'],
        streets: ['Main Street', '7th Street', 'Henderson Street', 'Magnolia Avenue', 'Camp Bowie Boulevard', 'University Drive'],
        neighborhoods: ['Downtown', 'Sundance Square', 'Stockyards', 'Cultural District', 'West 7th', 'Near Southside', 'TCU', 'Arlington Heights'],
        sports: ['TCU Horned Frogs', 'Fort Worth Cats'],
        localBusinesses: ['Joe T. Garcia\'s', 'Riscky\'s BBQ', 'The Original', 'Reata', 'Lonesome Dove'],
        localTerms: ['the stockyards', 'cowtown', 'the cultural district', 'the west side', 'the east side']
      },
      
      'Columbus': {
        state: 'OH',
        nickname: 'Columbusites',
        landmarks: ['Ohio Statehouse', 'Short North Arts District', 'German Village', 'Franklin Park Conservatory', 'COSI', 'Nationwide Arena'],
        streets: ['High Street', 'Broad Street', 'Main Street', 'Neil Avenue', 'Campus', 'Dublin Road'],
        neighborhoods: ['Downtown', 'Short North', 'German Village', 'Italian Village', 'Clintonville', 'Grandview Heights', 'Bexley', 'Upper Arlington'],
        sports: ['Buckeyes', 'Blue Jackets', 'Crew'],
        localBusinesses: ['Thurman Cafe', 'Schmidt\'s Sausage Haus', 'The Thurmanator', 'North Market', 'Jeni\'s Splendid Ice Creams'],
        localTerms: ['the university', 'campus', 'the short north', 'the arena district', 'the river']
      },
      
      'Charlotte': {
        state: 'NC',
        nickname: 'Charlotteans',
        landmarks: ['Bank of America Stadium', 'NASCAR Hall of Fame', 'Discovery Place', 'Freedom Park', 'Romare Bearden Park', 'Mint Museum'],
        streets: ['Trade Street', 'Tryon Street', 'Independence Boulevard', 'Sharon Road', 'Park Road', 'Providence Road'],
        neighborhoods: ['Uptown', 'South End', 'NoDa', 'Plaza Midwood', 'Myers Park', 'Dilworth', 'Elizabeth', 'Ballantyne'],
        sports: ['Panthers', 'Hornets', 'Checkers'],
        localBusinesses: ['Price\'s Chicken Coop', 'Amelie\'s French Bakery', 'Midwood Smokehouse', 'The Cowfish', 'Bojangles'],
        localTerms: ['uptown', 'the queen city', 'the banks', 'the lake', 'the suburbs']
      },
      
      'Seattle': {
        state: 'WA',
        nickname: 'Seattleites',
        landmarks: ['Space Needle', 'Pike Place Market', 'Chihuly Garden and Glass', 'Museum of Pop Culture', 'Kerry Park', 'Gas Works Park'],
        streets: ['Pike Street', 'Pine Street', 'Broadway', 'Capitol Hill', 'Queen Anne Avenue', 'Fremont Avenue'],
        neighborhoods: ['Downtown', 'Capitol Hill', 'Fremont', 'Ballard', 'Queen Anne', 'Belltown', 'Pioneer Square', 'International District'],
        sports: ['Seahawks', 'Mariners', 'Sounders', 'Kraken'],
        localBusinesses: ['Dick\'s Drive-In', 'Paseo', 'Tilikum Place Cafe', 'Canlis', 'The Walrus and the Carpenter'],
        localTerms: ['the market', 'the needle', 'the sound', 'the mountains', 'the rain']
      },
      
      'Denver': {
        state: 'CO',
        nickname: 'Denverites',
        landmarks: ['Red Rocks Amphitheatre', 'Denver Art Museum', 'Union Station', 'Larimer Square', '16th Street Mall', 'Coors Field'],
        streets: ['16th Street', 'Colfax Avenue', 'Broadway', 'Larimer Street', 'Welton Street', 'Federal Boulevard'],
        neighborhoods: ['Downtown', 'LoDo', 'RiNo', 'Capitol Hill', 'Highlands', 'Cherry Creek', 'Wash Park', 'Five Points'],
        sports: ['Broncos', 'Nuggets', 'Avalanche', 'Rockies', 'Rapids'],
        localBusinesses: ['Casa Bonita', 'Snooze', 'Voodoo Doughnut', 'The Buckhorn Exchange', 'My Brother\'s Bar'],
        localTerms: ['the mile high city', 'the mountains', 'the front range', 'the plains', 'the high country']
      },
      
      'Washington': {
        state: 'DC',
        nickname: 'Washingtonians',
        landmarks: ['White House', 'Capitol Building', 'Lincoln Memorial', 'Washington Monument', 'National Mall', 'Smithsonian Museums'],
        streets: ['Pennsylvania Avenue', 'Constitution Avenue', 'Independence Avenue', 'K Street', 'Wisconsin Avenue', 'Connecticut Avenue'],
        neighborhoods: ['Georgetown', 'Dupont Circle', 'Adams Morgan', 'Shaw', 'Logan Circle', 'Capitol Hill', 'Foggy Bottom', 'U Street'],
        sports: ['Commanders', 'Wizards', 'Capitals', 'Nationals', 'Mystics'],
        localBusinesses: ['Ben\'s Chili Bowl', 'Founding Farmers', 'The Hamilton', 'Rasika', 'Jaleo'],
        localTerms: ['the hill', 'the mall', 'the district', 'the metro', 'the beltway']
      },
      
      'Boston': {
        state: 'MA',
        nickname: 'Bostonians',
        landmarks: ['Fenway Park', 'Freedom Trail', 'Boston Common', 'Quincy Market', 'North End', 'Back Bay'],
        streets: ['Boylston Street', 'Newbury Street', 'Tremont Street', 'Beacon Street', 'Commonwealth Avenue', 'Massachusetts Avenue'],
        neighborhoods: ['Back Bay', 'North End', 'South End', 'Beacon Hill', 'Charlestown', 'Dorchester', 'Roxbury', 'Jamaica Plain'],
        sports: ['Red Sox', 'Celtics', 'Bruins', 'Patriots', 'Revolution'],
        localBusinesses: ['Mike\'s Pastry', 'Regina Pizzeria', 'Legal Sea Foods', 'The Union Oyster House', 'Toro'],
        localTerms: ['the T', 'the common', 'the harbor', 'the north end', 'the back bay']
      },
      
      'Nashville': {
        state: 'TN',
        nickname: 'Nashvillians',
        landmarks: ['Grand Ole Opry', 'Country Music Hall of Fame', 'Ryman Auditorium', 'Centennial Park', 'Parthenon', 'Broadway'],
        streets: ['Broadway', '2nd Avenue', 'Music Row', 'West End Avenue', 'Charlotte Avenue', 'Murfreesboro Road'],
        neighborhoods: ['Downtown', 'Music Row', 'Gulch', 'Germantown', 'East Nashville', '12 South', 'Sylvan Park', 'Belle Meade'],
        sports: ['Titans', 'Predators'],
        localBusinesses: ['Hattie B\'s Hot Chicken', 'Prince\'s Hot Chicken', 'Biscuit Love', 'Arnold\'s Country Kitchen', 'The Loveless Cafe'],
        localTerms: ['music city', 'the honky tonks', 'broadway', 'the gulch', 'east nashville']
      },
      
      'Portland': {
        state: 'OR',
        nickname: 'Portlanders',
        landmarks: ['Powell\'s City of Books', 'Washington Park', 'Pittock Mansion', 'International Rose Test Garden', 'Voodoo Doughnut', 'Pioneer Courthouse Square'],
        streets: ['Burnside Street', 'Hawthorne Boulevard', 'Division Street', 'Alberta Street', 'Mississippi Avenue', 'N Williams Avenue'],
        neighborhoods: ['Pearl District', 'Alberta Arts', 'Hawthorne', 'Sellwood', 'St. Johns', 'Mississippi', 'Division', 'Buckman'],
        sports: ['Trail Blazers', 'Timbers', 'Thorns'],
        localBusinesses: ['Voodoo Doughnut', 'Salt & Straw', 'Blue Star Donuts', 'Pok Pok', 'Tasty n Alder'],
        localTerms: ['the pearl', 'the west hills', 'the east side', 'the river', 'keep portland weird']
      }
    };
    
    // Fallback data for smaller cities
    this.stateData = {
      'TX': {
        nickname: 'Texans',
        landmarks: ['the Alamo', 'the state capitol', 'the stockyards', 'the river walk'],
        localTerms: ['y\'all', 'the lone star state', 'big sky country', 'the hill country'],
        sports: ['Longhorns', 'Aggies', 'Cowboys', 'Astros', 'Rockets']
      },
      'CA': {
        nickname: 'Californians',
        landmarks: ['the coast', 'the mountains', 'the valley', 'the bay'],
        localTerms: ['the golden state', 'the coast', 'the valley', 'the bay area'],
        sports: ['Lakers', 'Warriors', 'Dodgers', 'Giants', '49ers']
      },
      'FL': {
        nickname: 'Floridians',
        landmarks: ['the beach', 'the keys', 'the everglades', 'the gulf'],
        localTerms: ['the sunshine state', 'the beach', 'the keys', 'the gulf coast'],
        sports: ['Heat', 'Magic', 'Dolphins', 'Buccaneers', 'Lightning']
      },
      'NY': {
        nickname: 'New Yorkers',
        landmarks: ['the city', 'the park', 'the bridge', 'the statue'],
        localTerms: ['the big apple', 'the city', 'the boroughs', 'the subway'],
        sports: ['Yankees', 'Mets', 'Knicks', 'Nets', 'Giants', 'Jets']
      }
    };
  }
  
  getCityData(cityName, state) {
    // Try exact match first
    if (this.cityData[cityName]) {
      return this.cityData[cityName];
    }
    
    // Try state fallback
    if (this.stateData[state]) {
      return this.stateData[state];
    }
    
    // Generic fallback
    return {
      nickname: 'residents',
      landmarks: ['the downtown area', 'the city center', 'the main street'],
      localTerms: ['the city', 'downtown', 'the area'],
      sports: ['local team', 'the home team']
    };
  }
  
  getRandomLandmark(cityName, state) {
    const data = this.getCityData(cityName, state);
    return data.landmarks[Math.floor(Math.random() * data.landmarks.length)];
  }
  
  getRandomStreet(cityName, state) {
    const data = this.getCityData(cityName, state);
    if (data.streets) {
      return data.streets[Math.floor(Math.random() * data.streets.length)];
    }
    return 'Main Street';
  }
  
  getRandomNeighborhood(cityName, state) {
    const data = this.getCityData(cityName, state);
    if (data.neighborhoods) {
      return data.neighborhoods[Math.floor(Math.random() * data.neighborhoods.length)];
    }
    return 'downtown';
  }
  
  getRandomLocalBusiness(cityName, state) {
    const data = this.getCityData(cityName, state);
    if (data.localBusinesses) {
      return data.localBusinesses[Math.floor(Math.random() * data.localBusinesses.length)];
    }
    return 'local business';
  }
  
  getRandomLocalTerm(cityName, state) {
    const data = this.getCityData(cityName, state);
    if (data.localTerms) {
      return data.localTerms[Math.floor(Math.random() * data.localTerms.length)];
    }
    return 'the area';
  }
  
  getResidentNickname(cityName, state) {
    const data = this.getCityData(cityName, state);
    return data.nickname;
  }
  
  getRandomSportsTeam(cityName, state) {
    const data = this.getCityData(cityName, state);
    if (data.sports) {
      return data.sports[Math.floor(Math.random() * data.sports.length)];
    }
    return 'local team';
  }
}

module.exports = LocalFlavorDatabase;

