import { api } from "@/lib/api";
import { Court, DashboardStats, Paginated, Reservation, User } from "@/types";

export const authService = {
  register: (payload: Record<string, string>) => api.post("/auth/register/", payload),
  login: (payload: { username: string; password: string }) => api.post("/auth/login/", payload),
  me: async () => (await api.get<User>("/users/me/")).data,
  updateProfile: async (payload: Partial<User>) => (await api.patch<User>("/users/me/", payload)).data,
};

export const courtService = {
  list: async () => (await api.get<Paginated<Court>>("/courts/")).data,
  availableSlots: async (courtId: number, date: string) =>
    (await api.get<{ date: string; court_id: number; court_name: string; opening_time: string; closing_time: string; price_per_hour: string; slots: Array<{ start_time: string; end_time: string; available: boolean }> }>(`/courts/${courtId}/available_slots/`, { params: { date } })).data,
  create: async (payload: Partial<Court>) => (await api.post<Court>("/courts/", payload)).data,
  update: async (id: number, payload: Partial<Court>) => (await api.patch<Court>(`/courts/${id}/`, payload)).data,
  remove: async (id: number) => api.delete(`/courts/${id}/`),
};

export const reservationService = {
  list: async (params?: Record<string, string>) => (await api.get<Paginated<Reservation>>("/reservations/", { params })).data,
  create: async (payload: Partial<Reservation>) => (await api.post<Reservation>("/reservations/", payload)).data,
  confirm: async (id: number) => (await api.post<Reservation>(`/reservations/${id}/confirm/`)).data,
  finish: async (id: number) => (await api.post<Reservation>(`/reservations/${id}/finish/`)).data,
  cancel: async (id: number) => (await api.post<Reservation>(`/reservations/${id}/cancel/`)).data,
};

export const dashboardService = {
  stats: async () => (await api.get<DashboardStats>("/dashboard/")).data,
};
