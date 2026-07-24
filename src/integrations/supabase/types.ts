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
    PostgrestVersion: "14.5"
  }
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
      approval_rules: {
        Row: {
          approver_role_id: string
          company_id: string
          created_at: string
          entity_type: string
          id: string
          max_amount: number | null
          min_amount: number | null
          module: string
          sequence: number
        }
        Insert: {
          approver_role_id: string
          company_id?: string
          created_at?: string
          entity_type: string
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          module: string
          sequence?: number
        }
        Update: {
          approver_role_id?: string
          company_id?: string
          created_at?: string
          entity_type?: string
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          module?: string
          sequence?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_rules_approver_role_id_fkey"
            columns: ["approver_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_number: string | null
          bank_name: string
          company_id: string
          created_at: string
          currency_code: string
          current_balance: number
          id: string
          opening_balance: number
        }
        Insert: {
          account_number?: string | null
          bank_name: string
          company_id?: string
          created_at?: string
          currency_code?: string
          current_balance?: number
          id?: string
          opening_balance?: number
        }
        Update: {
          account_number?: string | null
          bank_name?: string
          company_id?: string
          created_at?: string
          currency_code?: string
          current_balance?: number
          id?: string
          opening_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      branches: {
        Row: {
          city: string | null
          code: string
          company_id: string
          country: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          code: string
          company_id: string
          country?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          code?: string
          company_id?: string
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          budget_amount: number
          category: string | null
          company_id: string
          cost_center_id: string
          created_at: string
          id: string
          period: string
        }
        Insert: {
          budget_amount: number
          category?: string | null
          company_id?: string
          cost_center_id: string
          created_at?: string
          id?: string
          period: string
        }
        Update: {
          budget_amount?: number
          category?: string | null
          company_id?: string
          cost_center_id?: string
          created_at?: string
          id?: string
          period?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          code: string
          created_at: string
          default_currency: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          default_currency?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          default_currency?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cost_centers: {
        Row: {
          code: string
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          company_id?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          name: string
          symbol: string
        }
        Insert: {
          code: string
          name: string
          symbol: string
        }
        Update: {
          code?: string
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          customer_type: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id?: string
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          owner_id: string
          owner_type: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          owner_id: string
          owner_type: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          owner_id?: string
          owner_type?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      domain_events: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          payload: Json
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          payload?: Json
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "domain_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          company_id: string
          created_at: string
          id: string
          license_expiry: string | null
          license_number: string | null
          name: string
          phone: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          company_id?: string
          created_at?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          name: string
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          name?: string
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          company_id: string
          id: string
          name: string
        }
        Insert: {
          company_id?: string
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
          branch_id: string | null
          business_unit: string
          category_id: string | null
          company_id: string | null
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
          supplier_id: string | null
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
          branch_id?: string | null
          business_unit: string
          category_id?: string | null
          company_id?: string | null
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
          quantity?: number
          reception_status?: string | null
          rejection_reason?: string | null
          requires_comment?: boolean | null
          status?: string | null
          status_progress?: number | null
          supplier?: string | null
          supplier_id?: string | null
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
          branch_id?: string | null
          business_unit?: string
          category_id?: string | null
          company_id?: string | null
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
          supplier_id?: string | null
          transition_allowed_roles?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          workflow_stage?: string
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "expressions_of_need_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expressions_of_need_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "item_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expressions_of_need_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expressions_of_need_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipt_items: {
        Row: {
          condition: string
          goods_receipt_id: string
          id: string
          notes: string | null
          purchase_order_item_id: string
          quantity_received: number
        }
        Insert: {
          condition?: string
          goods_receipt_id: string
          id?: string
          notes?: string | null
          purchase_order_item_id: string
          quantity_received: number
        }
        Update: {
          condition?: string
          goods_receipt_id?: string
          id?: string
          notes?: string | null
          purchase_order_item_id?: string
          quantity_received?: number
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_items_goods_receipt_id_fkey"
            columns: ["goods_receipt_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "po_receipt_status"
            referencedColumns: ["purchase_order_item_id"]
          },
          {
            foreignKeyName: "goods_receipt_items_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          company_id: string
          created_at: string
          grn_number: string | null
          id: string
          notes: string | null
          purchase_order_id: string
          received_at: string
          received_by: string | null
          status: string
        }
        Insert: {
          company_id?: string
          created_at?: string
          grn_number?: string | null
          id?: string
          notes?: string | null
          purchase_order_id: string
          received_at?: string
          received_by?: string | null
          status?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          grn_number?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string
          received_at?: string
          received_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "po_financial_summary"
            referencedColumns: ["purchase_order_id"]
          },
          {
            foreignKeyName: "goods_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
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
      job_ledger_entries: {
        Row: {
          amount: number
          category: string
          company_id: string
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          currency_code: string
          description: string | null
          entity_id: string
          entity_type: string
          entry_type: string
          id: string
        }
        Insert: {
          amount: number
          category: string
          company_id?: string
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          description?: string | null
          entity_id: string
          entity_type: string
          entry_type: string
          id?: string
        }
        Update: {
          amount?: number
          category?: string
          company_id?: string
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          entry_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_ledger_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_ledger_entries_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_ledger_entries_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
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
      payments: {
        Row: {
          amount: number
          bank_account_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          currency_code: string
          id: string
          payment_date: string
          reference: string | null
          status: string
          supplier_invoice_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          id?: string
          payment_date?: string
          reference?: string | null
          status?: string
          supplier_invoice_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          id?: string
          payment_date?: string
          reference?: string | null
          status?: string
          supplier_invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "payments_supplier_invoice_id_fkey"
            columns: ["supplier_invoice_id"]
            isOneToOne: false
            referencedRelation: "supplier_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          description: string | null
          id: string
          key: string
          module: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          module: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          module?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch_id: string | null
          business_unit: string | null
          company_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          business_unit?: string | null
          company_id?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          business_unit?: string | null
          company_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          description: string
          id: string
          line_total: number | null
          purchase_order_id: string
          purchase_request_item_id: string | null
          quantity: number
          tax_rate: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          line_total?: number | null
          purchase_order_id: string
          purchase_request_item_id?: string | null
          quantity?: number
          tax_rate?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          line_total?: number | null
          purchase_order_id?: string
          purchase_request_item_id?: string | null
          quantity?: number
          tax_rate?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "po_financial_summary"
            referencedColumns: ["purchase_order_id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_request_item_id_fkey"
            columns: ["purchase_request_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_request_items"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          currency_code: string
          delivery_address: string | null
          expected_delivery: string | null
          expression_id: string | null
          id: string
          notes: string | null
          payment_terms: string | null
          po_number: string | null
          rfq_id: string | null
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          delivery_address?: string | null
          expected_delivery?: string | null
          expression_id?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          po_number?: string | null
          rfq_id?: string | null
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          currency_code?: string
          delivery_address?: string | null
          expected_delivery?: string | null
          expression_id?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          po_number?: string | null
          rfq_id?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "purchase_orders_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_items: {
        Row: {
          category: string | null
          created_at: string
          description: string
          estimated_unit_price: number | null
          expression_id: string
          id: string
          quantity: number
          required_date: string | null
          unit: string | null
          warehouse: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          estimated_unit_price?: number | null
          expression_id: string
          id?: string
          quantity?: number
          required_date?: string | null
          unit?: string | null
          warehouse?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          estimated_unit_price?: number | null
          expression_id?: string
          id?: string
          quantity?: number
          required_date?: string | null
          unit?: string | null
          warehouse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_items_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_responses: {
        Row: {
          currency_code: string | null
          delivery_time_days: number | null
          id: string
          is_selected: boolean
          notes: string | null
          quoted_price: number | null
          rfq_id: string
          submitted_at: string
          supplier_id: string
        }
        Insert: {
          currency_code?: string | null
          delivery_time_days?: number | null
          id?: string
          is_selected?: boolean
          notes?: string | null
          quoted_price?: number | null
          rfq_id: string
          submitted_at?: string
          supplier_id: string
        }
        Update: {
          currency_code?: string | null
          delivery_time_days?: number | null
          id?: string
          is_selected?: boolean
          notes?: string | null
          quoted_price?: number | null
          rfq_id?: string
          submitted_at?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_responses_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "rfq_responses_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_responses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_suppliers: {
        Row: {
          id: string
          invited_at: string
          rfq_id: string
          status: string
          supplier_id: string
        }
        Insert: {
          id?: string
          invited_at?: string
          rfq_id: string
          status?: string
          supplier_id: string
        }
        Update: {
          id?: string
          invited_at?: string
          rfq_id?: string
          status?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_suppliers_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          closing_date: string | null
          company_id: string
          created_at: string
          created_by: string | null
          evaluation_criteria: string | null
          expression_id: string | null
          id: string
          rfq_number: string | null
          status: string
          submission_deadline: string | null
          technical_specifications: string | null
          title: string
          updated_at: string
        }
        Insert: {
          closing_date?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          evaluation_criteria?: string | null
          expression_id?: string | null
          id?: string
          rfq_number?: string | null
          status?: string
          submission_deadline?: string | null
          technical_specifications?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          closing_date?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          evaluation_criteria?: string | null
          expression_id?: string | null
          id?: string
          rfq_number?: string | null
          status?: string
          submission_deadline?: string | null
          technical_specifications?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_expression_id_fkey"
            columns: ["expression_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
        }
        Insert: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "submission_audit_logs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "expressions_of_need"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_bank_accounts: {
        Row: {
          account_number: string | null
          bank_name: string
          created_at: string
          currency_code: string | null
          iban: string | null
          id: string
          supplier_id: string
        }
        Insert: {
          account_number?: string | null
          bank_name: string
          created_at?: string
          currency_code?: string | null
          iban?: string | null
          id?: string
          supplier_id: string
        }
        Update: {
          account_number?: string | null
          bank_name?: string
          created_at?: string
          currency_code?: string | null
          iban?: string | null
          id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_bank_accounts_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "supplier_bank_accounts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          job_title: string | null
          name: string
          phone: string | null
          supplier_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          job_title?: string | null
          name: string
          phone?: string | null
          supplier_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          job_title?: string | null
          name?: string
          phone?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_contacts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_invoices: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          created_by: string | null
          currency_code: string
          due_date: string | null
          id: string
          internal_reference: string | null
          invoice_date: string
          invoice_number: string
          notes: string | null
          purchase_order_id: string | null
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          due_date?: string | null
          id?: string
          internal_reference?: string | null
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          purchase_order_id?: string | null
          status?: string
          subtotal?: number
          supplier_id: string
          tax_amount?: number
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          due_date?: string | null
          id?: string
          internal_reference?: string | null
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          purchase_order_id?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string
          tax_amount?: number
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "supplier_invoices_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "po_financial_summary"
            referencedColumns: ["purchase_order_id"]
          },
          {
            foreignKeyName: "supplier_invoices_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          company_id: string
          country: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          risk_rating: string
          status: string
          tax_number: string | null
          trading_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          risk_rating?: string
          status?: string
          tax_number?: string | null
          trading_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          risk_rating?: string
          status?: string
          tax_number?: string | null
          trading_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_orders: {
        Row: {
          cargo_description: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivery_address: string | null
          id: string
          order_number: string | null
          pickup_location: string | null
          priority: string
          purchase_order_id: string | null
          status: string
          target_delivery_date: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          cargo_description?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          id?: string
          order_number?: string | null
          pickup_location?: string | null
          priority?: string
          purchase_order_id?: string | null
          status?: string
          target_delivery_date?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          cargo_description?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          id?: string
          order_number?: string | null
          pickup_location?: string | null
          priority?: string
          purchase_order_id?: string | null
          status?: string
          target_delivery_date?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_orders_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "po_financial_summary"
            referencedColumns: ["purchase_order_id"]
          },
          {
            foreignKeyName: "transport_orders_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          currency_code: string
          description: string | null
          id: string
          trip_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          description?: string | null
          id?: string
          trip_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          description?: string | null
          id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_expenses_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "trip_expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          created_by: string | null
          delivered_at: string | null
          driver_id: string
          id: string
          pod_notes: string | null
          started_at: string | null
          status: string
          transport_order_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          driver_id: string
          id?: string
          pod_notes?: string | null
          started_at?: string | null
          status?: string
          transport_order_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          driver_id?: string
          id?: string
          pod_notes?: string | null
          started_at?: string | null
          status?: string
          transport_order_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_transport_order_id_fkey"
            columns: ["transport_order_id"]
            isOneToOne: false
            referencedRelation: "transport_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          capacity_tons: number | null
          company_id: string
          created_at: string
          current_lat: number | null
          current_lng: number | null
          id: string
          location_updated_at: string | null
          plate_number: string
          status: string
          vehicle_type: string | null
        }
        Insert: {
          capacity_tons?: number | null
          company_id?: string
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          location_updated_at?: string | null
          plate_number: string
          status?: string
          vehicle_type?: string | null
        }
        Update: {
          capacity_tons?: number | null
          company_id?: string
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          location_updated_at?: string | null
          plate_number?: string
          status?: string
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      budget_actuals: {
        Row: {
          actual_amount: number | null
          budget_amount: number | null
          budget_id: string | null
          category: string | null
          cost_center_id: string | null
          period: string | null
        }
        Insert: {
          actual_amount?: never
          budget_amount?: number | null
          budget_id?: string | null
          category?: string | null
          cost_center_id?: string | null
          period?: string | null
        }
        Update: {
          actual_amount?: never
          budget_amount?: number | null
          budget_id?: string | null
          category?: string | null
          cost_center_id?: string | null
          period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      po_financial_summary: {
        Row: {
          invoiced_total: number | null
          ordered_total: number | null
          po_number: string | null
          purchase_order_id: string | null
          received_value: number | null
        }
        Relationships: []
      }
      po_receipt_status: {
        Row: {
          description: string | null
          purchase_order_id: string | null
          purchase_order_item_id: string | null
          quantity_ordered: number | null
          quantity_outstanding: number | null
          quantity_received: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "po_financial_summary"
            referencedColumns: ["purchase_order_id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      emit_domain_event: {
        Args: {
          p_company_id?: string
          p_created_by?: string
          p_entity_id: string
          p_entity_type: string
          p_event_type: string
          p_payload?: Json
        }
        Returns: string
      }
      has_permission: {
        Args: { p_permission_key: string; p_user_id: string }
        Returns: boolean
      }
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
    Enums: {
      workflow_stage_enum: [
        "demande",
        "en_attente",
        "approbation",
        "paiement",
        "livraison",
        "termine",
      ],
      workflow_status_enum: [
        "pending",
        "approved",
        "rejected",
        "in_progress",
        "completed",
      ],
    },
  },
} as const
