import type React from "react";
import { useState } from "react";

const LaundryRulesAccordion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const rules = [
    "BOKA TVÄTTID I ALMANACKAN OCH I APPEN UNDER TESTTIDEN. ALMANACKANS TIDER GÄLLER FÖRST.",
    "INGEN NY TVÄTTID FÖRRÄN DU TVÄTTAT.",
    "MANGLING, STRYKNING, HANDTVÄTT, CENTRIFUGERING, TORKRUM OCH TORKTUMLARE FÅR ANVÄNDAS OM DET INTE ÄR ETT HINDER FÖR DE SOM BOKAT TVÄTTID.",
    "TORKRUM OCH TORKTUMLARE FÅR ANVÄNDAS MAX 1 TIMME EFTER TVÄTTIDENS SLUT. UNDER NATTETID FÅR TORKRUMMET UTAN FLÄKT ANVÄNDAS.",
    "ANVÄND INTE MASKINER ELLER FLÄKTAR NATTETID FÖR ATT RESPEKTERA GRANNARNAS NATTSÖMN.",
    "STÄDA GOLV OCH RENGÖR TVÄTTMEDELSFACK EFTER VARJE TVÄTTID.",
    "LÄMNA TVÄTTSTUGAN I ETT MINST LIKA BRA SKICK SOM NÄR DU KOM. FELANMÄL OM NÅGOT ÄR TRASIGT.",
  ];

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 md:mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <h3 className="text-base md:text-lg font-semibold">REGLER FÖR TVÄTTSTUGAN</h3>
        <span className={`text-xl transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div className="px-4 md:px-6 py-4 md:py-5">
          <ul className="space-y-3">
            {rules.map((rule, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <Order is not significant here>
              <li key={index} className="flex gap-3 text-xs md:text-sm text-gray-700">
                <span className="text-indigo-600 font-semibold flex-shrink-0">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LaundryRulesAccordion;
