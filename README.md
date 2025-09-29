# The Daily Holler

A modern, full-stack marketplace built with React and Node.js, supporting 10,000+ US cities.

## Features

- **10,000+ US Cities**: Comprehensive database of US cities with population data
- **Full Category System**: All marketplace categories including Community, Housing, For Sale, Services, Jobs, and Gigs
- **Advanced Search**: Search across posts by title and description
- **City Selection**: Easy city browsing and selection
- **Post Management**: Create, view, and manage classified ads
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies for all parts of the application:
```bash
npm run install-all
```

2. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

### Manual Installation

If the above doesn't work, install dependencies manually:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Start the servers
cd ..
npm run dev
```

## Usage

1. **Select a City**: Choose from 10,000+ US cities
2. **Browse Categories**: Explore Community, Housing, For Sale, Services, Jobs, and Gigs
3. **Search**: Use the search bar to find specific items or services
4. **Create Posts**: Click "Post an Ad" to create your own classified ad
5. **View Details**: Click on any post to see full details

## API Endpoints

- `GET /api/cities` - Get all cities (with search, pagination)
- `GET /api/cities/:id` - Get specific city
- `GET /api/categories` - Get all categories and subcategories
- `GET /api/posts` - Get posts (with filtering)
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts` - Create new post
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

## Project Structure

```
the-daily-vibe/
├── server/                 # Node.js/Express backend
│   ├── index.js           # Main server file
│   ├── data/              # JSON data storage
│   └── package.json
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js        # Main app component
│   │   └── App.css       # Styles
│   └── package.json
└── package.json          # Root package.json
```

## Data Storage

The application uses JSON files for data storage (easily upgradeable to a real database):
- `server/data/cities.json` - 10,000+ US cities
- `server/data/posts.json` - User posts
- `server/data/users.json` - User accounts

## Categories

The application includes all major marketplace categories:

- **Community**: Activities, events, local news, etc.
- **Personals**: Dating, relationships, etc.
- **Housing**: Apartments, rooms, real estate, etc.
- **For Sale**: Cars, electronics, furniture, etc.
- **Services**: Professional services, repairs, etc.
- **Jobs**: Employment opportunities
- **Gigs**: Short-term work opportunities

## Development

### Backend Development
```bash
cd server
npm run dev
```

### Frontend Development
```bash
cd client
npm start
```

### Building for Production
```bash
npm run build
```

## Features in Detail

### City Management
- 10,000+ US cities with real population data
- Search and filter cities by name or state
- Regional organization (Northeast, Southeast, Midwest, Southwest, West)

### Post Management
- Create posts with title, description, price, and contact info
- Category and subcategory selection
- Image support (ready for implementation)
- Contact information management

### Search & Filtering
- Full-text search across post titles and descriptions
- Category-based filtering
- City-specific browsing
- Real-time search results

### User Experience
- Responsive design for all devices
- Smooth animations and transitions
- Intuitive navigation
- Modern, clean interface

## Customization

### Adding New Cities
Cities are generated automatically with realistic data. To add specific cities, modify the `generateUSCities()` function in `server/index.js`.

### Adding Categories
Categories are defined in the `CATEGORIES` constant in `server/index.js`. Add new categories or subcategories as needed.

### Styling
The application uses custom CSS with modern design principles. Modify `client/src/App.css` for styling changes.

## Production Deployment

For production deployment:

1. Build the React app:
```bash
npm run build
```

2. Set environment variables:
```bash
export NODE_ENV=production
export PORT=5000
```

3. Start the server:
```bash
npm run server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

If you encounter any issues:
1. Check that all dependencies are installed
2. Ensure ports 3000 and 5000 are available
3. Check the browser console for errors
4. Verify the backend server is running

Enjoy your Daily Holler marketplace! 🎉
