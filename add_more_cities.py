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

# More states and cities
cities_by_state = {
    'Indiana': [
        'Anderson', 'Bedford', 'Bloomington', 'Columbus', 'Connersville', 'Corydon', 'Crawfordsville',
        'East Chicago', 'Elkhart', 'Elwood', 'Evansville', 'Fort Wayne', 'French Lick', 'Gary', 'Geneva',
        'Goshen', 'Greenfield', 'Hammond', 'Hobart', 'Huntington', 'Indianapolis', 'Jeffersonville', 'Kokomo',
        'Lafayette', 'Madison', 'Marion', 'Michigan City', 'Mishawaka', 'Muncie', 'Nappanee', 'Nashville',
        'New Albany', 'New Castle', 'New Harmony', 'Peru', 'Plymouth', 'Richmond', 'Santa Claus', 'Shelbyville',
        'South Bend', 'Terre Haute', 'Valparaiso', 'Vincennes', 'Wabash', 'West Lafayette'
    ],
    'Iowa': [
        'Amana Colonies', 'Ames', 'Boone', 'Burlington', 'Cedar Falls', 'Cedar Rapids', 'Charles City',
        'Cherokee', 'Clinton', 'Council Bluffs', 'Davenport', 'Des Moines', 'Dubuque', 'Estherville',
        'Fairfield', 'Fort Dodge', 'Grinnell', 'Indianola', 'Iowa City', 'Keokuk', 'Mason City', 'Mount Pleasant',
        'Muscatine', 'Newton', 'Oskaloosa', 'Ottumwa', 'Sioux City', 'Waterloo', 'Webster City', 'West Des Moines'
    ],
    'Kansas': [
        'Abilene', 'Arkansas City', 'Atchison', 'Chanute', 'Coffeyville', 'Council Grove', 'Dodge City',
        'Emporia', 'Fort Scott', 'Garden City', 'Great Bend', 'Hays', 'Hutchinson', 'Independence', 'Junction City',
        'Kansas City', 'Lawrence', 'Leavenworth', 'Liberal', 'Manhattan', 'McPherson', 'Medicine Lodge', 'Newton',
        'Olathe', 'Osawatomie', 'Ottawa', 'Overland Park', 'Pittsburg', 'Salina', 'Shawnee', 'Smith Center',
        'Topeka', 'Wichita'
    ],
    'Kentucky': [
        'Ashland', 'Barbourville', 'Bardstown', 'Berea', 'Boonesborough', 'Bowling Green', 'Campbellsville',
        'Covington', 'Danville', 'Elizabethtown', 'Frankfort', 'Harlan', 'Harrodsburg', 'Hazard', 'Henderson',
        'Hodgenville', 'Hopkinsville', 'Lexington', 'Louisville', 'Mayfield', 'Maysville', 'Middlesboro',
        'Newport', 'Owensboro', 'Paducah', 'Paris', 'Richmond'
    ],
    'Louisiana': [
        'Abbeville', 'Alexandria', 'Bastrop', 'Baton Rouge', 'Bogalusa', 'Bossier City', 'Gretna', 'Houma',
        'Lafayette', 'Lake Charles', 'Monroe', 'Morgan City', 'Natchitoches', 'New Iberia', 'New Orleans',
        'Opelousas', 'Ruston', 'Saint Martinville', 'Shreveport', 'Thibodaux'
    ],
    'Maine': [
        'Auburn', 'Augusta', 'Bangor', 'Bar Harbor', 'Bath', 'Belfast', 'Biddeford', 'Boothbay Harbor',
        'Brunswick', 'Calais', 'Caribou', 'Castine', 'Eastport', 'Ellsworth', 'Farmington', 'Fort Kent',
        'Gardiner', 'Houlton', 'Kennebunkport', 'Kittery', 'Lewiston', 'Lubec', 'Machias', 'Orono',
        'Portland', 'Presque Isle', 'Rockland', 'Rumford', 'Saco', 'Scarborough', 'Waterville', 'York'
    ],
    'Maryland': [
        'Aberdeen', 'Annapolis', 'Baltimore', 'Bethesda-Chevy Chase', 'Bowie', 'Cambridge', 'Catonsville',
        'College Park', 'Columbia', 'Cumberland', 'Easton', 'Elkton', 'Emmitsburg', 'Frederick', 'Greenbelt',
        'Hagerstown', 'Hyattsville', 'Laurel', 'Oakland', 'Ocean City', 'Rockville', 'Saint Marys City',
        'Salisbury', 'Silver Spring', 'Takoma Park', 'Towson', 'Westminster'
    ],
    'Massachusetts': [
        'Abington', 'Adams', 'Amesbury', 'Amherst', 'Andover', 'Arlington', 'Athol', 'Attleboro', 'Barnstable',
        'Bedford', 'Beverly', 'Boston', 'Bourne', 'Braintree', 'Brockton', 'Brookline', 'Cambridge', 'Canton',
        'Charlestown', 'Chelmsford', 'Chelsea', 'Chicopee', 'Clinton', 'Cohasset', 'Concord', 'Danvers',
        'Dartmouth', 'Dedham', 'Dennis', 'Duxbury', 'Eastham', 'Edgartown', 'Everett', 'Fairhaven', 'Fall River',
        'Falmouth', 'Fitchburg', 'Framingham', 'Gloucester', 'Great Barrington', 'Greenfield', 'Groton', 'Harwich',
        'Haverhill', 'Hingham', 'Holyoke', 'Hyannis', 'Ipswich', 'Lawrence', 'Lenox', 'Leominster', 'Lexington',
        'Lowell', 'Ludlow', 'Lynn', 'Malden', 'Marblehead', 'Marlborough', 'Medford', 'Milton', 'Nahant',
        'Natick', 'New Bedford', 'Newburyport', 'Newton', 'North Adams', 'Northampton', 'Norton', 'Norwood',
        'Peabody', 'Pittsfield', 'Plymouth', 'Provincetown', 'Quincy', 'Randolph', 'Revere', 'Salem', 'Sandwich',
        'Saugus', 'Somerville', 'South Hadley', 'Springfield', 'Stockbridge', 'Stoughton', 'Sturbridge', 'Sudbury',
        'Taunton', 'Tewksbury', 'Truro', 'Watertown', 'Webster', 'Wellesley', 'Wellfleet', 'West Bridgewater',
        'West Springfield', 'Westfield', 'Weymouth', 'Whitman', 'Williamstown', 'Woburn', 'Woods Hole', 'Worcester'
    ],
    'Michigan': [
        'Adrian', 'Alma', 'Ann Arbor', 'Battle Creek', 'Bay City', 'Benton Harbor', 'Bloomfield Hills', 'Cadillac',
        'Charlevoix', 'Cheboygan', 'Dearborn', 'Detroit', 'East Lansing', 'Eastpointe', 'Ecorse', 'Escanaba',
        'Flint', 'Grand Haven', 'Grand Rapids', 'Grayling', 'Grosse Pointe', 'Hancock', 'Highland Park', 'Holland',
        'Houghton', 'Interlochen', 'Iron Mountain', 'Ironwood', 'Ishpeming', 'Jackson', 'Kalamazoo', 'Lansing',
        'Livonia', 'Ludington', 'Mackinaw City', 'Manistee', 'Marquette', 'Menominee', 'Midland', 'Monroe',
        'Mount Clemens', 'Mount Pleasant', 'Muskegon', 'Niles', 'Petoskey', 'Pontiac', 'Port Huron', 'Royal Oak',
        'Saginaw', 'Saint Ignace', 'Saint Joseph', 'Sault Sainte Marie', 'Traverse City', 'Trenton', 'Warren',
        'Wyandotte', 'Ypsilanti'
    ],
    'Minnesota': [
        'Albert Lea', 'Alexandria', 'Austin', 'Bemidji', 'Bloomington', 'Brainerd', 'Crookston', 'Duluth', 'Ely',
        'Eveleth', 'Faribault', 'Fergus Falls', 'Hastings', 'Hibbing', 'International Falls', 'Little Falls',
        'Mankato', 'Minneapolis', 'Moorhead', 'New Ulm', 'Northfield', 'Owatonna', 'Pipestone', 'Red Wing',
        'Rochester', 'Saint Cloud', 'Saint Paul', 'Sauk Centre', 'South Saint Paul', 'Stillwater', 'Virginia',
        'Willmar', 'Winona'
    ],
    'Mississippi': [
        'Bay Saint Louis', 'Biloxi', 'Canton', 'Clarksdale', 'Columbia', 'Columbus', 'Corinth', 'Greenville',
        'Greenwood', 'Grenada', 'Gulfport', 'Hattiesburg', 'Holly Springs', 'Jackson', 'Laurel', 'Meridian',
        'Natchez', 'Ocean Springs', 'Oxford', 'Pascagoula', 'Pass Christian', 'Philadelphia', 'Port Gibson',
        'Starkville', 'Tupelo', 'Vicksburg', 'West Point', 'Yazoo City'
    ],
    'Missouri': [
        'Boonville', 'Branson', 'Cape Girardeau', 'Carthage', 'Chillicothe', 'Clayton', 'Columbia', 'Excelsior Springs',
        'Ferguson', 'Florissant', 'Fulton', 'Hannibal', 'Independence', 'Jefferson City', 'Joplin', 'Kansas City',
        'Kirksville', 'Lamar', 'Lebanon', 'Lexington', 'Maryville', 'Mexico', 'Monett', 'Neosho', 'New Madrid',
        'Rolla', 'Saint Charles', 'Saint Joseph', 'Saint Louis', 'Sainte Genevieve', 'Salem', 'Sedalia', 'Springfield',
        'Warrensburg', 'West Plains'
    ],
    'Montana': [
        'Anaconda', 'Billings', 'Bozeman', 'Butte', 'Dillon', 'Fort Benton', 'Glendive', 'Great Falls', 'Havre',
        'Helena', 'Kalispell', 'Lewistown', 'Livingston', 'Miles City', 'Missoula', 'Virginia City'
    ],
    'Nebraska': [
        'Beatrice', 'Bellevue', 'Boys Town', 'Chadron', 'Columbus', 'Fremont', 'Grand Island', 'Hastings', 'Kearney',
        'Lincoln', 'McCook', 'Minden', 'Nebraska City', 'Norfolk', 'North Platte', 'Omaha', 'Plattsmouth', 'Red Cloud',
        'Sidney'
    ],
    'Nevada': [
        'Boulder City', 'Carson City', 'Elko', 'Ely', 'Fallon', 'Genoa', 'Goldfield', 'Henderson', 'Las Vegas',
        'North Las Vegas', 'Reno', 'Sparks', 'Virginia City', 'Winnemucca'
    ],
    'New Hampshire': [
        'Berlin', 'Claremont', 'Concord', 'Derry', 'Dover', 'Durham', 'Exeter', 'Franklin', 'Hanover', 'Hillsborough',
        'Keene', 'Laconia', 'Lebanon', 'Manchester', 'Nashua', 'Peterborough', 'Plymouth', 'Portsmouth', 'Rochester',
        'Salem', 'Somersworth'
    ],
    'New Jersey': [
        'Asbury Park', 'Atlantic City', 'Bayonne', 'Bloomfield', 'Bordentown', 'Bound Brook', 'Bridgeton', 'Burlington',
        'Caldwell', 'Camden', 'Cape May', 'Clifton', 'Cranford', 'East Orange', 'Edison', 'Elizabeth', 'Englewood',
        'Fort Lee', 'Glassboro', 'Hackensack', 'Haddonfield', 'Hoboken', 'Irvington', 'Jersey City', 'Lakehurst',
        'Lakewood', 'Long Beach', 'Long Branch', 'Madison', 'Menlo Park', 'Millburn', 'Millville', 'Montclair',
        'Morristown', 'Mount Holly', 'New Brunswick', 'New Milford', 'Newark', 'Ocean City', 'Orange',
        'Parsippany–Troy Hills', 'Passaic', 'Paterson', 'Perth Amboy', 'Plainfield', 'Princeton', 'Ridgewood',
        'Roselle', 'Rutherford', 'Salem', 'Somerville', 'South Orange Village', 'Totowa', 'Trenton', 'Union',
        'Union City', 'Vineland', 'Wayne', 'Weehawken', 'West New York', 'West Orange', 'Willingboro', 'Woodbridge'
    ],
    'New Mexico': [
        'Acoma', 'Alamogordo', 'Albuquerque', 'Artesia', 'Belen', 'Carlsbad', 'Clovis', 'Deming', 'Farmington',
        'Gallup', 'Grants', 'Hobbs', 'Las Cruces', 'Las Vegas', 'Los Alamos', 'Lovington', 'Portales', 'Raton',
        'Roswell', 'Santa Fe', 'Shiprock', 'Silver City', 'Socorro', 'Taos', 'Truth or Consequences', 'Tucumcari'
    ],
    'New York': [
        'Albany', 'Amsterdam', 'Auburn', 'Babylon', 'Batavia', 'Beacon', 'Bedford', 'Binghamton', 'Bronx', 'Brooklyn',
        'Buffalo', 'Chautauqua', 'Cheektowaga', 'Clinton', 'Cohoes', 'Coney Island', 'Cooperstown', 'Corning',
        'Cortland', 'Crown Point', 'Dunkirk', 'East Aurora', 'East Hampton', 'Eastchester', 'Elmira', 'Flushing',
        'Forest Hills', 'Fredonia', 'Garden City', 'Geneva', 'Glens Falls', 'Gloversville', 'Great Neck',
        'Hammondsport', 'Harlem', 'Hempstead', 'Herkimer', 'Hudson', 'Huntington', 'Hyde Park', 'Ilion', 'Ithaca',
        'Jamestown', 'Johnstown', 'Kingston', 'Lackawanna', 'Lake Placid', 'Levittown', 'Lockport', 'Mamaroneck',
        'Manhattan', 'Massena', 'Middletown', 'Mineola', 'Mount Vernon', 'New Paltz', 'New Rochelle', 'New Windsor',
        'New York City', 'Newburgh', 'Niagara Falls', 'North Hempstead', 'Nyack', 'Ogdensburg', 'Olean', 'Oneida',
        'Oneonta', 'Ossining', 'Oswego', 'Oyster Bay', 'Palmyra', 'Peekskill', 'Plattsburgh', 'Port Washington',
        'Potsdam', 'Poughkeepsie', 'Queens', 'Rensselaer', 'Rochester', 'Rome', 'Rotterdam', 'Rye', 'Sag Harbor',
        'Saranac Lake', 'Saratoga Springs', 'Scarsdale', 'Schenectady', 'Seneca Falls', 'Southampton', 'Staten Island',
        'Stony Brook', 'Stony Point', 'Syracuse', 'Tarrytown', 'Ticonderoga', 'Tonawanda', 'Troy', 'Utica',
        'Watertown', 'Watervliet', 'Watkins Glen', 'West Seneca', 'White Plains', 'Woodstock', 'Yonkers'
    ],
    'North Carolina': [
        'Asheboro', 'Asheville', 'Bath', 'Beaufort', 'Boone', 'Burlington', 'Chapel Hill', 'Charlotte', 'Concord',
        'Durham', 'Edenton', 'Elizabeth City', 'Fayetteville', 'Gastonia', 'Goldsboro', 'Greensboro', 'Greenville',
        'Halifax', 'Henderson', 'Hickory', 'High Point', 'Hillsborough', 'Jacksonville', 'Kinston', 'Kitty Hawk',
        'Lumberton', 'Morehead City', 'Morganton', 'Nags Head', 'New Bern', 'Pinehurst', 'Raleigh', 'Rocky Mount',
        'Salisbury', 'Shelby', 'Washington', 'Wilmington', 'Wilson', 'Winston-Salem'
    ],
    'North Dakota': [
        'Bismarck', 'Devils Lake', 'Dickinson', 'Fargo', 'Grand Forks', 'Jamestown', 'Mandan', 'Minot', 'Rugby',
        'Valley City', 'Wahpeton', 'Williston'
    ],
    'Ohio': [
        'Akron', 'Alliance', 'Ashtabula', 'Athens', 'Barberton', 'Bedford', 'Bellefontaine', 'Bowling Green',
        'Canton', 'Chillicothe', 'Cincinnati', 'Cleveland', 'Cleveland Heights', 'Columbus', 'Conneaut',
        'Cuyahoga Falls', 'Dayton', 'Defiance', 'Delaware', 'East Cleveland', 'East Liverpool', 'Elyria', 'Euclid',
        'Findlay', 'Gallipolis', 'Greenville', 'Hamilton', 'Kent', 'Kettering', 'Lakewood', 'Lancaster', 'Lima',
        'Lorain', 'Mansfield', 'Marietta', 'Marion', 'Martins Ferry', 'Massillon', 'Mentor', 'Middletown', 'Milan',
        'Mount Vernon', 'New Philadelphia', 'Newark', 'Niles', 'North College Hill', 'Norwalk', 'Oberlin', 'Painesville',
        'Parma', 'Piqua', 'Portsmouth', 'Put-in-Bay', 'Salem', 'Sandusky', 'Shaker Heights', 'Springfield',
        'Steubenville', 'Tiffin', 'Toledo', 'Urbana', 'Warren', 'Wooster', 'Worthington', 'Xenia', 'Yellow Springs',
        'Youngstown', 'Zanesville'
    ],
    'Oklahoma': [
        'Ada', 'Altus', 'Alva', 'Anadarko', 'Ardmore', 'Bartlesville', 'Bethany', 'Chickasha', 'Claremore',
        'Clinton', 'Cushing', 'Duncan', 'Durant', 'Edmond', 'El Reno', 'Elk City', 'Enid', 'Eufaula', 'Frederick',
        'Guthrie', 'Guymon', 'Hobart', 'Holdenville', 'Hugo', 'Lawton', 'McAlester', 'Miami', 'Midwest City',
        'Moore', 'Muskogee', 'Norman', 'Oklahoma City', 'Okmulgee', 'Pauls Valley', 'Pawhuska', 'Perry', 'Ponca City',
        'Pryor', 'Sallisaw', 'Sand Springs', 'Sapulpa', 'Seminole', 'Shawnee', 'Stillwater', 'Tahlequah', 'The Village',
        'Tulsa', 'Vinita', 'Wewoka', 'Woodward'
    ],
    'Oregon': [
        'Albany', 'Ashland', 'Astoria', 'Baker City', 'Beaverton', 'Bend', 'Brookings', 'Burns', 'Coos Bay',
        'Corvallis', 'Eugene', 'Grants Pass', 'Hillsboro', 'Hood River', 'Jacksonville', 'John Day', 'Klamath Falls',
        'La Grande', 'Lake Oswego', 'Lakeview', 'McMinnville', 'Medford', 'Newberg', 'Newport', 'Ontario',
        'Oregon City', 'Pendleton', 'Port Orford', 'Portland', 'Prineville', 'Redmond', 'Reedsport', 'Roseburg',
        'Salem', 'Seaside', 'Springfield', 'The Dalles', 'Tillamook'
    ],
    'Pennsylvania': [
        'Abington', 'Aliquippa', 'Allentown', 'Altoona', 'Ambridge', 'Bedford', 'Bethlehem', 'Bloomsburg', 'Bradford',
        'Bristol', 'Carbondale', 'Carlisle', 'Chambersburg', 'Chester', 'Columbia', 'Easton', 'Erie', 'Franklin',
        'Germantown', 'Gettysburg', 'Greensburg', 'Hanover', 'Harmony', 'Harrisburg', 'Hazleton', 'Hershey',
        'Homestead', 'Honesdale', 'Indiana', 'Jeannette', 'Jim Thorpe', 'Johnstown', 'Lancaster', 'Lebanon',
        'Levittown', 'Lewistown', 'Lock Haven', 'Lower Southampton', 'McKeesport', 'Meadville', 'Middletown',
        'Monroeville', 'Nanticoke', 'New Castle', 'New Hope', 'New Kensington', 'Norristown', 'Oil City',
        'Philadelphia', 'Phoenixville', 'Pittsburgh', 'Pottstown', 'Pottsville', 'Reading', 'Scranton', 'Shamokin',
        'Sharon', 'State College', 'Stroudsburg', 'Sunbury', 'Swarthmore', 'Tamaqua', 'Titusville', 'Uniontown',
        'Warren', 'Washington', 'West Chester', 'Wilkes-Barre', 'Williamsport', 'York'
    ],
    'Rhode Island': [
        'Barrington', 'Bristol', 'Central Falls', 'Cranston', 'East Greenwich', 'East Providence', 'Kingston',
        'Middletown', 'Narragansett', 'Newport', 'North Kingstown', 'Pawtucket', 'Portsmouth', 'Providence',
        'South Kingstown', 'Tiverton', 'Warren', 'Warwick', 'Westerly', 'Wickford', 'Woonsocket'
    ],
    'South Carolina': [
        'Abbeville', 'Aiken', 'Anderson', 'Beaufort', 'Camden', 'Charleston', 'Columbia', 'Darlington', 'Florence',
        'Gaffney', 'Georgetown', 'Greenville', 'Greenwood', 'Hartsville', 'Lancaster', 'Mount Pleasant', 'Myrtle Beach',
        'Orangeburg', 'Rock Hill', 'Spartanburg', 'Sumter', 'Union'
    ],
    'South Dakota': [
        'Aberdeen', 'Belle Fourche', 'Brookings', 'Canton', 'Custer', 'De Smet', 'Deadwood', 'Hot Springs', 'Huron',
        'Lead', 'Madison', 'Milbank', 'Mitchell', 'Mobridge', 'Pierre', 'Rapid City', 'Sioux Falls', 'Spearfish',
        'Sturgis', 'Vermillion', 'Watertown', 'Yankton'
    ],
    'Tennessee': [
        'Alcoa', 'Athens', 'Chattanooga', 'Clarksville', 'Cleveland', 'Columbia', 'Cookeville', 'Dayton',
        'Elizabethton', 'Franklin', 'Gallatin', 'Gatlinburg', 'Greeneville', 'Jackson', 'Johnson City', 'Jonesborough',
        'Kingsport', 'Knoxville', 'Lebanon', 'Maryville', 'Memphis', 'Morristown', 'Murfreesboro', 'Nashville',
        'Norris', 'Oak Ridge', 'Shelbyville', 'Tullahoma'
    ],
    'Texas': [
        'Abilene', 'Alpine', 'Amarillo', 'Arlington', 'Austin', 'Baytown', 'Beaumont', 'Big Spring', 'Borger',
        'Brownsville', 'Bryan', 'Canyon', 'Cleburne', 'College Station', 'Corpus Christi', 'Crystal City', 'Dallas',
        'Del Rio', 'Denison', 'Denton', 'Eagle Pass', 'Edinburg', 'El Paso', 'Fort Worth', 'Freeport', 'Galveston',
        'Garland', 'Goliad', 'Greenville', 'Harlingen', 'Houston', 'Huntsville', 'Irving', 'Johnson City', 'Kilgore',
        'Killeen', 'Kingsville', 'Laredo', 'Longview', 'Lubbock', 'Lufkin', 'Marshall', 'McAllen', 'McKinney',
        'Mesquite', 'Midland', 'Mission', 'Nacogdoches', 'New Braunfels', 'Odessa', 'Orange', 'Pampa', 'Paris',
        'Pasadena', 'Pecos', 'Pharr', 'Plainview', 'Plano', 'Port Arthur', 'Port Lavaca', 'Richardson', 'San Angelo',
        'San Antonio', 'San Felipe', 'San Marcos', 'Sherman', 'Sweetwater', 'Temple', 'Texarkana', 'Texas City',
        'Tyler', 'Uvalde', 'Victoria', 'Waco', 'Weatherford', 'Wichita Falls', 'Ysleta'
    ],
    'Utah': [
        'Alta', 'American Fork', 'Bountiful', 'Brigham City', 'Cedar City', 'Clearfield', 'Delta', 'Fillmore',
        'Green River', 'Heber City', 'Kanab', 'Layton', 'Lehi', 'Logan', 'Manti', 'Moab', 'Monticello', 'Murray',
        'Nephi', 'Ogden', 'Orderville', 'Orem', 'Panguitch', 'Park City', 'Payson', 'Price', 'Provo', 'Saint George',
        'Salt Lake City', 'Spanish Fork', 'Springville', 'Tooele', 'Vernal'
    ],
    'Vermont': [
        'Barre', 'Bellows Falls', 'Bennington', 'Brattleboro', 'Burlington', 'Essex', 'Manchester', 'Middlebury',
        'Montpelier', 'Newport', 'Plymouth', 'Rutland', 'Saint Albans', 'Saint Johnsbury', 'Sharon', 'Winooski'
    ],
    'Virginia': [
        'Abingdon', 'Alexandria', 'Bristol', 'Charlottesville', 'Chesapeake', 'Danville', 'Fairfax', 'Falls Church',
        'Fredericksburg', 'Hampton', 'Hanover', 'Hopewell', 'Lexington', 'Lynchburg', 'Manassas', 'Martinsville',
        'New Market', 'Newport News', 'Norfolk', 'Petersburg', 'Portsmouth', 'Reston', 'Richmond', 'Roanoke',
        'Staunton', 'Suffolk', 'Virginia Beach', 'Waynesboro', 'Williamsburg', 'Winchester'
    ],
    'Washington': [
        'Aberdeen', 'Anacortes', 'Auburn', 'Bellevue', 'Bellingham', 'Bremerton', 'Centralia', 'Coulee Dam',
        'Coupeville', 'Ellensburg', 'Ephrata', 'Everett', 'Hoquiam', 'Kelso', 'Kennewick', 'Longview', 'Moses Lake',
        'Oak Harbor', 'Olympia', 'Pasco', 'Point Roberts', 'Port Angeles', 'Pullman', 'Puyallup', 'Redmond', 'Renton',
        'Richland', 'Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Walla Walla', 'Wenatchee', 'Yakima'
    ],
    'West Virginia': [
        'Bath', 'Beckley', 'Bluefield', 'Buckhannon', 'Charles Town', 'Charleston', 'Clarksburg', 'Elkins', 'Fairmont',
        'Grafton', 'Harpers Ferry', 'Hillsboro', 'Hinton', 'Huntington', 'Keyser', 'Lewisburg', 'Logan', 'Martinsburg',
        'Morgantown', 'Moundsville', 'New Martinsville', 'Parkersburg', 'Philippi', 'Point Pleasant', 'Princeton',
        'Romney', 'Shepherdstown', 'South Charleston', 'Summersville', 'Weirton', 'Welch', 'Wellsburg', 'Weston',
        'Wheeling', 'White Sulphur Springs', 'Williamson'
    ],
    'Wisconsin': [
        'Appleton', 'Ashland', 'Baraboo', 'Belmont', 'Beloit', 'Eau Claire', 'Fond du Lac', 'Green Bay', 'Hayward',
        'Janesville', 'Kenosha', 'La Crosse', 'Lake Geneva', 'Madison', 'Manitowoc', 'Marinette', 'Menasha',
        'Milwaukee', 'Neenah', 'New Glarus', 'Oconto', 'Oshkosh', 'Peshtigo', 'Portage', 'Prairie du Chien',
        'Racine', 'Rhinelander', 'Ripon', 'Sheboygan', 'Spring Green', 'Stevens Point', 'Sturgeon Bay', 'Superior',
        'Waukesha', 'Wausau', 'Wauwatosa', 'West Allis', 'West Bend', 'Wisconsin Dells'
    ],
    'Wyoming': [
        'Buffalo', 'Casper', 'Cheyenne', 'Cody', 'Douglas', 'Evanston', 'Gillette', 'Green River', 'Jackson',
        'Lander', 'Laramie', 'Newcastle', 'Powell', 'Rawlins', 'Riverton', 'Rock Springs', 'Sheridan', 'Ten Sleep',
        'Thermopolis', 'Torrington', 'Worland'
    ]
}

def add_more_cities():
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
    new_count, total_count = add_more_cities()
    print(f"Added {new_count} new cities. Total cities: {total_count}")
