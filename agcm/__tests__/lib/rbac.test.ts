// __tests__/lib/rbac.test.ts
import {
  isSuperAdmin,
  isAdmin,
  isBureauActif,
  canApprove,
  canModifyContent,
  canDeleteContent,
  canCreateVote,
  canViewDetailedVotes,
} from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { RoleSysteme } from '@prisma/client';
import { getMandatActif } from '@/lib/mandat';

// Mock mandat helper
jest.mock('@/lib/mandat', () => ({
  getMandatActif: jest.fn(),
}));

// Mock Prisma (override global mock for this test file)
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
    },
    affectationPoste: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    content: {
      findUnique: jest.fn(),
    },
    mandat: {
      findFirst: jest.fn(),
    },
    poste: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

describe('RBAC Functions', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    roleSysteme: 'MEMBER' as RoleSysteme,
    member: {
      id: 'member-1',
      affectations: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isSuperAdmin', () => {
    it('should return true for SUPER_ADMIN', () => {
      const user = { ...mockUser, roleSysteme: 'SUPER_ADMIN' as RoleSysteme };
      expect(isSuperAdmin(user)).toBe(true);
    });

    it('should return false for other roles', () => {
      expect(isSuperAdmin(mockUser)).toBe(false);
      const adminUser = { ...mockUser, roleSysteme: 'ADMIN' as RoleSysteme };
      expect(isSuperAdmin(adminUser)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN', () => {
      const user = { ...mockUser, roleSysteme: 'ADMIN' as RoleSysteme };
      expect(isAdmin(user)).toBe(true);
    });

    it('should return true for SUPER_ADMIN', () => {
      const user = { ...mockUser, roleSysteme: 'SUPER_ADMIN' as RoleSysteme };
      expect(isAdmin(user)).toBe(true);
    });

    it('should return false for MEMBER', () => {
      expect(isAdmin(mockUser)).toBe(false);
    });
  });

  describe('isBureauActif', () => {
    it('should return true when user has active bureau affectation', async () => {
      (getMandatActif as jest.Mock).mockResolvedValue({
        id: 'mandat-1',
        statut: 'ACTIF',
      });
      (prisma.member.findUnique as jest.Mock).mockResolvedValue({
        id: 'member-1',
        affectations: [{
          statut: 'ACTIF',
          poste: { estBureau: true },
        }],
      });

      const result = await isBureauActif('user-1');
      expect(result).toBe(true);
    });

    it('should return false when user has no active bureau affectation', async () => {
      (getMandatActif as jest.Mock).mockResolvedValue({
        id: 'mandat-1',
        statut: 'ACTIF',
      });
      (prisma.member.findUnique as jest.Mock).mockResolvedValue({
        id: 'member-1',
        affectations: [],
      });

      const result = await isBureauActif('user-1');
      expect(result).toBe(false);
    });
  });

  describe('canApprove', () => {
    it('should return true for admin approving other user content', async () => {
      const adminUser = { ...mockUser, roleSysteme: 'ADMIN' as RoleSysteme, id: 'admin-user-1' };
      (prisma.content.findUnique as jest.Mock).mockResolvedValue({
        id: 'content-1',
        auteurPosteId: 'poste-2',
      });
      (prisma.poste.findUnique as jest.Mock).mockResolvedValue({
        id: 'poste-2',
        affectations: [{
          member: { userId: 'other-user-1' },
        }],
      });

      const result = await canApprove(adminUser, 'content-1');
      expect(result).toBe(true);
    });

    it('should return false for admin approving own content (juge et partie)', async () => {
      const adminUser = { ...mockUser, roleSysteme: 'ADMIN' as RoleSysteme, id: 'admin-user-1' };
      (prisma.content.findUnique as jest.Mock).mockResolvedValue({
        id: 'content-1',
        auteurPosteId: 'poste-1',
        auteurPoste: {
          id: 'poste-1',
          affectations: [{
            statut: 'ACTIF',
            member: {
              userId: 'admin-user-1',
            },
          }],
        },
      });
      (prisma.member.findUnique as jest.Mock).mockResolvedValue({
        id: 'member-1',
        userId: 'admin-user-1',
      });
      (prisma.affectationPoste.findFirst as jest.Mock).mockResolvedValue({
        posteId: 'poste-1',
        memberId: 'member-1',
        statut: 'ACTIF',
      });

      const result = await canApprove(adminUser, 'content-1');
      expect(result).toBe(false);
    });

    it('should return false for non-admin users', async () => {
      const result = await canApprove(mockUser, 'content-1');
      expect(result).toBe(false);
    });
  });

  describe('canModifyContent', () => {
    it('should return true when user is content author', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.content.findUnique as jest.Mock).mockResolvedValue({
        id: 'content-1',
        auteurPosteId: 'poste-1',
        statutWorkflow: 'BROUILLON',
        auteurPoste: { id: 'poste-1' },
      });
      (getMandatActif as jest.Mock).mockResolvedValue({ id: 'mandat-1' });
      (prisma.member.findUnique as jest.Mock).mockResolvedValue({
        id: 'member-1',
        affectations: [{
          posteId: 'poste-1',
          statut: 'ACTIF',
        }],
      });

      const result = await canModifyContent('user-1', 'content-1');
      expect(result.canModify).toBe(true);
    });

    it('should return false when user is not content author', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.content.findUnique as jest.Mock).mockResolvedValue({
        id: 'content-1',
        auteurPosteId: 'poste-2',
        statutWorkflow: 'BROUILLON',
        auteurPoste: { id: 'poste-2' },
      });
      (getMandatActif as jest.Mock).mockResolvedValue({ id: 'mandat-1' });
      (prisma.member.findUnique as jest.Mock).mockResolvedValue({
        id: 'member-1',
        affectations: [{
          posteId: 'poste-1',
          statut: 'ACTIF',
        }],
      });

      const result = await canModifyContent('user-1', 'content-1');
      expect(result.canModify).toBe(false);
    });
  });

  describe('canCreateVote', () => {
    it('should return true for ADMIN', () => {
      const adminUser = { ...mockUser, roleSysteme: 'ADMIN' as RoleSysteme };
      expect(canCreateVote(adminUser)).toBe(true);
    });

    it('should return true for SUPER_ADMIN', () => {
      const superAdminUser = { ...mockUser, roleSysteme: 'SUPER_ADMIN' as RoleSysteme };
      expect(canCreateVote(superAdminUser)).toBe(true);
    });

    it('should return false for MEMBER', () => {
      expect(canCreateVote(mockUser)).toBe(false);
    });
  });

  describe('canViewDetailedVotes', () => {
    it('should return true for SUPER_ADMIN', () => {
      const superAdminUser = { ...mockUser, roleSysteme: 'SUPER_ADMIN' as RoleSysteme };
      expect(canViewDetailedVotes(superAdminUser)).toBe(true);
    });

    it('should return false for ADMIN', () => {
      const adminUser = { ...mockUser, roleSysteme: 'ADMIN' as RoleSysteme };
      expect(canViewDetailedVotes(adminUser)).toBe(false);
    });

    it('should return false for MEMBER', () => {
      expect(canViewDetailedVotes(mockUser)).toBe(false);
    });
  });
});

