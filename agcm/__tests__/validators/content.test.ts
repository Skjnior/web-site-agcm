// __tests__/validators/content.test.ts
import { contentCreateSchema } from '@/lib/validators/content';

describe('Content Validator', () => {
  describe('contentCreateSchema', () => {
    it('should validate valid content', () => {
      const validContent = {
        type: 'ACTUALITE',
        titre: 'Test Title',
        contenu: 'Test content',
        visibiliteCible: 'PUBLIC_SITE',
      };

      const result = contentCreateSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should require titre', () => {
      const invalidContent = {
        type: 'ACTUALITE',
        visibiliteCible: 'PUBLIC_SITE',
      };

      const result = contentCreateSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('titre');
      }
    });

    it('should validate type enum', () => {
      const invalidContent = {
        type: 'INVALID_TYPE',
        titre: 'Test',
        visibiliteCible: 'PUBLIC_SITE',
      };

      const result = contentCreateSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should validate visibiliteCible enum', () => {
      const invalidContent = {
        type: 'ACTUALITE',
        titre: 'Test',
        visibiliteCible: 'INVALID',
      };

      const result = contentCreateSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should validate URL format for lienExterne', () => {
      const invalidContent = {
        type: 'ACTUALITE',
        titre: 'Test',
        visibiliteCible: 'PUBLIC_SITE',
        lienExterne: 'not-a-url',
      };

      const result = contentCreateSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should accept valid URL for lienExterne', () => {
      const validContent = {
        type: 'ACTUALITE',
        titre: 'Test',
        visibiliteCible: 'PUBLIC_SITE',
        lienExterne: 'https://example.com',
      };

      const result = contentCreateSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should validate titre max length', () => {
      const invalidContent = {
        type: 'ACTUALITE',
        titre: 'a'.repeat(201), // Too long
        visibiliteCible: 'PUBLIC_SITE',
      };

      const result = contentCreateSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });
  });
});

