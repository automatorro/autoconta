export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          category: string
          created_at: string
          currency: string
          date: string
          description: string
          document_number: string
          file_path: string
          id: string
          net_amount: number
          ocr_confidence: number | null
          ocr_corrections: Json | null
          ocr_extracted_amount: number | null
          ocr_extracted_cif: string | null
          ocr_extracted_date: string | null
          ocr_extracted_supplier: string | null
          ocr_extracted_text: string | null
          reconciled: boolean
          supplier_address: string | null
          supplier_cif: string
          supplier_name: string
          total_amount: number
          type: string
          updated_at: string
          user_id: string
          vat_amount: number
          vat_rate: number
          vehicle_id: string | null
          verified: boolean
        }
        Insert: {
          category: string
          created_at?: string
          currency?: string
          date: string
          description: string
          document_number: string
          file_path: string
          id?: string
          net_amount?: number
          ocr_confidence?: number | null
          ocr_corrections?: Json | null
          ocr_extracted_amount?: number | null
          ocr_extracted_cif?: string | null
          ocr_extracted_date?: string | null
          ocr_extracted_supplier?: string | null
          ocr_extracted_text?: string | null
          reconciled?: boolean
          supplier_address?: string | null
          supplier_cif: string
          supplier_name: string
          total_amount?: number
          type: string
          updated_at?: string
          user_id: string
          vat_amount?: number
          vat_rate?: number
          vehicle_id?: string | null
          verified?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string
          document_number?: string
          file_path?: string
          id?: string
          net_amount?: number
          ocr_confidence?: number | null
          ocr_corrections?: Json | null
          ocr_extracted_amount?: number | null
          ocr_extracted_cif?: string | null
          ocr_extracted_date?: string | null
          ocr_extracted_supplier?: string | null
          ocr_extracted_text?: string | null
          reconciled?: boolean
          supplier_address?: string | null
          supplier_cif?: string
          supplier_name?: string
          total_amount?: number
          type?: string
          updated_at?: string
          user_id?: string
          vat_amount?: number
          vat_rate?: number
          vehicle_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      drivers: {
        Row: {
          cnp: string
          contract_type: string | null
          created_at: string
          email: string | null
          hire_date: string | null
          id: string
          license_category: string
          license_expiry_date: string
          license_number: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cnp: string
          contract_type?: string | null
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          license_category: string
          license_expiry_date: string
          license_number: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cnp?: string
          contract_type?: string | null
          created_at?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          license_category?: string
          license_expiry_date?: string
          license_number?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address_city: string | null
          address_county: string | null
          address_postal_code: string | null
          address_street: string | null
          cif: string | null
          cnp: string | null
          company_name: string | null
          company_type: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          setup_completed: boolean
          updated_at: string
          user_id: string
          vat_intra_community: string
          vat_payer: boolean | null
        }
        Insert: {
          address_city?: string | null
          address_county?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          cif?: string | null
          cnp?: string | null
          company_name?: string | null
          company_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          setup_completed?: boolean
          updated_at?: string
          user_id: string
          vat_intra_community?: string
          vat_payer?: boolean | null
        }
        Update: {
          address_city?: string | null
          address_county?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          cif?: string | null
          cnp?: string | null
          company_name?: string | null
          company_type?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          setup_completed?: boolean
          updated_at?: string
          user_id?: string
          vat_intra_community?: string
          vat_payer?: boolean | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          acquisition_date: string | null
          acquisition_price: number | null
          co2_emissions: number | null
          created_at: string
          depreciation_method: string | null
          engine_capacity: number | null
          fuel_type: string
          id: string
          license_plate: string
          make: string
          model: string
          power_kw: number | null
          updated_at: string
          useful_life_years: number | null
          user_id: string
          vin: string | null
          year: number
        }
        Insert: {
          acquisition_date?: string | null
          acquisition_price?: number | null
          co2_emissions?: number | null
          created_at?: string
          depreciation_method?: string | null
          engine_capacity?: number | null
          fuel_type: string
          id?: string
          license_plate: string
          make: string
          model: string
          power_kw?: number | null
          updated_at?: string
          useful_life_years?: number | null
          user_id: string
          vin?: string | null
          year: number
        }
        Update: {
          acquisition_date?: string | null
          acquisition_price?: number | null
          co2_emissions?: number | null
          created_at?: string
          depreciation_method?: string | null
          engine_capacity?: number | null
          fuel_type?: string
          id?: string
          license_plate?: string
          make?: string
          model?: string
          power_kw?: number | null
          updated_at?: string
          useful_life_years?: number | null
          user_id?: string
          vin?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
