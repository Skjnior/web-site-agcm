// __tests__/lib/mandat.test.ts
import { getMandatActif } from '@/lib/mandat';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    mandat: {
      findFirst: jest.fn(),
    },
  },
}));

describe('Mandat Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMandatActif', () => {
    it('should return active mandate', async () => {
      const now = new Date();
      const mockMandat = {
        id: 'mandat-1',
        titre: 'Mandat 2024-2026',
        dateDebut: new Date(now.getFullYear() - 1, 0, 1),
        dateFin: new Date(now.getFullYear() + 1, 11, 31),
        statut: 'ACTIF',
      };

      (prisma.mandat.findFirst as jest.Mock).mockResolvedValue(mockMandat);

      const result = await getMandatActif();

      expect(result).toEqual(mockMandat);
      expect(prisma.mandat.findFirst).toHaveBeenCalledWith({
        where: { statut: 'ACTIF' },
        orderBy: { dateDebut: 'desc' },
      });
    });

    it('should return null when no active mandate exists', async () => {
      (prisma.mandat.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getMandatActif();

      expect(result).toBeNull();
    });
  });
});

