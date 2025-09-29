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

# Manually parsed city list by state
cities_by_state = {
    'Alabama': [
        'Alexander City', 'Andalusia', 'Anniston', 'Athens', 'Atmore', 'Auburn', 'Bessemer', 'Birmingham',
        'Chickasaw', 'Clanton', 'Cullman', 'Decatur', 'Demopolis', 'Dothan', 'Enterprise', 'Eufaula',
        'Florence', 'Fort Payne', 'Gadsden', 'Greenville', 'Guntersville', 'Huntsville', 'Jasper', 'Marion',
        'Mobile', 'Montgomery', 'Opelika', 'Ozark', 'Phenix City', 'Prichard', 'Scottsboro', 'Selma',
        'Sheffield', 'Sylacauga', 'Talladega', 'Troy', 'Tuscaloosa', 'Tuscumbia', 'Tuskegee'
    ],
    'Alaska': [
        'Anchorage', 'Cordova', 'Fairbanks', 'Haines', 'Homer', 'Juneau', 'Ketchikan', 'Kodiak',
        'Kotzebue', 'Nome', 'Palmer', 'Seward', 'Sitka', 'Skagway', 'Valdez'
    ],
    'Arizona': [
        'Ajo', 'Avondale', 'Bisbee', 'Casa Grande', 'Chandler', 'Clifton', 'Douglas', 'Flagstaff',
        'Florence', 'Gila Bend', 'Glendale', 'Globe', 'Kingman', 'Lake Havasu City', 'Mesa', 'Nogales',
        'Oraibi', 'Phoenix', 'Prescott', 'Scottsdale', 'Sierra Vista', 'Tempe', 'Tombstone', 'Tucson',
        'Walpi', 'Window Rock', 'Winslow', 'Yuma'
    ]
}

def build_cities():
    cities = []
    city_id = 1
    
    for state_name, city_list in cities_by_state.items():
        state_info = states[state_name]
        for city_name in city_list:
            cities.append({
                'id': str(city_id),
                'name': city_name,
                'state': state_info['abbr'],
                'stateName': state_name,
                'population': 0,
                'region': state_info['region']
            })
            city_id += 1
    
    return cities

if __name__ == "__main__":
    cities = build_cities()
    with open('server/data/cities.json', 'w') as f:
        json.dump(cities, f, indent=2)
    print(f"Created cities.json with {len(cities)} cities")
