# OctoCAT Supply Frontend

A modern React 19 frontend for the OctoCAT Supply Chain Management demo application.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Context** for state management

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API configuration and utilities
│   │   └── config.ts     # API base URL configuration
│   ├── assets/           # Static assets (images, icons)
│   ├── components/       # React components
│   │   ├── admin/        # Admin-only components
│   │   │   └── AdminProducts.tsx
│   │   ├── entity/       # Entity-specific components
│   │   │   └── product/
│   │   │       ├── ProductForm.tsx
│   │   │       └── Products.tsx
│   │   ├── About.tsx
│   │   ├── Cart.tsx
│   │   ├── Footer.tsx
│   │   ├── Login.tsx
│   │   ├── Navigation.tsx
│   │   └── Welcome.tsx
│   ├── context/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── themeContextUtils.tsx
│   │   └── useTheme.tsx
│   ├── App.tsx           # Main app component with routing
│   ├── index.css         # Global styles
│   ├── main.tsx          # App entry point
│   └── vite-env.d.ts     # Vite type declarations
├── public/               # Static public files
├── index.html            # HTML template
└── package.json          # Dependencies and scripts
```

## State Management

The app uses React Context for state management:

### CartContext

Manages shopping cart state with the following capabilities:

| Function | Description |
|----------|-------------|
| `addToCart(item)` | Add an item to the cart (or increase quantity if exists) |
| `removeFromCart(productId)` | Remove an item from the cart |
| `updateQuantity(productId, qty)` | Update item quantity |
| `clearCart()` | Remove all items from cart |
| `getCartTotal()` | Calculate total price of all items |
| `getCartItemCount()` | Get total number of items in cart |

**Usage:**
```tsx
import { useCart } from '../context/CartContext';

function MyComponent() {
  const { cartItems, addToCart, getCartTotal } = useCart();
  // ...
}
```

### AuthContext

Manages user authentication state:

| Property/Function | Description |
|-------------------|-------------|
| `isLoggedIn` | Boolean indicating login status |
| `isAdmin` | Boolean - true if email ends with @github.com |
| `login(email, password)` | Authenticate user |
| `logout()` | Log out current user |

**Usage:**
```tsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isLoggedIn, isAdmin, login, logout } = useAuth();
  // ...
}
```

### ThemeContext

Manages dark/light mode with localStorage persistence:

| Property/Function | Description |
|-------------------|-------------|
| `darkMode` | Boolean indicating current theme |
| `toggleTheme()` | Switch between dark and light mode |

**Usage:**
```tsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { darkMode, toggleTheme } = useTheme();
  // ...
}
```

## Components

### Core Components

| Component | Route | Description |
|-----------|-------|-------------|
| `Welcome` | `/` | Landing page with hero section |
| `Products` | `/products` | Product catalog grid |
| `Cart` | `/cart` | Shopping cart with order summary |
| `Login` | `/login` | User authentication form |
| `About` | `/about` | About page |
| `Navigation` | - | Header with nav links, cart icon, theme toggle |
| `Footer` | - | Site footer |

### Admin Components

| Component | Route | Description |
|-----------|-------|-------------|
| `AdminProducts` | `/admin/products` | Product management (requires admin) |

### Features

#### Shopping Cart
- Add/remove products with quantity controls
- Coupon code support (`SAVE5` for 5%, `SAVE10` for 10% off)
- Real-time price calculations
- Order summary with subtotal, discount, shipping, and grand total

#### Authentication
- Email/password login form
- Admin detection for @github.com emails
- Protected admin routes

#### Theme
- Dark/light mode toggle
- Preference saved to localStorage
- Smooth transitions between themes

## Development

### Prerequisites
- Node.js 18+
- npm

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

The app runs on `http://localhost:5137` by default.

### Build for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Configuration

### API Configuration

The API base URL is configured in `src/api/config.ts`. Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_HOST` | API hostname | `localhost` |
| `VITE_API_PORT` | API port | `3000` |

### Tailwind Configuration

Custom theme colors and settings are in `tailwind.config.js`.

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t octocat-frontend .

# Run container
docker run -p 80:80 octocat-frontend
```

The container uses nginx to serve the built static files.

## ESLint Configuration

For production applications, enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
