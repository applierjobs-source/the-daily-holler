#!/usr/bin/env python3
import json
import re

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

# Known multi-word city patterns
multi_word_patterns = [
    r'New York City', r'San Francisco', r'Los Angeles', r'San Diego', r'San Antonio',
    r'San Jose', r'San Bernardino', r'San Clemente', r'San Fernando', r'San Gabriel',
    r'San Juan Capistrano', r'San Leandro', r'San Luis Obispo', r'San Marino',
    r'San Mateo', r'San Pedro', r'San Rafael', r'San Simeon', r'Santa Ana',
    r'Santa Barbara', r'Santa Clara', r'Santa Clarita', r'Santa Cruz', r'Santa Monica',
    r'Santa Rosa', r'South San Francisco', r'New Orleans', r'Fort Worth', r'El Paso',
    r'Las Vegas', r'New Haven', r'New London', r'New Britain', r'New Milford',
    r'New Brunswick', r'New Paltz', r'New Rochelle', r'New Windsor', r'New York City',
    r'Newburgh', r'North Hempstead', r'New Bern', r'New Castle', r'New Harmony',
    r'New Albany', r'New Philadelphia', r'New Braunfels', r'New Hope', r'New Kensington',
    r'New Market', r'New Martinsville', r'New Glarus', r'New Ulm', r'New Madrid',
    r'Lake Havasu City', r'Cocoa-Rockledge', r'De Land', r'Deerfield Beach', r'Delray Beach',
    r'Fernandina Beach', r'Fort Lauderdale', r'Fort Myers', r'Fort Pierce', r'Fort Walton Beach',
    r'Hallandale Beach', r'Key West', r'Lake City', r'Lake Wales', r'New Smyrna Beach',
    r'Ormond Beach', r'Palm Bay', r'Palm Beach', r'Panama City', r'Saint Augustine',
    r'Saint Petersburg', r'West Palm Beach', r'White Springs', r'Winter Haven', r'Winter Park'
]

def parse_city_list():
    # This is a simplified version - in practice, you'd need to implement
    # the full parsing logic for the 1,587 cities
    cities = []
    city_id = 1
    
    # For now, return a basic structure
    # The full implementation would parse the entire city list
    return cities

if __name__ == "__main__":
    cities = parse_city_list()
    with open('server/data/cities.json', 'w') as f:
        json.dump(cities, f, indent=2)
    print(f"Created cities.json with {len(cities)} cities")
