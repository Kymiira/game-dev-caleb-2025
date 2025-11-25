# Game Dev Portfolio - Replit Project

## Overview
This is a static portfolio website showcasing game development assignments and projects. It's an educational repository containing HTML, CSS, and JavaScript assignments organized by terms.

**Purpose**: Display and organize web development and game programming assignments  
**Type**: Static HTML/CSS/JavaScript website  
**Current State**: Fully functional and ready to use

## Project Structure
```
/
├── public/              # All static website files
│   ├── index.html       # Main landing page with assignment index
│   ├── term 1/          # Term 1 assignments (T1a01-T1a16)
│   ├── term 2/          # Term 2 assignments (T2a17-T2a22)
│   ├── passion/         # Bonus X assignments
│   └── utils/           # CSS modules and markdown documentation
├── server.py            # Python HTTP server for development
├── .gitignore          # Git ignore file
└── README.md           # Project documentation
```

## Technology Stack
- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **Development Server**: Python 3.11 HTTP server
- **Deployment**: Static site hosting (public directory)

## Development

### Running Locally
The development server is configured to run automatically:
- **URL**: The webview will display the site
- **Port**: 5000 (configured for Replit webview)
- **Server**: Python SimpleHTTPServer serving the `public/` directory

The workflow "Start Web Server" is pre-configured and will start automatically.

### File Organization
- All HTML assignments are in their respective term folders
- Shared CSS is in `public/utils/css-modules/`
- Markdown documentation is in `public/utils/markdownfiles/`
- The main index provides navigation to all assignments

## Deployment
The project is configured for static deployment:
- **Type**: Static site
- **Public Directory**: `public/`
- All files in the public directory will be served as-is

To publish:
1. Click the "Publish" button in Replit
2. Your site will be deployed with all static assets
3. The deployment serves the index.html as the entry point

## Recent Changes (November 25, 2025)
- Imported from GitHub repository
- Set up Python HTTP server for development (server.py)
- Configured workflow to serve on port 5000 with webview
- Added .gitignore for Python and development files
- Configured static deployment targeting the public/ directory
- Added cache control headers to development server for proper refresh behavior

## Notes
- This is a pure static site with no build process
- No package managers or dependencies required
- All assignments are self-contained HTML files
- The site uses relative paths for all internal links
