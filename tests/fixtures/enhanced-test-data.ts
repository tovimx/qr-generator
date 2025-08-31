/**
 * Enhanced Test Data Management and Fixtures
 * Centralized test data with cleanup capabilities
 */

import { TestDataGenerator } from '../helpers/test-utilities';

/**
 * Test user profiles for different scenarios
 */
export const TEST_USERS = {
  // Valid user for login tests
  VALID_USER: {
    email: 'valid.user@example.com',
    password: 'ValidPassword123!',
    name: 'Valid Test User'
  },
  
  // User with weak password for validation tests
  WEAK_PASSWORD_USER: {
    email: 'weak@example.com',
    password: '123',
    name: 'Weak Password User'
  },
  
  // User with invalid email for validation tests
  INVALID_EMAIL_USER: {
    email: 'invalid-email',
    password: 'ValidPassword123!',
    name: 'Invalid Email User'
  },
  
  // Admin user for privileged operations
  ADMIN_USER: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    name: 'Admin User'
  }
};

/**
 * QR Code test data templates
 */
export const QR_CODE_TEMPLATES = {
  PERSONAL_CARD: {
    title: 'Personal Business Card',
    links: [
      { title: 'Portfolio', url: 'https://myportfolio.com' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/testuser' },
      { title: 'Email', url: 'mailto:test@example.com' },
      { title: 'Phone', url: 'tel:+1234567890' }
    ]
  },
  
  RESTAURANT_MENU: {
    title: 'Restaurant Menu QR',
    links: [
      { title: 'View Menu', url: 'https://restaurant.com/menu' },
      { title: 'Order Online', url: 'https://restaurant.com/order' },
      { title: 'Make Reservation', url: 'https://restaurant.com/reserve' },
      { title: 'Contact Us', url: 'tel:+1-555-FOOD' },
      { title: 'Leave Review', url: 'https://google.com/maps/restaurant' }
    ]
  },
  
  EVENT_PROMOTION: {
    title: 'Tech Conference 2024',
    links: [
      { title: 'Register', url: 'https://eventbrite.com/tech-conf' },
      { title: 'Schedule', url: 'https://conference.com/schedule' },
      { title: 'Speakers', url: 'https://conference.com/speakers' },
      { title: 'Venue', url: 'https://venue.com/location' }
    ]
  },
  
  MAXIMUM_LINKS: {
    title: 'Maximum Links Test QR',
    links: Array.from({ length: 10 }, (_, i) => ({
      title: `Link ${i + 1}`,
      url: `https://example-${i + 1}.com`
    }))
  }
};

/**
 * Form validation test cases
 */
export const FORM_VALIDATION_CASES = {
  INVALID_EMAILS: [
    'plaintext',
    '@example.com',
    'user@',
    'user..name@example.com',
    'user name@example.com',
    'user@example',
    ''
  ],
  
  WEAK_PASSWORDS: [
    '',
    '123',
    'pass',
    '12345',
    'password'
  ],
  
  INVALID_URLS: [
    'not-a-url',
    'ftp://invalid.com',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'http://',
    'https://',
    ''
  ],
  
  VALID_URLS: [
    'https://example.com',
    'http://example.com',
    'https://www.example.com/path?param=value',
    'mailto:test@example.com',
    'tel:+1234567890',
    'https://sub.domain.example.com/very/long/path/with/params?a=1&b=2'
  ]
};

/**
 * Test data cleanup tracking
 */
class TestDataCleaner {
  private createdEmails: Set<string> = new Set();
  private createdQRCodes: Set<string> = new Set();
  
  trackUser(email: string) {
    this.createdEmails.add(email);
  }
  
  trackQRCode(id: string) {
    this.createdQRCodes.add(id);
  }
  
  async cleanup() {
    // In a real implementation, this would clean up test data from the database
    console.log('Cleaning up test data:', {
      users: Array.from(this.createdEmails),
      qrCodes: Array.from(this.createdQRCodes)
    });
    
    // Reset tracking
    this.createdEmails.clear();
    this.createdQRCodes.clear();
  }
  
  getTrackedData() {
    return {
      users: Array.from(this.createdEmails),
      qrCodes: Array.from(this.createdQRCodes)
    };
  }
}

export const testDataCleaner = new TestDataCleaner();

/**
 * Factory functions for generating test data
 */
export class TestDataFactory {
  static createUniqueUser(template = TEST_USERS.VALID_USER) {
    const user = {
      ...template,
      email: TestDataGenerator.generateUniqueEmail('factory')
    };
    
    testDataCleaner.trackUser(user.email);
    return user;
  }
  
  static createUniqueQRCode(template = QR_CODE_TEMPLATES.PERSONAL_CARD) {
    const timestamp = Date.now();
    const qrCode = {
      ...template,
      title: `${template.title} ${timestamp}`,
      links: template.links.map((link, index) => ({
        ...link,
        url: link.url.replace('example.com', `test-${timestamp}-${index}.com`)
      }))
    };
    
    testDataCleaner.trackQRCode(qrCode.title);
    return qrCode;
  }
  
  static createTestUser(overrides: Partial<typeof TEST_USERS.VALID_USER> = {}) {
    const user = {
      ...TEST_USERS.VALID_USER,
      email: TestDataGenerator.generateUniqueEmail('test'),
      ...overrides
    };
    
    testDataCleaner.trackUser(user.email);
    return user;
  }
  
  static createBusinessQRCode(businessName: string) {
    const qrCode = {
      title: `${businessName} QR Code`,
      links: [
        { title: 'Website', url: `https://${businessName.toLowerCase().replace(/\s+/g, '')}.com` },
        { title: 'Contact', url: `mailto:info@${businessName.toLowerCase().replace(/\s+/g, '')}.com` },
        { title: 'Phone', url: 'tel:+1-555-BUSINESS' },
        { title: 'Location', url: 'https://maps.google.com/business' }
      ]
    };
    
    testDataCleaner.trackQRCode(qrCode.title);
    return qrCode;
  }
}

/**
 * Export cleanup function for test teardown
 */
export const cleanupTestData = async () => {
  await testDataCleaner.cleanup();
};