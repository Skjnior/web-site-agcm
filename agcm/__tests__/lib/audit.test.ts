// __tests__/lib/audit.test.ts
import { logAction, getAuditLogs } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('Audit Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logAction', () => {
    it('should log an action successfully', async () => {
      const mockAuditData = {
        userId: 'user-1',
        action: 'CREATE' as const,
        entityType: 'Content',
        entityId: 'content-1',
        beforeData: null,
        afterData: { titre: 'Test' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'actor@example.com' });
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'log-1',
        ...mockAuditData,
        createdAt: new Date(),
      });

      await logAction(mockAuditData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { email: true },
      });
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: mockAuditData.userId,
          actorEmail: 'actor@example.com',
          action: mockAuditData.action,
          entityType: mockAuditData.entityType,
          entityId: mockAuditData.entityId,
          beforeData: null,
          afterData: { titre: 'Test' },
        },
      });
    });

    it('should handle errors gracefully', async () => {
      const mockAuditData = {
        userId: 'user-1',
        action: 'CREATE' as const,
        entityType: 'Content',
        entityId: 'content-1',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'a@b.com' });
      (prisma.auditLog.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(logAction(mockAuditData)).resolves.not.toThrow();
    });

    it('should serialize complex objects', async () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: 'a@b.com' });
      await logAction({
        userId: 'user-1',
        action: 'UPDATE' as const,
        entityType: 'Content',
        entityId: 'content-1',
        afterData: complexData,
      });

      expect(prisma.auditLog.create).toHaveBeenCalled();
      const callArgs = (prisma.auditLog.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.afterData).toEqual(complexData);
    });
  });

  describe('getAuditLogs', () => {
    it('should retrieve audit logs for an entity', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          userId: 'user-1',
          action: 'CREATE',
          entityType: 'Content',
          entityId: 'content-1',
          createdAt: new Date(),
          user: {
            id: 'user-1',
            email: 'test@example.com',
          },
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);

      const result = await getAuditLogs('Content', 'content-1');

      expect(result).toEqual(mockLogs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          entityType: 'Content',
          entityId: 'content-1',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
});



