// __tests__/lib/pagination.test.ts
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

// Mock NextRequest
const createMockRequest = (url: string) => {
  return {
    nextUrl: {
      searchParams: new URLSearchParams(url.split('?')[1] || ''),
    },
  } as any;
};

describe('Pagination Utilities', () => {
  describe('parsePagination', () => {
    it('should parse default pagination', () => {
      const request = createMockRequest('http://localhost:3000/api/test');
      const result = parsePagination(request);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20); // Default limit is 20, not 10
      expect(result.offset).toBe(0);
    });

    it('should parse custom page and limit', () => {
      const request = createMockRequest('http://localhost:3000/api/test?page=3&limit=20');
      const result = parsePagination(request);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(40);
    });

    it('should handle invalid page values', () => {
      const request1 = createMockRequest('http://localhost:3000/api/test?page=0');
      const result1 = parsePagination(request1);
      expect(result1.page).toBe(1);

      const request2 = createMockRequest('http://localhost:3000/api/test?page=-1');
      const result2 = parsePagination(request2);
      expect(result2.page).toBe(1);

      const request3 = createMockRequest('http://localhost:3000/api/test?page=abc');
      const result3 = parsePagination(request3);
      expect(result3.page).toBe(1); // NaN becomes 1 due to Math.max(1, NaN || 1)
    });

    it('should handle invalid limit values', () => {
      const request1 = createMockRequest('http://localhost:3000/api/test?limit=0');
      const result1 = parsePagination(request1);
      expect(result1.limit).toBe(1); // Math.max(1, ...) ensures minimum 1

      const request2 = createMockRequest('http://localhost:3000/api/test?limit=101');
      const result2 = parsePagination(request2);
      expect(result2.limit).toBe(100); // Math.min(100, ...) caps at 100

      const request3 = createMockRequest('http://localhost:3000/api/test?limit=abc');
      const result3 = parsePagination(request3);
      // parseInt('abc', 10) returns NaN, so || 20 makes it 20
      expect(result3.limit).toBe(20);
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const total = 25;
      const page = 2;
      const limit = 10;

      const result = createPaginatedResponse(data, total, page, limit);

      expect(result.data).toEqual(data);
      expect(result.pagination).toEqual({
        total,
        page,
        limit,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should handle first page', () => {
      const data = [{ id: 1 }];
      const result = createPaginatedResponse(data, 5, 1, 10);

      expect(result.pagination.hasPrev).toBe(false);
      expect(result.pagination.hasNext).toBe(false);
    });

    it('should handle last page', () => {
      const data = [{ id: 1 }];
      const result = createPaginatedResponse(data, 25, 3, 10);

      expect(result.pagination.hasPrev).toBe(true);
      expect(result.pagination.hasNext).toBe(false);
    });

    it('should handle empty data', () => {
      const result = createPaginatedResponse([], 0, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});

