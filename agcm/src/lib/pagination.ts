// src/lib/pagination.ts
// Helpers pour la pagination standardisée

import { NextRequest } from 'next/server';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Parse les paramètres de pagination depuis les query params
 */
export function parsePagination(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams;
  const pageParam = searchParams.get('page') || '1';
  const limitParam = searchParams.get('limit') || '20';
  
  // Parse page: ensure it's a valid number >= 1
  const parsedPage = parseInt(pageParam, 10);
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  
  // Parse limit: ensure it's a valid number between 1 and 100
  const parsedLimit = parseInt(limitParam, 10);
  const defaultLimit = 20;
  let limit: number;
  if (isNaN(parsedLimit)) {
    limit = defaultLimit;
  } else if (parsedLimit < 1) {
    limit = 1; // Minimum 1
  } else if (parsedLimit > 100) {
    limit = 100; // Maximum 100
  } else {
    limit = parsedLimit;
  }
  
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Crée les métadonnées de pagination
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Crée une réponse paginée standardisée
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(total, page, limit),
  };
}

