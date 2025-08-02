export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCode {
  id: string;
  userId: string;
  shortCode: string;
  title?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  links?: Link[];
  _count?: {
    scans: number;
  };
}

export interface Link {
  id: string;
  qrCodeId: string;
  title: string;
  url: string;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scan {
  id: string;
  qrCodeId: string;
  userAgent?: string | null;
  ipHash?: string | null;
  referer?: string | null;
  createdAt: Date;
}