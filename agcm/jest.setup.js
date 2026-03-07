// jest.setup.js
require('@testing-library/jest-dom');

// Polyfill for TextEncoder/TextDecoder (required by undici)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for Request/Response (Next.js API routes)
// Only use undici if Request is not already defined
if (typeof global.Request === 'undefined') {
  try {
    const { Request, Response, Headers } = require('undici');
    global.Request = Request;
    global.Response = Response;
    global.Headers = Headers;
  } catch (e) {
    // undici not available, use minimal mocks
    global.Request = class Request {
      constructor(url, options = {}) {
        this.url = url;
        this.method = options.method || 'GET';
        this.headers = new Map();
      }
    };
    global.Response = class Response {
      constructor(body, options = {}) {
        this.body = body;
        this.status = options.status || 200;
      }
      json() { return Promise.resolve({}); }
    };
    global.Headers = class Headers {
      constructor() { this.map = new Map(); }
      get(key) { return this.map.get(key); }
      set(key, value) { this.map.set(key, value); }
    };
  }
}

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const React = require('react');
    return React.createElement('img', props);
  },
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Prisma Client (will be overridden by individual test files if needed)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    member: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    content: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    mandat: { findFirst: jest.fn(), findUnique: jest.fn(), findMany: jest.fn() },
    affectationPoste: { findFirst: jest.fn(), findMany: jest.fn() },
    poste: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
    auditLog: { create: jest.fn(), findMany: jest.fn() },
    notification: { create: jest.fn(), createMany: jest.fn(), findMany: jest.fn() },
    demandeAdhesion: { create: jest.fn() },
    demandePartenariat: { create: jest.fn() },
    donationIntent: { create: jest.fn() },
    messageContact: { create: jest.fn() },
  },
}));

// Mock file-type (seulement si le module est utilisé)
try {
  require.resolve('file-type');
  jest.mock('file-type', () => ({
    fileTypeFromBuffer: jest.fn().mockResolvedValue({ mime: 'application/pdf', ext: 'pdf' }),
  }));
} catch (e) {
  // file-type n'est pas installé, on ignore le mock
}

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

