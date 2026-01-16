import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LaundryRulesAccordion from "../components/LaundryRulesAccordion";
import TimeSlotTable from "../components/TimeSlotTable";
import { useAuth } from "../context/AuthContext";
import {
  bookTimeSlot,
  fetchBookedSlots,
  getBookedSlotMap,
  getBookedSlotDetails,
  unbookTimeSlot,
} from "../services/bookingService";

interface TimeSlot {
  id: string;
  date: string; // Format: YYYY-MM-DD
  dayName: string; // Monday, Tuesday, etc.
  time: string;
  available: boolean;
  bookedBy?: string;
  bookingId?: number; // The actual booking ID from the database
}

// Generate 28 days of time slots starting from today
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startDate = new Date(); // Current date
  const times = ["07:00 - 12:00", "12:00 - 17:00", "17:00 - 22:00"];
  const dayNames = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];

  let slotId = 1;
  for (let i = 0; i < 28; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    const dateString = currentDate.toISOString().split("T")[0];
    const dayName = dayNames[currentDate.getDay()];

    times.forEach((time) => {
      slots.push({
        id: slotId.toString(),
        date: dateString,
        dayName,
        time,
        available: true,
      });
      slotId++;
    });
  }

  return slots;
};

const BookingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  // Fetch booked slots from API when component mounts
  useEffect(() => {
    const fetchAndUpdateBookedSlots = async () => {
      try {
        const startDate = new Date();
        const dateString = startDate.toISOString().split("T")[0];

        const data = await fetchBookedSlots(dateString, 28);
        const bookedMap = getBookedSlotMap(data);
        const bookedDetails = getBookedSlotDetails(data);

        // Update time slots with booking information
        const updatedSlots = generateTimeSlots().map((slot) => {
          const timeSlotNumber = ["07:00 - 12:00", "12:00 - 17:00", "17:00 - 22:00"].indexOf(slot.time) + 1;

          if (bookedMap.has(slot.date) && bookedMap.get(slot.date)?.has(timeSlotNumber)) {
            const bookedSlot = bookedDetails.get(slot.date)?.get(timeSlotNumber);
            const isUserBooking = bookedSlot?.userId === user?.id;

            return {
              ...slot,
              available: false,
              bookedBy: isUserBooking ? user?.email : "other_user",
              bookingId: bookedSlot?.id,
            };
          }

          return slot;
        });

        setTimeSlots(updatedSlots);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };

    fetchAndUpdateBookedSlots();
  }, []);

  // Find the user's current booking
  const userBooking = timeSlots.find((s) => s.bookedBy === user?.email);

  const handleBookSlot = async (slotId: string) => {
    const slot = timeSlots.find((s) => s.id === slotId);

    // If clicking on their own booking, unbook it
    if (slot && slot.bookedBy === user?.email) {
      try {
        if (!slot.bookingId) {
          throw new Error("Booking ID not found");
        }
        await unbookTimeSlot(slot.bookingId);

        // Update the UI
        const updatedSlots = timeSlots.map((s) =>
          s.id === slotId ? { ...s, available: true, bookedBy: undefined, bookingId: undefined } : s
        );
        setTimeSlots(updatedSlots);
      } catch (error) {
        console.error("Error unbooking time slot:", error);
        alert(error instanceof Error ? error.message : "Failed to unbook time slot. Please try again.");
      }
      return;
    }

    // If they already have a booking, don't allow a new one
    if (userBooking) {
      return;
    }

    // Book the slot if available
    if (slot?.available) {
      try {
        // Determine the time slot number (1, 2, or 3)
        const times = ["07:00 - 12:00", "12:00 - 17:00", "17:00 - 22:00"];
        const timeSlotNumber = times.indexOf(slot.time) + 1;

        // Call the booking API
        const bookingResponse = await bookTimeSlot(slot.date, timeSlotNumber);

        // Update the UI with the booking ID from the response
        const updatedSlots = timeSlots.map((s) =>
          s.id === slotId ? { ...s, available: false, bookedBy: user?.email, bookingId: bookingResponse.id } : s
        );
        setTimeSlots(updatedSlots);
      } catch (error) {
        console.error("Error booking time slot:", error);
        alert(error instanceof Error ? error.message : "Failed to book time slot. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const groupedSlots = timeSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, TimeSlot[]>
  );

  // Sort dates in chronological order
  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 md:px-8 py-3 md:py-5 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="header-content">
          <h1 className="text-xl md:text-3xl font-semibold mb-1">Tvättidsbooking</h1>
          <p className="text-xs md:text-sm opacity-90 truncate">Välkommen, {user?.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-3 md:px-5 py-2 bg-white bg-opacity-40 text-indigo-700 border-2 border-white rounded-md text-xs md:text-sm font-semibold transition-all hover:bg-opacity-60 whitespace-nowrap"
        >
          Logga ut
        </button>
      </header>

      <div className="px-4 md:px-8 py-4 md:py-8 max-w-7xl mx-auto w-full">
        <LaundryRulesAccordion />

        <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-4 md:mb-8">Tillgängliga tider</h2>

        <div className="bg-white rounded-lg p-3 md:p-4 shadow-md flex flex-col gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-3 text-xs md:text-sm text-gray-700">
            <div className="w-4 md:w-5 h-4 md:h-5 rounded border-2 border-green-400 bg-green-50"></div>
            <span>Tillgänglig</span>
          </div>
          <div className="flex items-center gap-3 text-xs md:text-sm text-gray-700">
            <div className="w-4 md:w-5 h-4 md:h-5 rounded border-2 border-blue-500 bg-blue-100"></div>
            <span>Din bokning</span>
          </div>
          <div className="flex items-center gap-3 text-xs md:text-sm text-gray-700">
            <div className="w-4 md:w-5 h-4 md:h-5 rounded border-2 border-red-400 bg-red-50"></div>
            <span>Bokad av andra</span>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <TimeSlotTable
            sortedDates={sortedDates}
            groupedSlots={groupedSlots}
            user={user}
            userBooking={userBooking}
            handleBookSlot={handleBookSlot}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
