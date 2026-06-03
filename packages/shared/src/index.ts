import type { Database } from './database.types';

export type { Database };

export type Day = Database['public']['Tables']['days']['Row'];
export type DayInsert = Database['public']['Tables']['days']['Insert'];
export type DayUpdate = Database['public']['Tables']['days']['Update'];

export type Photo = Database['public']['Tables']['photos']['Row'];
export type PhotoInsert = Database['public']['Tables']['photos']['Insert'];
export type PhotoUpdate = Database['public']['Tables']['photos']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type LiveRequest = Database['public']['Tables']['live_requests']['Row'];
export type LiveRequestInsert = Database['public']['Tables']['live_requests']['Insert'];
export type LiveRequestUpdate = Database['public']['Tables']['live_requests']['Update'];

export type NotificationChannel = Database['public']['Enums']['notification_channel'];
export type NotificationStatus = Database['public']['Enums']['notification_status'];
export type LiveRequestStatus = Database['public']['Enums']['live_request_status'];
