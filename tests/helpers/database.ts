import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TestUser {
  id: string;
  email: string;
  clientId: string;
  projectId: string;
}

export interface TestQRCode {
  id: string;
  shortCode: string;
  projectId: string;
  position: number;
}

export async function createTestUser(email: string): Promise<TestUser> {
  const user = await prisma.user.create({
    data: {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
    }
  });

  const client = await prisma.client.create({
    data: {
      ownerUserId: user.id,
    }
  });

  const project = await prisma.project.create({
    data: {
      clientId: client.id,
      name: 'Default Project',
      isDefault: true,
    }
  });

  return {
    id: user.id,
    email: user.email,
    clientId: client.id,
    projectId: project.id,
  };
}

export async function createTestQRCode(
  projectId: string, 
  position: number = 0,
  title: string = `Test QR Code ${position + 1}`
): Promise<TestQRCode> {
  const shortCode = `test-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  const qrCode = await prisma.qRCode.create({
    data: {
      projectId,
      shortCode,
      title,
      position,
      isActive: true,
      design: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        theme: 'minimal',
      }
    }
  });

  return {
    id: qrCode.id,
    shortCode: qrCode.shortCode,
    projectId: qrCode.projectId,
    position: qrCode.position,
  };
}

export async function createTestProject(
  clientId: string,
  name: string = 'Test Project',
  isDefault: boolean = false
) {
  return await prisma.project.create({
    data: {
      clientId,
      name,
      isDefault,
    }
  });
}

export async function addLinksToQRCode(qrCodeId: string, links: Array<{
  title: string;
  url: string;
  position: number;
}>) {
  const linkData = links.map(link => ({
    qrCodeId,
    title: link.title,
    url: link.url,
    position: link.position,
  }));

  await prisma.link.createMany({
    data: linkData
  });
}

export async function simulateScan(qrCodeId: string, scanData: {
  userAgent?: string;
  referer?: string;
  ipAddress?: string;
}) {
  await prisma.scan.create({
    data: {
      qrCodeId,
      userAgent: scanData.userAgent || 'Test User Agent',
      referer: scanData.referer || 'Direct',
      ipAddress: scanData.ipAddress || '127.0.0.1',
      scannedAt: new Date(),
    }
  });
}

export async function getQRCodeStats(qrCodeId: string) {
  const [qrCode, scanCount, links] = await Promise.all([
    prisma.qRCode.findUnique({
      where: { id: qrCodeId },
      include: { project: true }
    }),
    prisma.scan.count({
      where: { qrCodeId }
    }),
    prisma.link.findMany({
      where: { qrCodeId },
      orderBy: { position: 'asc' }
    })
  ]);

  return {
    qrCode,
    scanCount,
    links,
  };
}

export async function cleanupTestUser(userId: string) {
  // Delete in correct order to respect foreign key constraints
  await prisma.scan.deleteMany({
    where: {
      qrCode: {
        project: {
          client: {
            ownerUserId: userId
          }
        }
      }
    }
  });

  await prisma.link.deleteMany({
    where: {
      qrCode: {
        project: {
          client: {
            ownerUserId: userId
          }
        }
      }
    }
  });

  await prisma.qRCode.deleteMany({
    where: {
      project: {
        client: {
          ownerUserId: userId
        }
      }
    }
  });

  await prisma.project.deleteMany({
    where: {
      client: {
        ownerUserId: userId
      }
    }
  });

  await prisma.client.deleteMany({
    where: {
      ownerUserId: userId
    }
  });

  await prisma.user.delete({
    where: { id: userId }
  });
}

export async function resetTestDatabase() {
  // Clean up all test data (be careful with this!)
  const testUsers = await prisma.user.findMany({
    where: {
      email: {
        contains: 'test-'
      }
    }
  });

  for (const user of testUsers) {
    try {
      await cleanupTestUser(user.id);
    } catch (error) {
      console.warn(`Failed to cleanup test user ${user.id}:`, error);
    }
  }
}

export { prisma };