export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  is_superuser: boolean;
  is_active: boolean;
  roles: string[];
  permissions: string[];
  last_login_at?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user: UserProfile;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  description?: string | null;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
  is_system_role: boolean;
  permissions: Permission[];
}

