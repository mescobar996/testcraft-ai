/* eslint-disable */
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
      getAll: jest.fn(),
      entries: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      forEach: jest.fn(),
      toString: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Mock next/link
const React = require('react')
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return React.createElement('a', { href, ...props }, children)
  }
})

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      exchangeCodeForSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  }),
  createRouteHandlerClient: jest.fn(),
  createServerComponentClient: jest.fn(),
  createMiddlewareClient: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};