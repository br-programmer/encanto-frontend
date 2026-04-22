"use server";

import { api } from "@/lib/api";
import type {
  UserInvoiceProfile,
  CreateUserInvoiceProfileRequest,
  UpdateUserInvoiceProfileRequest,
  UserInvoiceProfileFilters,
  PaginatedResponse,
} from "@/lib/api";

export async function getInvoiceProfilesAction(
  accessToken: string,
  filters?: UserInvoiceProfileFilters
): Promise<PaginatedResponse<UserInvoiceProfile>> {
  return api.userInvoiceProfiles.listWithToken(accessToken, filters);
}

export async function getDefaultInvoiceProfileAction(
  accessToken: string
): Promise<UserInvoiceProfile | null> {
  return api.userInvoiceProfiles.getDefaultWithToken(accessToken);
}

export async function getInvoiceProfileByIdAction(
  id: string,
  accessToken: string
): Promise<UserInvoiceProfile> {
  return api.userInvoiceProfiles.getByIdWithToken(id, accessToken);
}

export async function createInvoiceProfileAction(
  data: CreateUserInvoiceProfileRequest,
  accessToken: string
): Promise<UserInvoiceProfile> {
  return api.userInvoiceProfiles.createWithToken(data, accessToken);
}

export async function updateInvoiceProfileAction(
  id: string,
  data: UpdateUserInvoiceProfileRequest,
  accessToken: string
): Promise<UserInvoiceProfile> {
  return api.userInvoiceProfiles.updateWithToken(id, data, accessToken);
}

export async function deleteInvoiceProfileAction(
  id: string,
  accessToken: string
): Promise<void> {
  return api.userInvoiceProfiles.deleteWithToken(id, accessToken);
}

export async function setDefaultInvoiceProfileAction(
  id: string,
  accessToken: string
): Promise<UserInvoiceProfile> {
  return api.userInvoiceProfiles.setDefaultWithToken(id, accessToken);
}
