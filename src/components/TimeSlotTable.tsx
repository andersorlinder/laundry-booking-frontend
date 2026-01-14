import React from "react";

interface TimeSlot {
  id: string;
  date: string;
  dayName: string;
  time: string;
  available: boolean;
  bookedBy?: string;
}

interface TimeSlotTableProps {
  sortedDates: string[];
  groupedSlots: Record<string, TimeSlot[]>;
  user: { email: string; id: string } | null;
  userBooking: TimeSlot | undefined;
  handleBookSlot: (slotId: string) => void;
}

const TimeSlotTable: React.FC<TimeSlotTableProps> = ({
  sortedDates,
  groupedSlots,
  user,
  userBooking,
  handleBookSlot,
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="w-full border-collapse text-xs md:text-sm">
        <thead>
          <tr className="bg-indigo-600 text-white">
            <th className="px-2 md:px-6 py-2 md:py-4 text-left font-semibold border border-gray-300">Datum</th>
            <th className="px-1 md:px-6 py-2 md:py-4 text-center font-semibold border border-gray-300 text-xs md:text-base">
              07:00-12:00
            </th>
            <th className="px-1 md:px-6 py-2 md:py-4 text-center font-semibold border border-gray-300 text-xs md:text-base">
              12:00-17:00
            </th>
            <th className="px-1 md:px-6 py-2 md:py-4 text-center font-semibold border border-gray-300 text-xs md:text-base">
              17:00-22:00
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((date) => {
            const dateObj = new Date(date);
            const dayNameFull = dateObj.toLocaleDateString("sv-SE", { weekday: "long" });
            const dayName = dayNameFull.charAt(0).toUpperCase() + dayNameFull.slice(1);
            const displayDate = dateObj.toLocaleDateString("sv-SE", { day: "numeric", month: "long" });
            const slotsForDate = groupedSlots[date] || [];

            const isSunday = dateObj.getDay() === 0;
            const borderClass = isSunday ? "border-b-4 border-b-indigo-600" : "border-b border-gray-300";

            return (
              <tr key={date} className={`hover:bg-gray-50 ${borderClass}`}>
                <td className="px-2 md:px-6 py-2 md:py-4 font-semibold text-gray-800 border border-gray-300 text-xs md:text-sm">
                  <div className="truncate">{dayName}</div>
                  <div className="text-xs text-gray-600">{displayDate}</div>
                </td>
                {["07:00 - 12:00", "12:00 - 17:00", "17:00 - 22:00"].map((timeSlot) => {
                  const slot = slotsForDate.find((s) => s.time === timeSlot);

                  if (!slot) {
                    return <td key={timeSlot} className="px-1 md:px-6 py-2 md:py-4 border border-gray-300"></td>;
                  }

                  const isUserBooking = slot.bookedBy === user?.email;
                  const isOtherBooking = !slot.available && !isUserBooking;
                  const isDisabled = userBooking && !isUserBooking;

                  return (
                    <td key={slot.id} className="px-1 md:px-6 py-2 md:py-4 border border-gray-300">
                      <button
                        type="button"
                        onClick={() => handleBookSlot(slot.id)}
                        disabled={isDisabled}
                        title={
                          isUserBooking
                            ? "Klicka för att avboka"
                            : isOtherBooking
                              ? `Bokad av ${slot.bookedBy}`
                              : userBooking
                                ? "Du har redan en bokning. Avboka den för att boka en annan."
                                : "Klicka för att boka"
                        }
                        className={`w-full px-2 md:px-4 py-2 md:py-3 rounded-md text-xs md:text-sm font-medium transition-all ${
                          isUserBooking
                            ? "border-2 border-blue-500 bg-blue-100 text-blue-900 cursor-pointer hover:bg-blue-200"
                            : isOtherBooking
                              ? "border-2 border-red-400 bg-red-50 text-red-800 cursor-not-allowed opacity-70"
                              : userBooking
                                ? "border-2 border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed opacity-50"
                                : "border-2 border-green-400 bg-green-50 text-green-800 hover:border-indigo-500 hover:bg-blue-50 cursor-pointer"
                        }`}
                      >
                        {isUserBooking ? "✓ Din bokning" : isOtherBooking ? "Bokad" : "Ledig"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TimeSlotTable;
