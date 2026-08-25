// account/types.ts — shared types for the client account feature

export interface OrderedProduct {
  name:         string;
  product_type: string;
  category:     string;
  ref:          string;
  size:         string;
  quantity:     number;
  price:        number;
  available:    boolean;
  product_id:   number;
}

export interface Order {
  order_id:       string;
  date:           string | null;
  amount:         number;
  currency:       string;
  is_paid:        "pending" | "confirmed" | "failed" | "cod";
  status:         boolean;
  delivered:      boolean;
  payment_mode:   "online" | "cod";
  transaction_id: string | null;
  products:       OrderedProduct[];
}

export interface EditableProfile {
  first_name: string;
  last_name:  string;
  phone:      string;
  address:    string;
  city:       string;
  country:    string;
  
}