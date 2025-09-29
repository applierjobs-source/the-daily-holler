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

# Known multi-word city names that need special handling
multi_word_cities = {
    'New York City', 'San Francisco', 'Los Angeles', 'San Diego', 'San Antonio',
    'San Jose', 'San Bernardino', 'San Clemente', 'San Fernando', 'San Gabriel',
    'San Juan Capistrano', 'San Leandro', 'San Luis Obispo', 'San Marino',
    'San Mateo', 'San Pedro', 'San Rafael', 'San Simeon', 'Santa Ana',
    'Santa Barbara', 'Santa Clara', 'Santa Clarita', 'Santa Cruz', 'Santa Monica',
    'Santa Rosa', 'South San Francisco', 'New Orleans', 'Fort Worth', 'El Paso',
    'Las Vegas', 'New Haven', 'New London', 'New Britain', 'New Milford',
    'New Brunswick', 'New Paltz', 'New Rochelle', 'New Windsor', 'New York City',
    'Newburgh', 'North Hempstead', 'New Bern', 'New Castle', 'New Harmony',
    'New Albany', 'New Philadelphia', 'New Braunfels', 'New Hope', 'New Kensington',
    'New Market', 'New Martinsville', 'New Glarus', 'New Ulm', 'New Madrid',
    'New Madrid', 'New Madrid', 'New Madrid', 'New Madrid', 'New Madrid'
}

def parse_cities():
    cities = []
    city_id = 1
    current_state = None
    
    # This is a simplified version - in practice, you'd need to manually parse
    # the complex city list with proper handling of multi-word names
    
    # For now, let's create a basic structure
    # You would need to manually go through the list and identify where
    # state names appear vs city names
    
    return cities

if __name__ == "__main__":
    cities = parse_cities()
    with open('server/data/cities.json', 'w') as f:
        json.dump(cities, f, indent=2)
    print(f"Created cities.json with {len(cities)} cities")
