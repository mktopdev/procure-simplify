export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      approval_history: {
        Row: {
          comment: string | null
          created_at: string | null
          expression_id: string | null
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          expression_id?: string | null
          id?: string
          status: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          expression_id?: string | null
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
        ]
      }
      expression_attachments: {
        Row: {
          expression_id: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          expression_id?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          expression_id?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expression_attachments_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
        ]
      }
      expressions_of_need: {
        Row: {
          additional_comments: string | null
          approval_comments: string | null
          approval_date: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          attachment_url: string | null
          business_unit: string
          category_id: string | null
          created_at: string | null
          current_department: string
          delivery_date: string | null
          delivery_status: string | null
          department: string
          description: string | null
          finance_approval_status: string | null
          id: string
          item_type: string
          last_modified_at: string | null
          last_modified_by: string | null
          location: string
          logistics_status: string | null
          next_allowed_statuses: string[] | null
          part_name: string
          part_reference: string | null
          payment_details: Json | null
          payment_status: string | null
          priority: string
          quantity: number
          reception_status: string | null
          rejection_reason: string | null
          requires_comment: boolean | null
          status: string | null
          status_progress: number | null
          supplier: string | null
          transition_allowed_roles: string[] | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
          workflow_stage: string
          workflow_status: string
        }
        Insert: {
          additional_comments?: string | null
          approval_comments?: string | null
          approval_date?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          business_unit: string
          category_id?: string | null
          created_at?: string | null
          current_department?: string
          delivery_date?: string | null
          delivery_status?: string | null
          department: string
          description?: string | null
          finance_approval_status?: string | null
          id?: string
          item_type: string
          last_modified_at?: string | null
          last_modified_by?: string | null
          location: string
          logistics_status?: string | null
          next_allowed_statuses?: string[] | null
          part_name: string
          part_reference?: string | null
          payment_details?: Json | null
          payment_status?: string | null
          priority: string
          quantity: number
          reception_status?: string | null
          rejection_reason?: string | null
          requires_comment?: boolean | null
          status?: string | null
          status_progress?: number | null
          supplier?: string | null
          transition_allowed_roles?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          workflow_stage?: string
          workflow_status?: string
        }
        Update: {
          additional_comments?: string | null
          approval_comments?: string | null
          approval_date?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          business_unit?: string
          category_id?: string | null
          created_at?: string | null
          current_department?: string
          delivery_date?: string | null
          delivery_status?: string | null
          department?: string
          description?: string | null
          finance_approval_status?: string | null
          id?: string
          item_type?: string
          last_modified_at?: string | null
          last_modified_by?: string | null
          location?: string
          logistics_status?: string | null
          next_allowed_statuses?: string[] | null
          part_name?: string
          part_reference?: string | null
          payment_details?: Json | null
          payment_status?: string | null
          priority?: string
          quantity?: number
          reception_status?: string | null
          rejection_reason?: string | null
          requires_comment?: boolean | null
          status?: string | null
          status_progress?: number | null
          supplier?: string | null
          transition_allowed_roles?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          workflow_stage?: string
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "item_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      item_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      item_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string | null
          expression_id: string | null
          id: string
          message: string
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expression_id?: string | null
          id?: string
          message: string
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expression_id?: string | null
          id?: string
          message?: string
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_unit: string | null
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          business_unit?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          business_unit?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      submission_audit_logs: {
        Row: {
          created_at: string | null
          field_name: string
          id: string
          modified_by: string
          new_value: string | null
          old_value: string | null
          submission_id: string
        }
        Insert: {
          created_at?: string | null
          field_name: string
          id?: string
          modified_by: string
          new_value?: string | null
          old_value?: string | null
          submission_id: string
        }
        Update: {
          created_at?: string | null
          field_name?: string
          id?: string
          modified_by?: string
          new_value?: string | null
          old_value?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_submission"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_audit_logs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_history: {
        Row: {
          comments: string | null
          created_at: string | null
          expression_id: string | null
          id: string
          modified_by: string | null
          new_department: string
          new_stage: string
          new_status: string
          previous_department: string
          previous_stage: string
          previous_status: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          expression_id?: string | null
          id?: string
          modified_by?: string | null
          new_department: string
          new_stage: string
          new_status: string
          previous_department: string
          previous_stage: string
          previous_status: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          expression_id?: string | null
          id?: string
          modified_by?: string | null
          new_department?: string
          new_stage?: string
          new_status?: string
          previous_department?: string
          previous_stage?: string
          previous_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_history_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_transitions: {
        Row: {
          allowed_roles: string[]
          created_at: string | null
          current_stage: Database["public"]["Enums"]["workflow_stage_enum"]
          current_status: Database["public"]["Enums"]["workflow_status_enum"]
          id: string
          next_stage: Database["public"]["Enums"]["workflow_stage_enum"]
          next_status: Database["public"]["Enums"]["workflow_status_enum"]
          requires_comment: boolean | null
        }
        Insert: {
          allowed_roles: string[]
          created_at?: string | null
          current_stage: Database["public"]["Enums"]["workflow_stage_enum"]
          current_status: Database["public"]["Enums"]["workflow_status_enum"]
          id?: string
          next_stage: Database["public"]["Enums"]["workflow_stage_enum"]
          next_status: Database["public"]["Enums"]["workflow_status_enum"]
          requires_comment?: boolean | null
        }
        Update: {
          allowed_roles?: string[]
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["workflow_stage_enum"]
          current_status?: Database["public"]["Enums"]["workflow_status_enum"]
          id?: string
          next_stage?: Database["public"]["Enums"]["workflow_stage_enum"]
          next_status?: Database["public"]["Enums"]["workflow_status_enum"]
          requires_comment?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_workflow_transition: {
        Args: {
          p_expression_id: string
          p_new_stage: Database["public"]["Enums"]["workflow_stage_enum"]
          p_new_status: Database["public"]["Enums"]["workflow_status_enum"]
          p_user_role: string
        }
        Returns: boolean
      }
    }
    Enums: {
      workflow_stage_enum:
        | "demande"
        | "en_attente"
        | "approbation"
        | "paiement"
        | "livraison"
        | "termine"
      workflow_status_enum:
        | "pending"
        | "approved"
        | "rejected"
        | "in_progress"
        | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
