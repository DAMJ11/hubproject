export type UserRole = "brand" | "manufacturer" | "admin";

export interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  company_id: number | null;
  terms_accepted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "brand" | "manufacturer";
  companyName: string;
  termsAccepted: boolean;
}

export interface UserLoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: number | null;
  companyName?: string;
  hasPaymentMethod?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserResponse;
  token?: string;
}
