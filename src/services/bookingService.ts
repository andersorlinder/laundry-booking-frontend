export interface BookedSlot {
  id: number;
  userId: number;
  bookingDate: string;
  timeSlotNumber: number;
  createdAt: string;
}

export interface BookingsByDate {
  date: string;
  bookedSlots: BookedSlot[];
}

export interface BookedSlotsResponse {
  startDate: string;
  endDate: string;
  daysAhead: number;
  bookingsByDate: BookingsByDate[];
}

export const fetchBookedSlots = async (date: string, daysAhead: number): Promise<BookedSlotsResponse> => {
  const response = await fetch(`http://localhost:5272/api/bookings/booked?date=${date}&daysAhead=${daysAhead}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch booked slots: ${response.statusText}`);
  }

  return response.json();
};

export const getBookedSlotMap = (data: BookedSlotsResponse): Map<string, Set<number>> => {
  const bookedMap = new Map<string, Set<number>>();

  data.bookingsByDate.forEach((dayData: BookingsByDate) => {
    const dateKey = dayData.date.split("T")[0];
    if (!bookedMap.has(dateKey)) {
      bookedMap.set(dateKey, new Set());
    }
    dayData.bookedSlots.forEach((slot: BookedSlot) => {
      bookedMap.get(dateKey)?.add(slot.timeSlotNumber);
    });
  });

  return bookedMap;
};

export const getBookedSlotDetails = (data: BookedSlotsResponse): Map<string, Map<number, BookedSlot>> => {
  const bookedDetailsMap = new Map<string, Map<number, BookedSlot>>();

  data.bookingsByDate.forEach((dayData: BookingsByDate) => {
    const dateKey = dayData.date.split("T")[0];
    if (!bookedDetailsMap.has(dateKey)) {
      bookedDetailsMap.set(dateKey, new Map());
    }
    dayData.bookedSlots.forEach((slot: BookedSlot) => {
      bookedDetailsMap.get(dateKey)?.set(slot.timeSlotNumber, slot);
    });
  });

  return bookedDetailsMap;
};

export interface BookingRequest {
  bookingDate: string;
  timeSlotNumber: number;
}

export interface BookingResponse {
  id: number;
  bookingDate: string;
  timeSlotNumber: number;
  createdAt: string;
}

export const bookTimeSlot = async (bookingDate: string, timeSlotNumber: number): Promise<BookingResponse> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  const response = await fetch("http://localhost:5272/api/bookings/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bookingDate,
      timeSlotNumber,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to book time slot: ${response.statusText}`);
  }

  return response.json();
};

export const unbookTimeSlot = async (slotId: number): Promise<void> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication token not found. Please log in again.");
  }

  const response = await fetch(`http://localhost:5272/api/bookings/unbook/${slotId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to unbook time slot: ${response.statusText}`);
  }
};
