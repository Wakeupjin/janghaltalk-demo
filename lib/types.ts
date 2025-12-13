export interface AbandonedCart {
  id: number;
  customer_name: string;
  customer_phone: string;
  product_name: string;
  total_amount: number;
  monthly_payment: number;
  installment_months: number;
  added_at: string;
  notified_at: string | null;
  purchased_at: string | null;
  status: 'pending' | 'notified' | 'converted' | 'expired';
}

export interface AlimtalkLog {
  id: number;
  abandoned_cart_id: number | null;
  message_id: string | null;
  phone: string;
  message: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'failed';
  error_message: string | null;
}

export interface Conversion {
  id: number;
  abandoned_cart_id: number;
  order_id: string | null;
  payment_method: string;
  amount: number;
  installment_months: number;
  converted_at: string;
}

export interface DashboardStats {
  total_carts: number;
  abandoned_carts: number;
  abandonment_rate: number;
  alimtalk_sent: number;
  conversions: number;
  conversion_rate: number;
  final_abandonment_rate: number;
  additional_revenue: number;
}

