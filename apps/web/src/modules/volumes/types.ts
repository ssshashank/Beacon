export interface VolumeDTO {
  name: string;
  driver: string;
  mountpoint: string;
  created_at?: string;
  scope: string;
  labels: Record<string, string>;
  options?: Record<string, string>;
  size?: number;
  ref_count?: number;
}

export interface VolumeInspectDTO {
  Name: string;
  Driver: string;
  Mountpoint: string;
  CreatedAt?: string;
  Scope: string;
  Labels?: Record<string, string>;
  Options?: Record<string, string>;
  UsageData?: {
    Size?: number;
    RefCount?: number;
  };
  Status?: Record<string, any>;
}
