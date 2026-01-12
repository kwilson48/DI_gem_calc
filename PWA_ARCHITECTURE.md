# Progressive Web App (PWA) Architecture
## Offline-First Mobile Gem Calculator with Backend/Frontend Separation

## Overview

This document outlines the architecture for transforming the Diablo Immortal Gem Calculator into a Progressive Web App (PWA) that runs entirely on mobile devices while maintaining clean separation between frontend UI and backend logic.

## Architecture Philosophy

**Key Principle**: Separation of concerns through architectural boundaries, not network boundaries.

- **Frontend Layer**: React UI components (presentation)
- **Backend Layer**: Web Workers (business logic)
- **Data Layer**: IndexedDB (persistence)
- **Offline Layer**: Service Workers (caching & offline capability)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Browser                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Service Worker (SW)                      │ │
│  │  - Cache management                                   │ │
│  │  - Offline support                                    │ │
│  │  - Background sync (optional cloud sync)             │ │
│  └───────────────────────────────────────────────────────┘ │
│                            │                                │
│  ┌─────────────────────────┼─────────────────────────────┐ │
│  │         Main Thread      │      Worker Thread          │ │
│  │                          │                              │ │
│  │  ┌────────────────┐      │      ┌────────────────┐    │ │
│  │  │  React UI      │◄─────┼─────►│  Web Worker    │    │ │
│  │  │  Components    │ msgs │      │  (Backend)     │    │ │
│  │  │                │      │      │                │    │ │
│  │  │ - Calculator   │      │      │ - Calc Engine  │    │ │
│  │  │ - Build List   │      │      │ - DPS Logic    │    │ │
│  │  │ - Settings     │      │      │ - Validation   │    │ │
│  │  └────────┬───────┘      │      └────────┬───────┘    │ │
│  │           │               │               │             │ │
│  │           ▼               │               ▼             │ │
│  │  ┌────────────────┐      │      ┌────────────────┐    │ │
│  │  │  UI State      │      │      │  Business      │    │ │
│  │  │  (Zustand)     │      │      │  Logic Layer   │    │ │
│  │  └────────────────┘      │      └────────────────┘    │ │
│  └─────────────────────────────────────────────────────┘ │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              IndexedDB (Local Database)               │ │
│  │                                                        │ │
│  │  - builds_store (saved builds)                        │ │
│  │  - settings_store (user preferences)                  │ │
│  │  - cache_store (calculation results)                  │ │
│  │  - history_store (calculation history)                │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Layer Architecture

### 1. Frontend Layer (Main Thread)

**Technology**: React 18 + TypeScript + Tailwind CSS

**Components Structure**:
```
src/
├── components/
│   ├── Calculator/
│   │   ├── GemSelector.tsx         # 22 gem selection toggles
│   │   ├── CharacterStats.tsx      # Base stats inputs
│   │   ├── DPSScaling.tsx          # Scaling multipliers
│   │   ├── HitFrequency.tsx        # Hit rate configuration
│   │   ├── BuildOptions.tsx        # Strife, Fated Trail, etc.
│   │   └── ResultsDisplay.tsx      # DPS results & breakdowns
│   ├── BuildManagement/
│   │   ├── BuildList.tsx           # Saved builds grid
│   │   ├── BuildCard.tsx           # Individual build preview
│   │   ├── BuildDetail.tsx         # Full build view
│   │   └── BuildExport.tsx         # Export to JSON/share
│   ├── Settings/
│   │   ├── ThemeSettings.tsx       # Dark/light mode
│   │   ├── CalculatorPrefs.tsx     # Default values
│   │   └── DataManagement.tsx      # Import/export data
│   └── Shared/
│       ├── Layout.tsx              # App layout wrapper
│       ├── Header.tsx              # Navigation
│       ├── LoadingSpinner.tsx      # Loading states
│       └── ErrorBoundary.tsx       # Error handling
```

**Responsibilities**:
- Render UI based on state
- Handle user input
- Dispatch actions to backend worker
- Display results from backend
- Manage UI state (loading, errors, etc.)

**No Business Logic**: The frontend does NOT perform any calculations.

### 2. Backend Layer (Web Worker)

**Technology**: Web Workers + TypeScript

**Worker Structure**:
```
src/
├── workers/
│   ├── calculator.worker.ts        # Main worker entry point
│   ├── services/
│   │   ├── CalculationEngine.ts    # Core DPS calculations
│   │   ├── GemService.ts           # Gem data & logic
│   │   ├── BuildService.ts         # Build CRUD operations
│   │   ├── ValidationService.ts    # Input validation
│   │   └── OptimalFinderService.ts # Find best 8-gem combos
│   ├── models/
│   │   ├── Gem.ts                  # Gem type definitions
│   │   ├── Build.ts                # Build type definitions
│   │   └── CalculationResult.ts    # Result types
│   └── utils/
│       ├── formulaHelpers.ts       # Math utilities
│       └── gemData.ts              # Gem database
```

**Message Protocol**:
```typescript
// Frontend → Worker
interface WorkerRequest {
  id: string;                      // Request ID for tracking
  type: 'CALCULATE' | 'SAVE_BUILD' | 'LOAD_BUILD' | 'FIND_OPTIMAL';
  payload: any;
}

// Worker → Frontend
interface WorkerResponse {
  id: string;                      // Matches request ID
  type: 'SUCCESS' | 'ERROR' | 'PROGRESS';
  payload: any;
  error?: string;
}
```

**Example Flow**:
```typescript
// Frontend sends calculation request
worker.postMessage({
  id: 'calc-001',
  type: 'CALCULATE',
  payload: {
    selectedGems: [...],
    characterStats: {...},
    buildOptions: {...}
  }
});

// Worker processes in background thread
// Worker sends response back
self.postMessage({
  id: 'calc-001',
  type: 'SUCCESS',
  payload: {
    totalDPS: 12500,
    breakdown: {...}
  }
});
```

**Responsibilities**:
- Perform ALL calculations
- Validate input data
- Manage build operations
- Run optimal finder algorithm
- Communicate with IndexedDB via data layer

### 3. Data Layer (IndexedDB)

**Technology**: IndexedDB with Dexie.js wrapper

**Database Schema**:
```typescript
// db.ts
import Dexie from 'dexie';

export class GemCalcDB extends Dexie {
  builds!: Dexie.Table<Build, string>;
  settings!: Dexie.Table<Setting, string>;
  calculationCache!: Dexie.Table<CachedCalculation, string>;
  history!: Dexie.Table<CalculationHistory, string>;

  constructor() {
    super('GemCalculatorDB');

    this.version(1).stores({
      builds: 'id, name, createdAt, updatedAt',
      settings: 'key',
      calculationCache: 'hash, timestamp',
      history: 'id, timestamp'
    });
  }
}

interface Build {
  id: string;                      // UUID
  name: string;                    // User-given name
  description?: string;            // Optional notes
  selectedGems: string[];          // Array of gem IDs
  characterStats: CharacterStats;  // Base stats
  buildOptions: BuildOptions;      // Strife, etc.
  calculatedDPS: number;           // Cached result
  createdAt: Date;
  updatedAt: Date;
}

interface Setting {
  key: string;                     // Setting identifier
  value: any;                      // Setting value
}

interface CachedCalculation {
  hash: string;                    // Hash of input params
  result: CalculationResult;       // Cached result
  timestamp: Date;                 // For cache expiry
}

interface CalculationHistory {
  id: string;
  build: Partial<Build>;           // Build snapshot
  result: CalculationResult;
  timestamp: Date;
}
```

**Data Access Pattern**:
```typescript
// Worker accesses IndexedDB directly
import { db } from './db';

// Save build
async function saveBuild(build: Build): Promise<void> {
  await db.builds.put(build);
}

// Load build
async function loadBuild(id: string): Promise<Build | undefined> {
  return await db.builds.get(id);
}

// Get all builds
async function getAllBuilds(): Promise<Build[]> {
  return await db.builds.orderBy('updatedAt').reverse().toArray();
}
```

**Responsibilities**:
- Persist user data locally
- Provide fast data access
- Handle data migrations
- Support offline functionality
- Optional: Sync with cloud when online

### 4. Offline Layer (Service Worker)

**Technology**: Workbox (Google's Service Worker library)

**Service Worker Configuration**:
```typescript
// service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Precache app shell (HTML, CSS, JS)
precacheAndRoute(self.__WB_MANIFEST);

// Cache static assets (images, fonts)
registerRoute(
  ({ request }) => request.destination === 'image' ||
                   request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Network-first for API calls (future cloud sync)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);
```

**Responsibilities**:
- Cache app shell for instant loading
- Enable offline functionality
- Background sync (future feature)
- Push notifications (future feature)
- Serve cached content when offline

## Technology Stack

### Core Framework
- **React 18**: UI framework with concurrent features
- **TypeScript**: Type safety throughout
- **Vite**: Fast build tool with PWA plugin

### State Management
- **Zustand**: Lightweight state management for UI
- **React Query**: Async state management (for future cloud sync)

### UI Framework
- **Tailwind CSS**: Utility-first styling
- **Headless UI**: Accessible components
- **Framer Motion**: Smooth animations

### Data & Workers
- **Dexie.js**: IndexedDB wrapper
- **Comlink**: Simplified Web Worker communication
- **Workbox**: Service Worker utilities

### PWA Tools
- **vite-plugin-pwa**: PWA manifest & service worker generation
- **workbox-window**: Service worker lifecycle management

### Build & Development
- **Vite**: Build tool
- **Vitest**: Testing framework
- **Playwright**: E2E testing
- **TypeScript**: Type checking

## Communication Patterns

### 1. Frontend ↔ Web Worker Communication

Using **Comlink** to simplify worker communication:

```typescript
// calculator.worker.ts
import { expose } from 'comlink';

const CalculatorAPI = {
  async calculate(params: CalculationParams): Promise<CalculationResult> {
    // Perform calculation
    return result;
  },

  async saveBuild(build: Build): Promise<void> {
    await db.builds.put(build);
  },

  async loadBuild(id: string): Promise<Build> {
    return await db.builds.get(id);
  },

  async findOptimal(params: OptimalParams): Promise<OptimalResult> {
    // Long-running optimal finder
    // Send progress updates
    return result;
  }
};

expose(CalculatorAPI);
```

```typescript
// Frontend usage
import { wrap } from 'comlink';

const worker = new Worker(
  new URL('./workers/calculator.worker.ts', import.meta.url),
  { type: 'module' }
);

const calculatorAPI = wrap<typeof CalculatorAPI>(worker);

// Use as if it were a regular async function
const result = await calculatorAPI.calculate({
  selectedGems: [...],
  characterStats: {...}
});
```

### 2. React Component State Management

```typescript
// stores/calculatorStore.ts
import create from 'zustand';

interface CalculatorState {
  selectedGems: Set<string>;
  characterStats: CharacterStats;
  buildOptions: BuildOptions;
  calculationResult: CalculationResult | null;
  isCalculating: boolean;
  error: string | null;

  toggleGem: (gemId: string) => void;
  updateCharacterStats: (stats: CharacterStats) => void;
  updateBuildOptions: (options: BuildOptions) => void;
  calculate: () => Promise<void>;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  selectedGems: new Set(),
  characterStats: DEFAULT_STATS,
  buildOptions: DEFAULT_OPTIONS,
  calculationResult: null,
  isCalculating: false,
  error: null,

  toggleGem: (gemId) => set((state) => {
    const newSet = new Set(state.selectedGems);
    if (newSet.has(gemId)) {
      newSet.delete(gemId);
    } else {
      newSet.add(gemId);
    }
    return { selectedGems: newSet };
  }),

  calculate: async () => {
    set({ isCalculating: true, error: null });
    try {
      const result = await calculatorAPI.calculate({
        selectedGems: Array.from(get().selectedGems),
        characterStats: get().characterStats,
        buildOptions: get().buildOptions
      });
      set({ calculationResult: result, isCalculating: false });
    } catch (error) {
      set({ error: error.message, isCalculating: false });
    }
  }
}));
```

### 3. Component Usage

```typescript
// Calculator.tsx
import { useCalculatorStore } from '../stores/calculatorStore';

export function Calculator() {
  const {
    selectedGems,
    characterStats,
    calculationResult,
    isCalculating,
    toggleGem,
    updateCharacterStats,
    calculate
  } = useCalculatorStore();

  return (
    <div>
      <GemSelector
        selectedGems={selectedGems}
        onToggle={toggleGem}
      />

      <CharacterStats
        stats={characterStats}
        onChange={updateCharacterStats}
      />

      <button
        onClick={calculate}
        disabled={isCalculating}
      >
        {isCalculating ? 'Calculating...' : 'Calculate DPS'}
      </button>

      {calculationResult && (
        <ResultsDisplay result={calculationResult} />
      )}
    </div>
  );
}
```

## PWA Features

### 1. Installability

**manifest.json**:
```json
{
  "name": "Diablo Immortal Gem Calculator",
  "short_name": "DI Gem Calc",
  "description": "Offline-capable gem calculator for Diablo Immortal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#ff6b6b",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["games", "utilities"],
  "orientation": "portrait-primary"
}
```

### 2. Offline Support

**App Shell Pattern**:
- HTML, CSS, JS cached immediately
- Works completely offline after first visit
- No network needed for calculations
- All data stored locally

**Update Strategy**:
- Service worker checks for updates on load
- Shows update notification to user
- User can refresh to get new version
- Background sync for non-critical updates

### 3. Performance

**Target Metrics**:
- First Contentful Paint (FCP): < 1s
- Time to Interactive (TTI): < 2s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

**Optimization Strategies**:
- Code splitting by route
- Lazy loading components
- Image optimization (WebP format)
- CSS purging (remove unused Tailwind)
- Bundle size monitoring
- Web Worker for heavy calculations (non-blocking)

### 4. Storage Quota Management

```typescript
// storageManager.ts
export class StorageManager {
  async getQuota(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { usage: 0, quota: 0 };
  }

  async requestPersistent(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      return await navigator.storage.persist();
    }
    return false;
  }

  async isPersisted(): Promise<boolean> {
    if ('storage' in navigator && 'persisted' in navigator.storage) {
      return await navigator.storage.persisted();
    }
    return false;
  }
}
```

## Data Flow Examples

### Example 1: User Selects Gems and Calculates DPS

```
1. User clicks gem toggle in UI
   └─► UI updates immediately (optimistic)
   └─► State updated in Zustand store

2. User clicks "Calculate" button
   └─► UI shows loading spinner
   └─► Frontend sends message to Web Worker

3. Web Worker receives calculation request
   └─► Validates input data
   └─► Checks IndexedDB for cached result
   └─► If not cached, performs calculation
   └─► Saves result to cache
   └─► Sends result back to frontend

4. Frontend receives result
   └─► Updates UI with results
   └─► Hides loading spinner
   └─► Adds to calculation history (IndexedDB)
```

### Example 2: User Saves a Build

```
1. User names build and clicks "Save"
   └─► Frontend validates input
   └─► Sends save request to Web Worker

2. Web Worker receives save request
   └─► Generates unique ID
   └─► Creates Build object
   └─► Saves to IndexedDB builds store
   └─► Returns success to frontend

3. Frontend receives confirmation
   └─► Shows success message
   └─► Updates build list
   └─► (Optional) Queues background sync for cloud backup
```

### Example 3: App Works Offline

```
1. User opens app (no internet)
   └─► Service Worker intercepts request
   └─► Serves cached app shell (HTML, CSS, JS)
   └─► App loads instantly

2. User performs calculations
   └─► All data local (Web Worker + IndexedDB)
   └─► Full functionality available
   └─► No network required

3. User comes back online
   └─► Service Worker checks for app updates
   └─► (Optional) Background sync to cloud
   └─► Seamless experience
```

## Development Workflow

### Project Structure

```
di-gem-calc-pwa/
├── public/
│   ├── icons/                    # PWA icons
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── icon-maskable-512.png
│   ├── manifest.json             # PWA manifest
│   └── robots.txt
├── src/
│   ├── components/               # React components
│   │   ├── Calculator/
│   │   ├── BuildManagement/
│   │   ├── Settings/
│   │   └── Shared/
│   ├── workers/                  # Web Workers (backend)
│   │   ├── calculator.worker.ts
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── stores/                   # State management
│   │   ├── calculatorStore.ts
│   │   ├── buildStore.ts
│   │   └── settingsStore.ts
│   ├── db/                       # IndexedDB layer
│   │   ├── db.ts
│   │   ├── migrations/
│   │   └── models/
│   ├── hooks/                    # Custom React hooks
│   │   ├── useCalculator.ts
│   │   ├── useBuilds.ts
│   │   └── useOfflineStatus.ts
│   ├── types/                    # TypeScript types
│   │   ├── gems.ts
│   │   ├── builds.ts
│   │   └── calculations.ts
│   ├── utils/                    # Shared utilities
│   │   ├── constants.ts
│   │   └── formatters.ts
│   ├── styles/                   # Global styles
│   │   └── globals.css
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── vite-env.d.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### Build Configuration

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Diablo Immortal Gem Calculator',
        short_name: 'DI Gem Calc',
        description: 'Offline gem calculator for Diablo Immortal',
        theme_color: '#ff6b6b',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  worker: {
    format: 'es'
  }
});
```

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// workers/services/CalculationEngine.test.ts
import { describe, it, expect } from 'vitest';
import { CalculationEngine } from './CalculationEngine';

describe('CalculationEngine', () => {
  it('should calculate DPS correctly', () => {
    const result = CalculationEngine.calculate({
      selectedGems: ['seeping_bile', 'bottled_hope'],
      characterStats: { baseDamage: 1000, ... },
      buildOptions: { useStrife: true }
    });

    expect(result.totalDPS).toBeGreaterThan(0);
  });
});
```

### Integration Tests
```typescript
// Integration test for worker communication
import { wrap } from 'comlink';

describe('Worker Integration', () => {
  it('should calculate DPS via worker', async () => {
    const worker = new Worker(/* ... */);
    const api = wrap(worker);

    const result = await api.calculate({
      selectedGems: ['seeping_bile'],
      characterStats: DEFAULT_STATS,
      buildOptions: DEFAULT_OPTIONS
    });

    expect(result).toBeDefined();
    expect(result.totalDPS).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Playwright)
```typescript
// e2e/calculator.spec.ts
import { test, expect } from '@playwright/test';

test('user can calculate DPS', async ({ page }) => {
  await page.goto('/');

  // Select gems
  await page.click('[data-testid="gem-seeping-bile"]');
  await page.click('[data-testid="gem-bottled-hope"]');

  // Enter character stats
  await page.fill('[data-testid="base-damage"]', '1000');

  // Calculate
  await page.click('[data-testid="calculate-button"]');

  // Verify results
  await expect(page.locator('[data-testid="total-dps"]')).toBeVisible();
});
```

## Deployment

### GitHub Pages (Recommended for PWA)
```yaml
# .github/workflows/deploy.yml
name: Deploy PWA

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Vercel / Netlify
- One-click deployment
- Automatic HTTPS
- Global CDN
- Zero configuration

## Future Enhancements

### Optional Cloud Sync
```typescript
// Future: Sync builds to cloud when online
interface SyncService {
  syncBuilds(): Promise<void>;
  enableAutoSync(): void;
  disableAutoSync(): void;
}

// Background sync via Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-builds') {
    event.waitUntil(syncBuildsToCloud());
  }
});
```

### Cross-Device Sync
- Optional user accounts (future)
- Sync builds across devices
- Cloud backup of builds
- Share builds with friends

### Advanced Features
- Build comparison (side-by-side)
- Optimal 8-gem finder (Web Worker intensive)
- Build templates and favorites
- Import/export builds (JSON)
- Share builds via URL

## Performance Optimizations

### 1. Calculation Caching
```typescript
// Cache calculation results by input hash
const cacheKey = hashCalculationParams(params);
const cached = await db.calculationCache.get(cacheKey);

if (cached && !isExpired(cached.timestamp)) {
  return cached.result;
}

// Perform calculation and cache
const result = performCalculation(params);
await db.calculationCache.put({
  hash: cacheKey,
  result,
  timestamp: new Date()
});
```

### 2. Web Worker Pool (Future)
```typescript
// For optimal finder: Multiple workers in parallel
class WorkerPool {
  private workers: Worker[] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.workers.push(new Worker(/* ... */));
    }
  }

  async execute(task: Task): Promise<Result> {
    const worker = this.getAvailableWorker();
    return await wrap(worker).execute(task);
  }
}
```

### 3. Virtual Scrolling
```typescript
// For large build lists
import { useVirtualizer } from '@tanstack/react-virtual';

function BuildList({ builds }: { builds: Build[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: builds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100
  });

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      {virtualizer.getVirtualItems().map((item) => (
        <BuildCard key={item.key} build={builds[item.index]} />
      ))}
    </div>
  );
}
```

## Security Considerations

### Local-Only Security
- No authentication needed (local-only data)
- IndexedDB is origin-isolated
- Service Worker is HTTPS-only (or localhost)
- No API keys or secrets in code
- Content Security Policy headers

### Future Cloud Sync Security
- JWT authentication
- Encrypted sync
- Rate limiting
- CORS configuration

## Conclusion

This PWA architecture provides:

✅ **True Backend/Frontend Separation**: Web Workers handle all business logic
✅ **Offline-First**: Works without internet after first load
✅ **Mobile-Optimized**: Installable, fast, responsive
✅ **Scalable**: Can add cloud sync later
✅ **Maintainable**: Clean separation of concerns
✅ **Performant**: Web Workers keep UI responsive
✅ **Type-Safe**: TypeScript throughout
✅ **Testable**: Unit, integration, and E2E tests

The architecture maintains professional separation while running entirely on the mobile device.
