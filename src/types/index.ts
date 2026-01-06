export interface VoiceModel {
  id: string;
  name: string;
  image?: string;
  description?: string;
  category?: string;
  gender?: string;
  age?: string;
  accent?: string;
}

export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  countryCode?: string;
}


export type RegisterResponse = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  message: string;
};

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

export interface ValidationErrors {
  [key: string]: string[];
}


export interface PasswordInputProps {
  placeholder?: string;
  type: "text" | "password";
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerclassname?: string;
  className?: string;
  required?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void
}

export type LoginResponse = {

  success?: boolean;
  message?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: Date;
  };
  token?: string;

  result?: {
    error?: string;
    requiresVerification?: boolean;
    email?: string;
  };
}


// export type LoginResponse = {
//   success?: boolean;
//   message?: string;
//   user?: {
//     id: number;
//     name: string;
//     email: string;
//     isVerified: boolean;
//     createdAt: Date;
//   };
//   token?: string;
//   requiresVerification?: boolean;
//   email?: string;
//   error?: string;
// }


export interface User {
  id: number
  name: string
  email: string
  isVerified: boolean
  createdAt: Date
}

export interface UserState {
  user: User | null
  email: string | null
  isAuthenticated: boolean
  token: string | null
  setUser: (user: User) => void
  setEmail: (email: string) => void
  setToken: (token: string) => void
  clearUser: () => void
  clearEmail: () => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
}


export type ForgotPasswordResponse = {
  success?: boolean;
  message?: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}



export type UploadScriptData = {
  projectName: string;
  language: string;
  content: string;
  mode: 'manual' | 'upload';
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  userId: number;
}


export type UploadScriptDataFrontend = {
  projectName: string;
  language: string;
  content?: string; // For manual mode or derived from file
  mode: 'manual' | 'upload';
  userId: number;
  file?: File; // For upload mode (client-side)
  // Optional file metadata (sent to server when in upload mode)
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  // Audio generation options
  voiceModelId?: string; // Selected voice model ID for audio generation
  voiceSettings?: VoiceSettings;
  generateAudio?: boolean;
};

export type UploadScriptResponse = {
  success: boolean;
  message: string;
  scriptId: string;
  data: {
    id: string;
    projectName: string;
    language: string;
    content: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    uploadMode: string;
    createdAt: string;
  };
};

export type UseUploadScriptReturn = {
  uploadScript: (data: UploadScriptDataFrontend) => Promise<UploadScriptResponse>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
};

// Voice Settings for ElevenLabs integration
export interface VoiceSettings {
  gender: "MALE" | "FEMALE" | "KID";
  age: "CHILD" | "TEENAGER" | "YOUNG_ADULT" | "ELDERLY_45_65" | "OLD_70_PLUS";
  language: "Yoruba" | "Hausa" | "Igbo" | "English";
  mood: "ANGRY" | "HAPPY" | "ANXIOUS" | "DRAMA" | "SURPRISED" | "SCARED" | "LAX" | "SAD" | "EXCITED" | "DISAPPOINTED" | "STRICT";
}

// Enhanced upload script data with voice settings
export type UploadScriptDataWithVoice = UploadScriptData & {
  voiceModelId?: string; // Selected YarnGPT voice model ID
  voiceSettings?: VoiceSettings;
  generateAudio?: boolean;
};

// Audio generation response
export type AudioGenerationResponse = {
  success: boolean;
  audioFileName?: string;
  audioFileSize?: number;
  audioFileUrl?: string;
  error?: string;
};

// Profile update types
export interface UpdateProfileData {
  userId: number;
  name?: string;
  phoneNumber?: string;
  countryCode?: string;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
}

export type UpdateProfileResponse = {
  success?: boolean;
  message?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string;
    countryCode?: number;
    isVerified: boolean;
    createdAt: Date;
  };
  error?: string;
}

// Password update types
export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type UpdatePasswordResponse = {
  success?: boolean;
  message?: string;
  error?: string;
}


export interface Script {
  id: string;
  projectName: string;
  language: string;
  content: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadMode: string;
  audioFileName?: string;
  audioFileSize?: number;
  audioFileUrl?: string;
  audioGenerated: boolean;
  voiceModelId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalScripts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ScriptsResponse {
  success: boolean;
  data: {
    scripts: Script[];
    pagination: PaginationData;
  };
}
export interface GetScriptsParams {
  page?: number;
  limit?: number;
  search?: string;
  language?: string;
  sortBy?: 'createdAt' | 'projectName';
  sortOrder?: 'asc' | 'desc';
}



export interface CreateContactMessageData {
  name: string
  email: string
  message: string
}

export interface CreateContactMessageResponse {
  success?: boolean
  message?: string
  error?: string
  data?: {
    id: string
    name: string
    email: string
    message: string
    createdAt: Date
  }
}