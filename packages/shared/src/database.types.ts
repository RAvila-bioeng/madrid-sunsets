export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      days: {
        Row: {
          best_photo_id: string | null;
          created_at: string;
          date: string;
          note: string | null;
          sunset_at: string;
          updated_at: string;
          weather_summary: Json | null;
        };
        Insert: {
          best_photo_id?: string | null;
          created_at?: string;
          date: string;
          note?: string | null;
          sunset_at: string;
          updated_at?: string;
          weather_summary?: Json | null;
        };
        Update: {
          best_photo_id?: string | null;
          created_at?: string;
          date?: string;
          note?: string | null;
          sunset_at?: string;
          updated_at?: string;
          weather_summary?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'days_best_photo_id_fkey';
            columns: ['best_photo_id'];
            isOneToOne: false;
            referencedRelation: 'photos';
            referencedColumns: ['id'];
          },
        ];
      };
      live_requests: {
        Row: {
          id: string;
          latency_ms: number | null;
          photo_id: string | null;
          requested_at: string;
          status: Database['public']['Enums']['live_request_status'];
        };
        Insert: {
          id?: string;
          latency_ms?: number | null;
          photo_id?: string | null;
          requested_at?: string;
          status?: Database['public']['Enums']['live_request_status'];
        };
        Update: {
          id?: string;
          latency_ms?: number | null;
          photo_id?: string | null;
          requested_at?: string;
          status?: Database['public']['Enums']['live_request_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'live_requests_photo_id_fkey';
            columns: ['photo_id'];
            isOneToOne: false;
            referencedRelation: 'photos';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          channel: Database['public']['Enums']['notification_channel'];
          created_at: string;
          day_date: string;
          error: string | null;
          id: string;
          photo_id: string;
          sent_at: string | null;
          status: Database['public']['Enums']['notification_status'];
        };
        Insert: {
          channel: Database['public']['Enums']['notification_channel'];
          created_at?: string;
          day_date: string;
          error?: string | null;
          id?: string;
          photo_id: string;
          sent_at?: string | null;
          status?: Database['public']['Enums']['notification_status'];
        };
        Update: {
          channel?: Database['public']['Enums']['notification_channel'];
          created_at?: string;
          day_date?: string;
          error?: string | null;
          id?: string;
          photo_id?: string;
          sent_at?: string | null;
          status?: Database['public']['Enums']['notification_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_day_date_fkey';
            columns: ['day_date'];
            isOneToOne: false;
            referencedRelation: 'days';
            referencedColumns: ['date'];
          },
          {
            foreignKeyName: 'notifications_photo_id_fkey';
            columns: ['photo_id'];
            isOneToOne: false;
            referencedRelation: 'photos';
            referencedColumns: ['id'];
          },
        ];
      };
      photos: {
        Row: {
          captured_at: string;
          created_at: string;
          day_date: string;
          exif: Json | null;
          height: number;
          id: string;
          is_best_of_day: boolean;
          score: number;
          score_components: Json;
          storage_path: string;
          width: number;
        };
        Insert: {
          captured_at: string;
          created_at?: string;
          day_date: string;
          exif?: Json | null;
          height: number;
          id?: string;
          is_best_of_day?: boolean;
          score: number;
          score_components?: Json;
          storage_path: string;
          width: number;
        };
        Update: {
          captured_at?: string;
          created_at?: string;
          day_date?: string;
          exif?: Json | null;
          height?: number;
          id?: string;
          is_best_of_day?: boolean;
          score?: number;
          score_components?: Json;
          storage_path?: string;
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'photos_day_date_fkey';
            columns: ['day_date'];
            isOneToOne: false;
            referencedRelation: 'days';
            referencedColumns: ['date'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      live_request_status: 'pending' | 'completed' | 'failed';
      notification_channel: 'telegram' | 'email';
      notification_status: 'pending' | 'sent' | 'failed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      live_request_status: ['pending', 'completed', 'failed'],
      notification_channel: ['telegram', 'email'],
      notification_status: ['pending', 'sent', 'failed'],
    },
  },
} as const;
