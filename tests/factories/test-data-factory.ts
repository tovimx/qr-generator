/**
 * Comprehensive Test Data Factory
 * 
 * Provides reusable, consistent test data generation for E2E tests.
 * Includes factories for users, QR codes, projects, links, and themes.
 */

export interface TestUser {
  id: string;
  email: string;
  name: string;
  password: string;
  isVerified: boolean;
}

export interface TestProject {
  id: string;
  name: string;
  description: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
}

export interface TestQRCode {
  id: string;
  shortCode: string;
  title: string;
  description?: string;
  isActive: boolean;
  userId: string;
  projectId: string;
  preferredDomain?: string;
  scanCount: number;
  createdAt: string;
  links: TestLink[];
  theme?: TestTheme;
  logo?: TestLogo;
}

export interface TestLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  order: number;
  isActive: boolean;
  clickCount: number;
  qrCodeId: string;
}

export interface TestTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  fontFamily: string;
  layout: 'center' | 'left' | 'right';
}

export interface TestLogo {
  id: string;
  fileName: string;
  url: string;
  size: 'small' | 'medium' | 'large';
  shape: 'circle' | 'square' | 'rounded';
}

export interface TestAnalytics {
  id: string;
  qrCodeId: string;
  eventType: 'scan' | 'click' | 'view';
  timestamp: string;
  userAgent: string;
  ipAddress: string;
  country?: string;
  city?: string;
  referrer?: string;
}

export class TestDataFactory {
  private static instance: TestDataFactory;
  private userCounter = 0;
  private qrCodeCounter = 0;
  private projectCounter = 0;
  private linkCounter = 0;
  private themeCounter = 0;

  public static getInstance(): TestDataFactory {
    if (!TestDataFactory.instance) {
      TestDataFactory.instance = new TestDataFactory();
    }
    return TestDataFactory.instance;
  }

  /**
   * Generate a test user with realistic data
   */
  createUser(overrides: Partial<TestUser> = {}): TestUser {
    this.userCounter++;
    const baseEmail = `testuser${this.userCounter}@example.com`;
    
    return {
      id: `user_${Date.now()}_${this.userCounter}`,
      email: baseEmail,
      name: `Test User ${this.userCounter}`,
      password: 'SecurePass123!',
      isVerified: true,
      ...overrides
    };
  }

  /**
   * Generate multiple test users
   */
  createUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  /**
   * Generate a test project
   */
  createProject(userId: string, overrides: Partial<TestProject> = {}): TestProject {
    this.projectCounter++;
    
    return {
      id: `project_${Date.now()}_${this.projectCounter}`,
      name: `Test Project ${this.projectCounter}`,
      description: `Description for test project ${this.projectCounter}`,
      userId,
      isDefault: this.projectCounter === 1,
      createdAt: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate a test QR code with realistic data
   */
  createQRCode(userId: string, projectId: string, overrides: Partial<TestQRCode> = {}): TestQRCode {
    this.qrCodeCounter++;
    const shortCode = this.generateShortCode();
    
    const qrCode: TestQRCode = {
      id: `qr_${Date.now()}_${this.qrCodeCounter}`,
      shortCode,
      title: `QR Code ${this.qrCodeCounter}`,
      description: `Test QR code for testing purposes ${this.qrCodeCounter}`,
      isActive: true,
      userId,
      projectId,
      scanCount: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
      links: [],
      ...overrides
    };

    // Add default links if not provided
    if (!overrides.links) {
      qrCode.links = this.createLinksForQRCode(qrCode.id, 3);
    }

    return qrCode;
  }

  /**
   * Generate multiple QR codes for a project
   */
  createQRCodes(userId: string, projectId: string, count: number): TestQRCode[] {
    return Array.from({ length: count }, () => this.createQRCode(userId, projectId));
  }

  /**
   * Generate a test link for a QR code
   */
  createLink(qrCodeId: string, order: number = 1, overrides: Partial<TestLink> = {}): TestLink {
    this.linkCounter++;
    
    const linkTypes = [
      { title: 'Website', url: 'https://example.com' },
      { title: 'Social Media', url: 'https://twitter.com/example' },
      { title: 'Email', url: 'mailto:contact@example.com' },
      { title: 'Phone', url: 'tel:+1234567890' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/example' },
      { title: 'YouTube', url: 'https://youtube.com/c/example' },
      { title: 'Instagram', url: 'https://instagram.com/example' },
      { title: 'Facebook', url: 'https://facebook.com/example' }
    ];

    const linkType = linkTypes[this.linkCounter % linkTypes.length];
    
    return {
      id: `link_${Date.now()}_${this.linkCounter}`,
      title: linkType.title,
      url: linkType.url,
      description: `${linkType.title} link for testing`,
      order,
      isActive: true,
      clickCount: Math.floor(Math.random() * 50),
      qrCodeId,
      ...overrides
    };
  }

  /**
   * Generate multiple links for a QR code
   */
  createLinksForQRCode(qrCodeId: string, count: number): TestLink[] {
    return Array.from({ length: count }, (_, index) => 
      this.createLink(qrCodeId, index + 1)
    );
  }

  /**
   * Generate a test theme
   */
  createTheme(overrides: Partial<TestTheme> = {}): TestTheme {
    this.themeCounter++;
    
    const themePresets = [
      {
        name: 'Ocean Blue',
        primaryColor: '#0066cc',
        secondaryColor: '#004080',
        backgroundColor: '#f0f8ff',
        textColor: '#003366'
      },
      {
        name: 'Forest Green',
        primaryColor: '#228b22',
        secondaryColor: '#006400',
        backgroundColor: '#f0fff0',
        textColor: '#013220'
      },
      {
        name: 'Sunset Orange',
        primaryColor: '#ff6600',
        secondaryColor: '#cc5200',
        backgroundColor: '#fff8f0',
        textColor: '#663300'
      },
      {
        name: 'Purple Modern',
        primaryColor: '#6a0dad',
        secondaryColor: '#4b0082',
        backgroundColor: '#f8f0ff',
        textColor: '#2d0135'
      }
    ];

    const preset = themePresets[this.themeCounter % themePresets.length];
    
    return {
      id: `theme_${Date.now()}_${this.themeCounter}`,
      name: preset.name,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
      buttonStyle: ['rounded', 'square', 'pill'][Math.floor(Math.random() * 3)] as 'rounded' | 'square' | 'pill',
      fontFamily: ['Inter', 'Roboto', 'Arial', 'Georgia'][Math.floor(Math.random() * 4)],
      layout: ['center', 'left', 'right'][Math.floor(Math.random() * 3)] as 'center' | 'left' | 'right',
      ...overrides
    };
  }

  /**
   * Generate a test logo configuration
   */
  createLogo(overrides: Partial<TestLogo> = {}): TestLogo {
    return {
      id: `logo_${Date.now()}`,
      fileName: 'test-logo.png',
      url: '/test-assets/test-logo.png',
      size: 'medium',
      shape: 'circle',
      ...overrides
    };
  }

  /**
   * Generate test analytics data
   */
  createAnalytics(qrCodeId: string, count: number = 10): TestAnalytics[] {
    const events: TestAnalytics['eventType'][] = ['scan', 'click', 'view'];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    ];
    
    const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR'];
    const cities = ['New York', 'London', 'Toronto', 'Sydney', 'Berlin', 'Paris', 'Tokyo', 'São Paulo'];

    return Array.from({ length: count }, (_, index) => ({
      id: `analytics_${Date.now()}_${index}`,
      qrCodeId,
      eventType: events[Math.floor(Math.random() * events.length)],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      referrer: Math.random() > 0.5 ? 'https://google.com' : undefined
    }));
  }

  /**
   * Generate a complete test scenario with user, projects, QR codes, and links
   */
  createCompleteScenario(options: {
    projectCount?: number;
    qrCodesPerProject?: number;
    linksPerQRCode?: number;
  } = {}): {
    user: TestUser;
    projects: TestProject[];
    qrCodes: TestQRCode[];
    allLinks: TestLink[];
  } {
    const {
      projectCount = 2,
      qrCodesPerProject = 3,
      linksPerQRCode = 4
    } = options;

    const user = this.createUser();
    const projects = Array.from({ length: projectCount }, () => 
      this.createProject(user.id)
    );

    const qrCodes: TestQRCode[] = [];
    const allLinks: TestLink[] = [];

    projects.forEach(project => {
      const projectQRCodes = Array.from({ length: qrCodesPerProject }, () => {
        const qrCode = this.createQRCode(user.id, project.id);
        qrCode.links = this.createLinksForQRCode(qrCode.id, linksPerQRCode);
        allLinks.push(...qrCode.links);
        return qrCode;
      });
      qrCodes.push(...projectQRCodes);
    });

    return {
      user,
      projects,
      qrCodes,
      allLinks
    };
  }

  /**
   * Generate test data for stress testing
   */
  createStressTestData(): {
    users: TestUser[];
    projects: TestProject[];
    qrCodes: TestQRCode[];
    links: TestLink[];
  } {
    const users = this.createUsers(10);
    const projects: TestProject[] = [];
    const qrCodes: TestQRCode[] = [];
    const links: TestLink[] = [];

    users.forEach(user => {
      // Each user gets 2-5 projects
      const userProjects = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, () =>
        this.createProject(user.id)
      );
      projects.push(...userProjects);

      userProjects.forEach(project => {
        // Each project gets 3-10 QR codes
        const projectQRCodes = Array.from({ length: Math.floor(Math.random() * 8) + 3 }, () =>
          this.createQRCode(user.id, project.id)
        );
        qrCodes.push(...projectQRCodes);

        projectQRCodes.forEach(qrCode => {
          // Each QR code gets 1-8 links
          const qrLinks = this.createLinksForQRCode(qrCode.id, Math.floor(Math.random() * 8) + 1);
          links.push(...qrLinks);
          qrCode.links = qrLinks;
        });
      });
    });

    return { users, projects, qrCodes, links };
  }

  /**
   * Generate a unique short code for QR codes
   */
  private generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Reset all counters (useful for test isolation)
   */
  reset(): void {
    this.userCounter = 0;
    this.qrCodeCounter = 0;
    this.projectCounter = 0;
    this.linkCounter = 0;
    this.themeCounter = 0;
  }

  /**
   * Create realistic business scenarios
   */
  createBusinessScenarios(): {
    restaurant: { user: TestUser; project: TestProject; qrCode: TestQRCode };
    freelancer: { user: TestUser; project: TestProject; qrCode: TestQRCode };
    eventOrganizer: { user: TestUser; project: TestProject; qrCode: TestQRCode };
    retailStore: { user: TestUser; project: TestProject; qrCode: TestQRCode };
  } {
    // Restaurant scenario
    const restaurantUser = this.createUser({
      name: 'Restaurant Owner',
      email: 'owner@restaurant.com'
    });
    const restaurantProject = this.createProject(restaurantUser.id, {
      name: 'Main Restaurant',
      description: 'Digital menu and ordering system'
    });
    const restaurantQR = this.createQRCode(restaurantUser.id, restaurantProject.id, {
      title: 'Digital Menu',
      links: [
        this.createLink('', 1, { title: 'View Menu', url: 'https://restaurant.com/menu' }),
        this.createLink('', 2, { title: 'Order Online', url: 'https://restaurant.com/order' }),
        this.createLink('', 3, { title: 'Call Us', url: 'tel:+1234567890' }),
        this.createLink('', 4, { title: 'Leave Review', url: 'https://google.com/review' })
      ]
    });

    // Freelancer scenario
    const freelancerUser = this.createUser({
      name: 'Jane Designer',
      email: 'jane@designer.com'
    });
    const freelancerProject = this.createProject(freelancerUser.id, {
      name: 'Portfolio',
      description: 'Professional portfolio and contact'
    });
    const freelancerQR = this.createQRCode(freelancerUser.id, freelancerProject.id, {
      title: 'My Portfolio',
      links: [
        this.createLink('', 1, { title: 'Portfolio', url: 'https://janedesigner.com' }),
        this.createLink('', 2, { title: 'LinkedIn', url: 'https://linkedin.com/in/janedesigner' }),
        this.createLink('', 3, { title: 'Email Me', url: 'mailto:jane@designer.com' }),
        this.createLink('', 4, { title: 'Dribbble', url: 'https://dribbble.com/janedesigner' })
      ]
    });

    // Event organizer scenario
    const eventUser = this.createUser({
      name: 'Event Coordinator',
      email: 'coordinator@events.com'
    });
    const eventProject = this.createProject(eventUser.id, {
      name: 'Tech Conference 2024',
      description: 'Annual technology conference'
    });
    const eventQR = this.createQRCode(eventUser.id, eventProject.id, {
      title: 'Tech Conference Info',
      links: [
        this.createLink('', 1, { title: 'Event Schedule', url: 'https://techconf2024.com/schedule' }),
        this.createLink('', 2, { title: 'Register', url: 'https://techconf2024.com/register' }),
        this.createLink('', 3, { title: 'Speakers', url: 'https://techconf2024.com/speakers' }),
        this.createLink('', 4, { title: 'Contact', url: 'https://techconf2024.com/contact' })
      ]
    });

    // Retail store scenario
    const retailUser = this.createUser({
      name: 'Store Manager',
      email: 'manager@retailstore.com'
    });
    const retailProject = this.createProject(retailUser.id, {
      name: 'Retail Store',
      description: 'Customer engagement and promotions'
    });
    const retailQR = this.createQRCode(retailUser.id, retailProject.id, {
      title: 'Store Promotions',
      links: [
        this.createLink('', 1, { title: 'Current Offers', url: 'https://retailstore.com/offers' }),
        this.createLink('', 2, { title: 'Loyalty Program', url: 'https://retailstore.com/loyalty' }),
        this.createLink('', 3, { title: 'Store Locations', url: 'https://retailstore.com/locations' }),
        this.createLink('', 4, { title: 'Customer Support', url: 'https://retailstore.com/support' })
      ]
    });

    return {
      restaurant: { user: restaurantUser, project: restaurantProject, qrCode: restaurantQR },
      freelancer: { user: freelancerUser, project: freelancerProject, qrCode: freelancerQR },
      eventOrganizer: { user: eventUser, project: eventProject, qrCode: eventQR },
      retailStore: { user: retailUser, project: retailProject, qrCode: retailQR }
    };
  }
}