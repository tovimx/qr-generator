// Test user data
export const TEST_USERS = {
  default: {
    email: 'test@example.com',
    password: 'Test123!@#',
    name: 'Test User'
  },
  admin: {
    email: 'admin@example.com',
    password: 'Admin123!@#',
    name: 'Admin User'
  },
  premium: {
    email: 'premium@example.com',
    password: 'Premium123!@#',
    name: 'Premium User'
  }
};

// Test QR code data
export const TEST_QR_CODES = {
  basic: {
    title: 'Test QR Code',
    links: [
      {
        title: 'My Website',
        url: 'https://example.com',
        position: 0
      },
      {
        title: 'Twitter',
        url: 'https://twitter.com/testuser',
        position: 1
      },
      {
        title: 'LinkedIn',
        url: 'https://linkedin.com/in/testuser',
        position: 2
      }
    ]
  },
  maxLinks: {
    title: 'QR Code with Max Links',
    links: [
      {
        title: 'Link 1',
        url: 'https://example1.com',
        position: 0
      },
      {
        title: 'Link 2',
        url: 'https://example2.com',
        position: 1
      },
      {
        title: 'Link 3',
        url: 'https://example3.com',
        position: 2
      },
      {
        title: 'Link 4',
        url: 'https://example4.com',
        position: 3
      },
      {
        title: 'Link 5',
        url: 'https://example5.com',
        position: 4
      }
    ]
  },
  minimal: {
    title: 'Minimal QR Code',
    links: [
      {
        title: 'My Link',
        url: 'https://mysite.com',
        position: 0
      }
    ]
  }
};

// Test URLs for validation
export const TEST_URLS = {
  valid: [
    'https://example.com',
    'http://example.com',
    'https://example.com/path',
    'https://example.com/path?query=value',
    'https://example.com:8080',
    'https://sub.example.com',
    'https://example.co.uk'
  ],
  invalid: [
    'not-a-url',
    'ftp://example.com',
    'javascript:alert(1)',
    'data:text/plain,hello',
    'https://',
    'http://.',
    'example.com' // Missing protocol
  ]
};

// Test scan data
export const TEST_SCAN_DATA = {
  desktop: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    referer: 'https://google.com',
    ip: '192.168.1.1'
  },
  mobile: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    referer: 'https://facebook.com',
    ip: '10.0.0.1'
  },
  tablet: {
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    referer: 'https://twitter.com',
    ip: '172.16.0.1'
  }
};

// Error messages to test
export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: 'Invalid login credentials',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    weakPassword: 'Password must be at least 6 characters',
    userExists: 'User already registered'
  },
  qr: {
    createFailed: 'Failed to create QR code',
    notFound: 'QR code not found',
    inactive: 'This QR code is no longer active',
    maxLinksReached: 'Maximum number of links reached (5)'
  },
  validation: {
    invalidUrl: 'Please enter a valid URL',
    titleRequired: 'Title is required',
    titleTooLong: 'Title must be less than 100 characters',
    urlRequired: 'URL is required'
  }
};

// Timing constants for tests
export const TEST_TIMEOUTS = {
  navigation: 10000,    // 10 seconds for page navigation
  apiCall: 5000,        // 5 seconds for API calls
  animation: 500,       // 500ms for UI animations
  debounce: 300,        // 300ms for debounced inputs
};

// Test selectors for common elements
export const TEST_SELECTORS = {
  auth: {
    emailInput: '[name="email"]',
    passwordInput: '[name="password"]',
    submitButton: 'button[type="submit"]',
    errorMessage: '[role="alert"]',
    loadingSpinner: '[data-testid="loading-spinner"]'
  },
  qr: {
    qrCodeDisplay: '[data-testid="qr-code-display"]',
    shortLink: '[data-testid="short-link"]',
    linkEditor: '[data-testid="link-editor"]',
    addLinkButton: '[data-testid="add-link-button"]',
    linkItem: '[data-testid="link-item"]',
    deleteButton: '[data-testid="delete-link"]'
  },
  navigation: {
    dashboardLink: 'a[href="/dashboard"]',
    settingsLink: 'a[href="/settings"]',
    logoutButton: '[data-testid="logout-button"]',
    userMenu: '[data-testid="user-menu"]'
  }
};