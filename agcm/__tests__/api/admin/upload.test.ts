// __tests__/api/admin/upload.test.ts
import { POST } from '@/app/api/admin/upload/route';
import { auth } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/file-upload';
import { NextRequest } from 'next/server';

// Mock NextResponse properly
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextRequest: jest.fn(),
    NextResponse: {
      ...actual.NextResponse,
      json: (body: any, init?: ResponseInit) => {
        const response = new Response(JSON.stringify(body), {
          status: init?.status || 200,
          headers: { 'Content-Type': 'application/json', ...init?.headers },
        });
        // Add json method to response for tests
        (response as any).json = async () => body;
        return response;
      },
    },
  };
});

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/file-upload', () => ({
  saveUploadedFile: jest.fn(),
}));

describe('POST /api/admin/upload', () => {
  let mockRequest: NextRequest;
  let mockFormData: FormData;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFormData = new FormData();
    const mockFile = new Blob(['test content'], { type: 'application/pdf' }) as File;
    Object.defineProperty(mockFile, 'name', { value: 'test.pdf', writable: false });
    mockFormData.append('file', mockFile);

    mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest;
  });

  it('should upload file successfully for admin user', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { role: 'ROLE_ADMIN' },
    });

    (saveUploadedFile as jest.Mock).mockResolvedValue({
      fileUrl: '/uploads/ressources/123-test.pdf',
      fileName: 'test.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.fileUrl).toBe('/uploads/ressources/123-test.pdf');
    expect(data.fileName).toBe('test.pdf');
    expect(saveUploadedFile).toHaveBeenCalled();
  });

  it('should reject unauthorized user', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { role: 'ROLE_MEMBER' },
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(saveUploadedFile).not.toHaveBeenCalled();
  });

  it('should reject request without file', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { role: 'ROLE_ADMIN' },
    });

    const emptyFormData = new FormData();
    const requestWithoutFile = {
      formData: jest.fn().mockResolvedValue(emptyFormData),
    } as unknown as NextRequest;

    const response = await POST(requestWithoutFile);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Aucun fichier fourni');
  });

  it('should handle upload errors', async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { role: 'ROLE_ADMIN' },
    });

    (saveUploadedFile as jest.Mock).mockRejectedValue(new Error('Upload failed'));

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});

