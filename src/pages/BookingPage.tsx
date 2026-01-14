import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TimeSlotTable from "../components/TimeSlotTable";
import LaundryRulesAccordion from "../components/LaundryRulesAccordion";

interface TimeSlot {
  id: string;
  date: string; // Format: YYYY-MM-DD
  dayName: string; // Monday, Tuesday, etc.
  time: string;
  available: boolean;
  bookedBy?: string;
}

const BookingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Generate 28 days of time slots starting from today
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startDate = new Date(2026, 0, 14); // January 14, 2026
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

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  // Find the user's current booking
  const userBooking = timeSlots.find((s) => s.bookedBy === user?.email);

  const handleBookSlot = (slotId: string) => {
    const slot = timeSlots.find((s) => s.id === slotId);

    // If clicking on their own booking, unbook it
    if (slot && slot.bookedBy === user?.email) {
      const updatedSlots = timeSlots.map((s) => (s.id === slotId ? { ...s, available: true, bookedBy: undefined } : s));
      setTimeSlots(updatedSlots);
      return;
    }

    // If they already have a booking, don't allow a new one
    if (userBooking) {
      return;
    }

    // Book the slot if available
    if (slot && slot.available) {
      const updatedSlots = timeSlots.map((s) =>
        s.id === slotId ? { ...s, available: false, bookedBy: user?.email } : s
      );
      setTimeSlots(updatedSlots);
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
