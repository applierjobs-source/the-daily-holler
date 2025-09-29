#!/usr/bin/env python3
import json

# State mapping
states = {
    'Alabama': {'abbr': 'AL', 'region': 'Southeast'},
    'Alaska': {'abbr': 'AK', 'region': 'West'},
    'Arizona': {'abbr': 'AZ', 'region': 'Southwest'},
    'Arkansas': {'abbr': 'AR', 'region': 'Southeast'},
    'California': {'abbr': 'CA', 'region': 'West'},
    'Colorado': {'abbr': 'CO', 'region': 'West'},
    'Connecticut': {'abbr': 'CT', 'region': 'Northeast'},
    'Delaware': {'abbr': 'DE', 'region': 'Northeast'},
    'Florida': {'abbr': 'FL', 'region': 'Southeast'},
    'Georgia': {'abbr': 'GA', 'region': 'Southeast'},
    'Hawaii': {'abbr': 'HI', 'region': 'West'},
    'Idaho': {'abbr': 'ID', 'region': 'West'},
    'Illinois': {'abbr': 'IL', 'region': 'Midwest'},
    'Indiana': {'abbr': 'IN', 'region': 'Midwest'},
    'Iowa': {'abbr': 'IA', 'region': 'Midwest'},
    'Kansas': {'abbr': 'KS', 'region': 'Midwest'},
    'Kentucky': {'abbr': 'KY', 'region': 'Southeast'},
    'Louisiana': {'abbr': 'LA', 'region': 'Southeast'},
    'Maine': {'abbr': 'ME', 'region': 'Northeast'},
    'Maryland': {'abbr': 'MD', 'region': 'Northeast'},
    'Massachusetts': {'abbr': 'MA', 'region': 'Northeast'},
    'Michigan': {'abbr': 'MI', 'region': 'Midwest'},
    'Minnesota': {'abbr': 'MN', 'region': 'Midwest'},
    'Mississippi': {'abbr': 'MS', 'region': 'Southeast'},
    'Missouri': {'abbr': 'MO', 'region': 'Midwest'},
    'Montana': {'abbr': 'MT', 'region': 'West'},
    'Nebraska': {'abbr': 'NE', 'region': 'Midwest'},
    'Nevada': {'abbr': 'NV', 'region': 'West'},
    'New Hampshire': {'abbr': 'NH', 'region': 'Northeast'},
    'New Jersey': {'abbr': 'NJ', 'region': 'Northeast'},
    'New Mexico': {'abbr': 'NM', 'region': 'Southwest'},
    'New York': {'abbr': 'NY', 'region': 'Northeast'},
    'North Carolina': {'abbr': 'NC', 'region': 'Southeast'},
    'North Dakota': {'abbr': 'ND', 'region': 'Midwest'},
    'Ohio': {'abbr': 'OH', 'region': 'Midwest'},
    'Oklahoma': {'abbr': 'OK', 'region': 'Southwest'},
    'Oregon': {'abbr': 'OR', 'region': 'West'},
    'Pennsylvania': {'abbr': 'PA', 'region': 'Northeast'},
    'Rhode Island': {'abbr': 'RI', 'region': 'Northeast'},
    'South Carolina': {'abbr': 'SC', 'region': 'Southeast'},
    'South Dakota': {'abbr': 'SD', 'region': 'Midwest'},
    'Tennessee': {'abbr': 'TN', 'region': 'Southeast'},
    'Texas': {'abbr': 'TX', 'region': 'Southwest'},
    'Utah': {'abbr': 'UT', 'region': 'West'},
    'Vermont': {'abbr': 'VT', 'region': 'Northeast'},
    'Virginia': {'abbr': 'VA', 'region': 'Southeast'},
    'Washington': {'abbr': 'WA', 'region': 'West'},
    'West Virginia': {'abbr': 'WV', 'region': 'Southeast'},
    'Wisconsin': {'abbr': 'WI', 'region': 'Midwest'},
    'Wyoming': {'abbr': 'WY', 'region': 'West'}
}

# Complete city list by state - continuing from where you left off
cities_by_state = {
    'Colorado': [
        'Alamosa', 'Aspen', 'Aurora', 'Boulder', 'Breckenridge', 'Brighton', 'Canon City', 'Central City',
        'Climax', 'Colorado Springs', 'Cortez', 'Cripple Creek', 'Denver', 'Durango', 'Englewood', 'Estes Park',
        'Fort Collins', 'Fort Morgan', 'Georgetown', 'Glenwood Springs', 'Golden', 'Grand Junction', 'Greeley',
        'Gunnison', 'La Junta', 'Leadville', 'Littleton', 'Longmont', 'Loveland', 'Montrose', 'Ouray',
        'Pagosa Springs', 'Pueblo', 'Silverton', 'Steamboat Springs', 'Sterling', 'Telluride', 'Trinidad',
        'Vail', 'Walsenburg', 'Westminster'
    ],
    'Connecticut': [
        'Ansonia', 'Berlin', 'Bloomfield', 'Branford', 'Bridgeport', 'Bristol', 'Coventry', 'Danbury',
        'Darien', 'Derby', 'East Hartford', 'East Haven', 'Enfield', 'Fairfield', 'Farmington', 'Greenwich',
        'Groton', 'Guilford', 'Hamden', 'Hartford', 'Lebanon', 'Litchfield', 'Manchester', 'Mansfield',
        'Meriden', 'Middletown', 'Milford', 'Mystic', 'Naugatuck', 'New Britain', 'New Haven', 'New London',
        'North Haven', 'Norwalk', 'Norwich', 'Old Saybrook', 'Orange', 'Seymour', 'Shelton', 'Simsbury',
        'Southington', 'Stamford', 'Stonington', 'Stratford', 'Torrington', 'Wallingford', 'Waterbury',
        'Waterford', 'Watertown', 'West Hartford', 'West Haven', 'Westport', 'Wethersfield', 'Willimantic',
        'Windham', 'Windsor', 'Windsor Locks', 'Winsted'
    ],
    'Delaware': [
        'Dover', 'Lewes', 'Milford', 'New Castle', 'Newark', 'Smyrna', 'Wilmington'
    ],
    'Florida': [
        'Apalachicola', 'Bartow', 'Belle Glade', 'Boca Raton', 'Bradenton', 'Cape Coral', 'Clearwater',
        'Cocoa Beach', 'Cocoa-Rockledge', 'Coral Gables', 'Daytona Beach', 'De Land', 'Deerfield Beach',
        'Delray Beach', 'Fernandina Beach', 'Fort Lauderdale', 'Fort Myers', 'Fort Pierce', 'Fort Walton Beach',
        'Gainesville', 'Hallandale Beach', 'Hialeah', 'Hollywood', 'Homestead', 'Jacksonville', 'Key West',
        'Lake City', 'Lake Wales', 'Lakeland', 'Largo', 'Melbourne', 'Miami', 'Miami Beach', 'Naples',
        'New Smyrna Beach', 'Ocala', 'Orlando', 'Ormond Beach', 'Palatka', 'Palm Bay', 'Palm Beach',
        'Panama City', 'Pensacola', 'Pompano Beach', 'Saint Augustine', 'Saint Petersburg', 'Sanford',
        'Sarasota', 'Sebring', 'Tallahassee', 'Tampa', 'Tarpon Springs', 'Titusville', 'Venice',
        'West Palm Beach', 'White Springs', 'Winter Haven', 'Winter Park'
    ],
    'Georgia': [
        'Albany', 'Americus', 'Andersonville', 'Athens', 'Atlanta', 'Augusta', 'Bainbridge', 'Blairsville',
        'Brunswick', 'Calhoun', 'Carrollton', 'Columbus', 'Dahlonega', 'Dalton', 'Darien', 'Decatur',
        'Douglas', 'East Point', 'Fitzgerald', 'Fort Valley', 'Gainesville', 'La Grange', 'Macon', 'Marietta',
        'Milledgeville', 'Plains', 'Rome', 'Savannah', 'Toccoa', 'Valdosta', 'Warm Springs', 'Warner Robins',
        'Washington', 'Waycross'
    ],
    'Hawaii': [
        'Hanalei', 'Hilo', 'Honaunau', 'Honolulu', 'Kahului', 'Kaneohe', 'Kapaa', 'Kawaihae', 'Lahaina',
        'Laie', 'Wahiawa', 'Wailuku', 'Waimea'
    ],
    'Idaho': [
        'Blackfoot', 'Boise', 'Bonners Ferry', 'Caldwell', 'Coeur d\'Alene', 'Idaho City', 'Idaho Falls',
        'Kellogg', 'Lewiston', 'Moscow', 'Nampa', 'Pocatello', 'Priest River', 'Rexburg', 'Sun Valley',
        'Twin Falls'
    ],
    'Illinois': [
        'Alton', 'Arlington Heights', 'Arthur', 'Aurora', 'Belleville', 'Belvidere', 'Bloomington', 'Brookfield',
        'Cahokia', 'Cairo', 'Calumet City', 'Canton', 'Carbondale', 'Carlinville', 'Carthage', 'Centralia',
        'Champaign', 'Charleston', 'Chester', 'Chicago', 'Chicago Heights', 'Cicero', 'Collinsville', 'Danville',
        'Decatur', 'DeKalb', 'Des Plaines', 'Dixon', 'East Moline', 'East Saint Louis', 'Effingham', 'Elgin',
        'Elmhurst', 'Evanston', 'Freeport', 'Galena', 'Galesburg', 'Glen Ellyn', 'Glenview', 'Granite City',
        'Harrisburg', 'Herrin', 'Highland Park', 'Jacksonville', 'Joliet', 'Kankakee', 'Kaskaskia', 'Kewanee',
        'La Salle', 'Lake Forest', 'Libertyville', 'Lincoln', 'Lisle', 'Lombard', 'Macomb', 'Mattoon', 'Moline',
        'Monmouth', 'Mount Vernon', 'Mundelein', 'Naperville', 'Nauvoo', 'Normal', 'North Chicago', 'Oak Park',
        'Oregon', 'Ottawa', 'Palatine', 'Park Forest', 'Park Ridge', 'Pekin', 'Peoria', 'Petersburg', 'Pontiac',
        'Quincy', 'Rantoul', 'River Forest', 'Rock Island', 'Rockford', 'Salem', 'Shawneetown', 'Skokie',
        'South Holland', 'Springfield', 'Streator', 'Summit', 'Urbana', 'Vandalia', 'Virden', 'Waukegan',
        'Wheaton', 'Wilmette', 'Winnetka', 'Wood River', 'Zion'
    ]
    # Note: This is a partial list. I'll continue with more states in the next iteration
}

def add_remaining_cities():
    # Read existing cities
    with open('server/data/cities.json', 'r') as f:
        existing_cities = json.load(f)
    
    # Find the next ID
    next_id = max(int(city['id']) for city in existing_cities) + 1
    
    # Add new cities
    new_cities = []
    for state_name, city_list in cities_by_state.items():
        state_info = states[state_name]
        for city_name in city_list:
            new_cities.append({
                'id': str(next_id),
                'name': city_name,
                'state': state_info['abbr'],
                'stateName': state_name,
                'population': 0,
                'region': state_info['region']
            })
            next_id += 1
    
    # Combine existing and new cities
    all_cities = existing_cities + new_cities
    
    # Write back to file
    with open('server/data/cities.json', 'w') as f:
        json.dump(all_cities, f, indent=2)
    
    return len(new_cities), len(all_cities)

if __name__ == "__main__":
    new_count, total_count = add_remaining_cities()
    print(f"Added {new_count} new cities. Total cities: {total_count}")
