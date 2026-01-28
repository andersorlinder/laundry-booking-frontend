import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LaundryRulesAccordion from "../components/LaundryRulesAccordion";
import TimeSlotTable from "../components/TimeSlotTable";
import { useAuth } from "../context/AuthContext";
import {
  bookTimeSlot,
  fetchBookedSlots,
  getBookedSlotDetails,
  getBookedSlotMap,
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
  apartmentNumber?: string;
  started?: boolean; // Whether the time slot has already started
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

          // Check if the time slot has started
          const slotDateTime = new Date(slot.date);
          const timeSlotIndex = ["07:00 - 12:00", "12:00 - 17:00", "17:00 - 22:00"].indexOf(slot.time);
          if (timeSlotIndex === 0) {
            slotDateTime.setHours(7, 0, 0, 0);
          } else if (timeSlotIndex === 1) {
            slotDateTime.setHours(12, 0, 0, 0);
          } else if (timeSlotIndex === 2) {
            slotDateTime.setHours(17, 0, 0, 0);
          }
          const now = new Date();
          const hasStarted = now >= slotDateTime;

          if (bookedMap.has(slot.date) && bookedMap.get(slot.date)?.has(timeSlotNumber)) {
            const bookedSlot = bookedDetails.get(slot.date)?.get(timeSlotNumber);
            const isUserBooking = bookedSlot?.userId === user?.id;

            return {
              ...slot,
              available: false,
              bookedBy: isUserBooking ? user?.apartmentNumber : "other_user",
              bookingId: bookedSlot?.id,
              apartmentNumber: bookedSlot?.apartmentNumber,
              started: hasStarted,
            };
          }

          return {
            ...slot,
            started: hasStarted,
          };
        });

        setTimeSlots(updatedSlots);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };

    fetchAndUpdateBookedSlots();
  }, [user?.apartmentNumber, user?.id]);

  // Find all the user's bookings
  const userBookings = timeSlots.filter((s) => s.bookedBy === user?.apartmentNumber);

  // Find the most relevant booking (prioritize future bookings)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureBookings = userBookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate > today;
  });

  const userBooking = futureBookings.length > 0 ? futureBookings[0] : userBookings[0];
  const hasFutureBooking = futureBookings.length > 0;

  const handleBookSlot = async (slotId: string) => {
    const slot = timeSlots.find((s) => s.id === slotId);

    // If clicking on their own booking, unbook it
    if (slot && slot.bookedBy === user?.apartmentNumber) {
      // Check if the time slot has already started
      const slotDateTime = new Date(slot.date);
      const times = ["07:00 - 12:00", "12:00 - 17:00", "17:00 - 22:00"];
      const timeSlotIndex = times.indexOf(slot.time);

      // Set the start time based on the slot
      if (timeSlotIndex === 0) {
        slotDateTime.setHours(7, 0, 0, 0); // 07:00
      } else if (timeSlotIndex === 1) {
        slotDateTime.setHours(12, 0, 0, 0); // 12:00
      } else if (timeSlotIndex === 2) {
        slotDateTime.setHours(17, 0, 0, 0); // 17:00
      }

      const now = new Date();

      if (now >= slotDateTime) {
        alert("Du kan inte avboka en tid som redan har börjat.");
        return;
      }

      try {
        if (!slot.bookingId) {
          throw new Error("Booking ID not found");
        }
        await unbookTimeSlot(slot.bookingId);

        // Update the UI
        const updatedSlots = timeSlots.map((s) =>
          s.id === slotId
            ? { ...s, available: true, bookedBy: undefined, bookingId: undefined, apartmentNumber: undefined }
            : s
        );
        setTimeSlots(updatedSlots);
      } catch (error) {
        console.error("Error unbooking time slot:", error);
        alert(error instanceof Error ? error.message : "Failed to unbook time slot. Please try again.");
      }
      return;
    }

    // If they already have a booking, check if any are in the future
    if (userBookings.length > 0) {
      // If user has a future booking, don't allow another one
      if (hasFutureBooking) {
        alert("Du har redan en framtida bokning. Avboka den först för att boka en ny tid.");
        return;
      }

      // User has booking(s) from today or earlier, allow booking from tomorrow onwards
      const slotDate = new Date(slot?.date || "");
      slotDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (slotDate < tomorrow) {
        alert("Du har redan en bokning idag eller tidigare. Du kan endast boka från och med imorgon.");
        return;
      }
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
          s.id === slotId
            ? {
                ...s,
                available: false,
                bookedBy: user?.apartmentNumber,
                bookingId: bookingResponse.id,
                apartmentNumber: user?.apartmentNumber,
              }
            : s
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
          <h1 className="text-xl md:text-3xl font-semibold mb-1">Tvättidsbokning</h1>
          <p className="text-xs md:text-sm opacity-90 truncate">Välkommen {user?.forename}</p>
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
