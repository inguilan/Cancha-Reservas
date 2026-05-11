export type UserRole = "USER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Court {
  id: number;
  name: string;
  court_type: string;
  price_per_hour: string;
  location: string;
  image?: string;
  status: "AVAILABLE" | "MAINTENANCE" | "OCCUPIED";
  opening_time: string;
  closing_time: string;
  available_weekdays: number[];
}

export interface Reservation {
  id: number;
  user: number;
  user_name: string;
  court: number;
  court_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "PENDING" | "CONFIRMED" | "CANCELED" | "FINISHED";
  total_price: string;
  notes?: string;
}

export interface DashboardStats {
  total_reservations: number;
  confirmed_income: number;
  registered_users: number;
  top_courts: Array<{ court__name: string; total: number }>;
  status_breakdown: Array<{ status: string; total: number }>;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
