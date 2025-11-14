// Database types generated from Supabase schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: 'customer' | 'admin' | 'delivery_partner';
          address: UserAddress | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email: string;
          phone?: string | null;
          role?: 'customer' | 'admin' | 'delivery_partner';
          address?: UserAddress | null;
          is_active?: boolean;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          address?: UserAddress | null;
          is_active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          cost_price: number | null;
          stock: number;
          category: string;
          status: 'active' | 'inactive' | 'coming_soon';
          images: string[];
          sku: string | null;
          weight: string | null;
          unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          price: number;
          cost_price?: number | null;
          stock?: number;
          category?: string;
          status?: 'active' | 'inactive' | 'coming_soon';
          images?: string[];
          sku?: string | null;
          weight?: string | null;
          unit?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          price?: number;
          cost_price?: number | null;
          stock?: number;
          category?: string;
          status?: 'active' | 'inactive' | 'coming_soon';
          images?: string[];
          sku?: string | null;
          weight?: string | null;
          unit?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          status: OrderStatus;
          payment_status: PaymentStatus;
          payment_method: string;
          address: OrderAddress;
          delivery_partner_id: string | null;
          notes: string | null;
          order_date: string;
          delivery_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_amount: number;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          payment_method?: string;
          address: OrderAddress;
          delivery_partner_id?: string | null;
          notes?: string | null;
          order_date?: string;
          delivery_date?: string | null;
        };
        Update: {
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          delivery_partner_id?: string | null;
          notes?: string | null;
          delivery_date?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          product_name: string;
          created_at: string;
        };
        Insert: {
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          product_name: string;
        };
        Update: {
          quantity?: number;
          price?: number;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          quantity: number;
        };
        Update: {
          quantity?: number;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: any;
          description?: string | null;
        };
        Update: {
          value?: any;
          description?: string | null;
        };
      };
    };
  };
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OrderAddress {
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}
