import axios from 'axios';
import type {
  ContainerListItemDto,
  ContainerDto,
  ContainerCostBreakdownDto,
  CreateContainerDto,
  UpdateContainerDto,
  PaginatedResult,
} from './types/containers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//const API_BASE_URL = 'https://localhost:7099/api';


interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface ContainerSuggestionDto {
  containerId: string;
  containerNumber: string;
  availableWeightKg: number;
  availableVolumeCbm: number;
  currentWeightKg: number;
  currentVolumeCbm: number;
  maxWeightKg: number;
  maxVolumeCbm: number;
  destinationPort?: string;
  originPort?: string;
  itemCount: number;
  totalShippingCost: number;
  score: number;
  isBestMatch: boolean;
  weightUtilizationAfter: number;
  volumeUtilizationAfter: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function mapResponse<T>(data: {
  success?: boolean;
  isSuccess?: boolean;
  message: string;
  data: T;
}): ApiResponse<T> {
  return {
    isSuccess: data.success ?? data.isSuccess ?? false,
    message: data.message,
    data: data.data,
  };
}

export const ContainerService = {
  /** ImportOffice: get own containers (paginated) */
  async getOfficeContainers(params?: {
    status?: number;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResult<ContainerListItemDto>>> {
    const res = await api.get('/Containers', { params });
    return mapResponse(res.data);
  },

  /** Admin/Support: get all containers (paginated) */
  async getAllContainers(params?: {
    status?: number;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResult<ContainerListItemDto>>> {
    const res = await api.get('/Containers/admin/all', { params });
    return mapResponse(res.data);
  },

  /** Get smart container suggestions for an LCL import request */
  async getContainerSuggestions(requestId: string): Promise<ApiResponse<ContainerSuggestionDto[]>> {
    const res = await api.get('/containers/suggestions', { params: { requestId } });
    return mapResponse(res.data);
  },

  /** Assign a container to an import request (LCL) */
  async assignContainer(importRequestId: string, containerId: string): Promise<ApiResponse<boolean>> {
    const res = await api.post('/containers/assign', { importRequestId, containerId });
    return mapResponse(res.data);
  },

  /** Get container by ID */
  async getById(id: string): Promise<ApiResponse<ContainerDto>> {
    const res = await api.get(`/Containers/${id}`);
    return mapResponse(res.data);
  },

  /** ImportOffice: create new container */
  async create(dto: CreateContainerDto): Promise<ApiResponse<ContainerDto>> {
    const res = await api.post('/Containers', dto);
    return mapResponse(res.data);
  },

  /** ImportOffice: update container */
  async update(id: string, dto: UpdateContainerDto): Promise<ApiResponse<ContainerDto>> {
    const res = await api.put(`/Containers/${id}`, dto);
    return mapResponse(res.data);
  },

  /** ImportOffice: close container */
  async close(id: string): Promise<ApiResponse<ContainerDto>> {
    const res = await api.patch(`/Containers/${id}/close`);
    return mapResponse(res.data);
  },

  /** ImportOffice/Admin/Support: update container status */
  async updateStatus(id: string, status: number): Promise<ApiResponse<ContainerDto>> {
    const res = await api.patch(`/Containers/${id}/status`, { status });
    return mapResponse(res.data);
  },

  /** ImportOffice/Admin: update shipping cost */
  async updateShippingCost(
    id: string,
    totalShippingCost: number
  ): Promise<ApiResponse<ContainerDto>> {
    const res = await api.patch(`/Containers/${id}/shipping-cost`, { totalShippingCost });
    return mapResponse(res.data);
  },

  /** ImportOffice/Admin: remove item from container */
  async removeItem(containerId: string, itemId: string): Promise<ApiResponse<ContainerDto>> {
    const res = await api.delete(`/Containers/${containerId}/items/${itemId}`);
    return mapResponse(res.data);
  },

  /** Admin/ImportOffice/Support: get cost breakdown */
  async getCostBreakdown(id: string): Promise<ApiResponse<ContainerCostBreakdownDto>> {
    const res = await api.get(`/Containers/${id}/cost-breakdown`);
    return mapResponse(res.data);
  },

  /** Admin: soft delete container */
  async delete(id: string): Promise<ApiResponse<boolean>> {
    const res = await api.delete(`/Containers/${id}`);
    return mapResponse(res.data);
  },
};