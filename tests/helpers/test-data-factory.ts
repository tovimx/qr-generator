/**
 * Enhanced Test Data Factory
 * Creates realistic test data for comprehensive E2E testing
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TestUser {
  email: string;
  password: string;
  name?: string;
  id?: string;
}

export interface TestQRCode {
  title: string;
  shortCode: string;
  links: TestLink[];
  design?: TestDesign;
}

export interface TestLink {
  title: string;
  url: string;
  description?: string;
  icon?: string;
}

export interface TestDesign {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontFamily: string;
}

export interface TestProject {
  name: string;
  description: string;
  qrCodes: TestQRCode[];
}

/**
 * Test Data Factory for generating consistent test data
 */
export class TestDataFactory {
  private static counter = 0;
  
  /**
   * Generate unique test identifier
   */
  static getUniqueId(): string {
    return `test-${Date.now()}-${++this.counter}`;
  }

  /**
   * Generate test user data
   */
  static createTestUser(type: 'basic' | 'premium' | 'business' = 'basic'): TestUser {
    const id = this.getUniqueId();
    
    const users = {
      basic: {
        email: `basic-user-${id}@test.example.com`,
        password: 'TestPass123!',
        name: `Basic User ${id}`
      },
      premium: {
        email: `premium-user-${id}@test.example.com`, 
        password: 'PremiumPass123!',
        name: `Premium User ${id}`
      },
      business: {
        email: `business-user-${id}@test.example.com`,
        password: 'BusinessPass123!',
        name: `Business User ${id}`
      }
    };

    return users[type];
  }

  /**
   * Generate test QR code data
   */
  static createTestQRCode(type: 'personal' | 'business' | 'event' | 'restaurant' = 'personal'): TestQRCode {
    const id = this.getUniqueId();
    
    const qrCodes = {
      personal: {
        title: `Personal QR ${id}`,
        shortCode: `p${id.slice(-6)}`,
        links: [
          { title: 'Personal Website', url: 'https://personal-site.com' },
          { title: 'LinkedIn Profile', url: 'https://linkedin.com/in/personal' },
          { title: 'Email Me', url: 'mailto:personal@example.com' }
        ]
      },
      business: {
        title: `Business Card ${id}`,
        shortCode: `b${id.slice(-6)}`,
        links: [
          { title: 'Company Website', url: 'https://company.com' },
          { title: 'LinkedIn Profile', url: 'https://linkedin.com/in/business' },
          { title: 'Email Contact', url: 'mailto:contact@company.com' },
          { title: 'Phone', url: 'tel:+1234567890' }
        ],
        design: {
          primaryColor: '#1f2937',
          backgroundColor: '#ffffff',
          textColor: '#374151',
          borderRadius: 8,
          fontFamily: 'Inter'
        }
      },
      event: {
        title: `Tech Conference ${id}`,
        shortCode: `e${id.slice(-6)}`,
        links: [
          { title: 'Event Registration', url: 'https://eventbrite.com/tech-conference' },
          { title: 'Event Schedule', url: 'https://conference.com/schedule' },
          { title: 'Venue Information', url: 'https://venue.com/location' },
          { title: 'Contact Organizer', url: 'mailto:organizer@conference.com' },
          { title: 'Event App', url: 'https://app.conference.com' }
        ]
      },
      restaurant: {
        title: `Restaurant Menu ${id}`,
        shortCode: `r${id.slice(-6)}`,
        links: [
          { title: 'View Menu', url: 'https://restaurant.com/menu' },
          { title: 'Make Reservation', url: 'https://opentable.com/restaurant' },
          { title: 'Order Online', url: 'https://ubereats.com/restaurant' },
          { title: 'Contact Us', url: 'tel:+1234567890' },
          { title: 'Leave Review', url: 'https://google.com/maps/restaurant' }
        ]
      }
    };

    return qrCodes[type];
  }

  /**
   * Generate test project data
   */
  static createTestProject(type: 'personal' | 'business' | 'agency' = 'personal'): TestProject {
    const id = this.getUniqueId();
    
    const projects = {
      personal: {
        name: `Personal Project ${id}`,
        description: `Personal project for testing - ${id}`,
        qrCodes: [
          this.createTestQRCode('personal')
        ]
      },
      business: {
        name: `Business Project ${id}`,
        description: `Business project for testing - ${id}`,
        qrCodes: [
          this.createTestQRCode('business'),
          this.createTestQRCode('event')
        ]
      },
      agency: {
        name: `Agency Project ${id}`,
        description: `Agency project for testing - ${id}`,
        qrCodes: [
          this.createTestQRCode('business'),
          this.createTestQRCode('event'),
          this.createTestQRCode('restaurant')
        ]
      }
    };

    return projects[type];
  }

  /**
   * Generate realistic link data for different industries
   */
  static createIndustryLinks(industry: 'tech' | 'food' | 'retail' | 'health' | 'education'): TestLink[] {
    const industries = {
      tech: [
        { title: 'GitHub Profile', url: 'https://github.com/techuser' },
        { title: 'Portfolio Website', url: 'https://techportfolio.dev' },
        { title: 'Tech Blog', url: 'https://medium.com/@techuser' },
        { title: 'Stack Overflow', url: 'https://stackoverflow.com/users/techuser' },
        { title: 'Contact Email', url: 'mailto:contact@techuser.dev' }
      ],
      food: [
        { title: 'View Menu', url: 'https://restaurant.com/menu' },
        { title: 'Order Online', url: 'https://grubhub.com/restaurant' },
        { title: 'Make Reservation', url: 'https://reservation.com' },
        { title: 'Call Us', url: 'tel:+1234567890' },
        { title: 'Leave Review', url: 'https://yelp.com/restaurant' }
      ],
      retail: [
        { title: 'Online Store', url: 'https://shop.retailer.com' },
        { title: 'New Arrivals', url: 'https://shop.retailer.com/new' },
        { title: 'Sale Items', url: 'https://shop.retailer.com/sale' },
        { title: 'Contact Us', url: 'mailto:info@retailer.com' },
        { title: 'Store Locator', url: 'https://retailer.com/locations' }
      ],
      health: [
        { title: 'Schedule Appointment', url: 'https://healthclinic.com/book' },
        { title: 'Patient Portal', url: 'https://portal.healthclinic.com' },
        { title: 'Health Resources', url: 'https://healthclinic.com/resources' },
        { title: 'Contact Office', url: 'tel:+1234567890' },
        { title: 'Emergency Info', url: 'https://healthclinic.com/emergency' }
      ],
      education: [
        { title: 'Course Catalog', url: 'https://school.edu/courses' },
        { title: 'Student Portal', url: 'https://portal.school.edu' },
        { title: 'Apply Now', url: 'https://school.edu/apply' },
        { title: 'Contact Admissions', url: 'mailto:admissions@school.edu' },
        { title: 'Virtual Tour', url: 'https://school.edu/tour' }
      ]
    };

    return industries[industry];
  }

  /**
   * Generate test URLs for different link types
   */
  static createTestUrls(count: number = 5): TestLink[] {
    const urlTypes = [
      { title: 'Website', url: 'https://example-website.com' },
      { title: 'Email', url: 'mailto:test@example.com' },
      { title: 'Phone', url: 'tel:+1234567890' },
      { title: 'Social Media', url: 'https://twitter.com/testuser' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/testuser' },
      { title: 'Instagram', url: 'https://instagram.com/testuser' },
      { title: 'YouTube', url: 'https://youtube.com/c/testuser' },
      { title: 'Portfolio', url: 'https://portfolio.testuser.com' },
      { title: 'Blog', url: 'https://blog.testuser.com' },
      { title: 'Store', url: 'https://store.testuser.com' }
    ];

    return urlTypes.slice(0, count);
  }

  /**
   * Generate edge case test data
   */
  static createEdgeCaseData() {
    const id = this.getUniqueId();
    
    return {
      // Very long data
      longTitle: `This is a very long QR code title that tests the character limits and display behavior when titles exceed reasonable lengths - ${id}`,
      longUrl: `https://very-long-domain-name-for-testing-character-limits-and-url-validation.com/very/long/path/with/many/segments/that/might/cause/display/issues?parameter1=value1&parameter2=value2&parameter3=value3&id=${id}`,
      
      // Special characters
      specialCharsTitle: `QR Code with Special Chars: !@#$%^&*()_+-=[]{}|;':".,<>?/~\`${id}`,
      unicodeTitle: `QR Code with Unicode: 🚀💻🎉🌟⭐️📱💡🔥${id}`,
      
      // Edge case URLs
      edgeUrls: [
        'https://example.com',
        'http://insecure-site.com',
        'mailto:test@example.com?subject=Test&body=Message',
        'tel:+1-800-555-0123',
        'sms:+1-800-555-0123?body=Hello',
        'ftp://files.example.com/file.txt',
        'https://example.com/path with spaces',
        'https://example.com:8080/port',
        'https://subdomain.example.com',
        'https://example.com?param=value#anchor'
      ],
      
      // Empty/minimal data
      emptyData: {
        title: '',
        links: []
      },
      
      // Maximum data
      maxData: {
        title: 'a'.repeat(100), // Test title length limit
        links: Array.from({ length: 10 }, (_, i) => ({
          title: `Link ${i + 1}`,
          url: `https://example${i + 1}.com`
        }))
      }
    };
  }

  /**
   * Create performance test data
   */
  static createPerformanceTestData(linkCount: number = 5): TestQRCode {
    const id = this.getUniqueId();
    
    return {
      title: `Performance Test QR ${id}`,
      shortCode: `perf${id.slice(-4)}`,
      links: Array.from({ length: linkCount }, (_, i) => ({
        title: `Performance Link ${i + 1}`,
        url: `https://performance-test-${i + 1}.com/path?param=${id}`
      }))
    };
  }

  /**
   * Clean up test data (for use in test teardown)
   */
  static getCleanupIdentifiers(testId: string): string[] {
    return [
      `test-${testId}`,
      `basic-user-${testId}@test.example.com`,
      `premium-user-${testId}@test.example.com`,
      `business-user-${testId}@test.example.com`
    ];
  }
}