// Ejemplos de uso del CalendarGrid personalizado

import { useState } from "react";
import {
  CalendarProvider,
  CalendarDate,
  CalendarDatePicker,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePagination,
  CalendarHeader,
  CalendarBody,
  CalendarDayContent,
  CalendarDayButton,
  CalendarDayBadge,
  type CalendarDayData,
  type Feature,
} from "./CalendarGrid";

// Ejemplo 1: Calendario básico con contenido personalizado en cada día
export const BasicCustomCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDayClick = (dayData: CalendarDayData) => {
    setSelectedDate(dayData.date);
    console.log("Día seleccionado:", dayData);
  };

  return (
    <CalendarProvider
      locale="es-ES"
      startDay={1}
      className="w-full h-96 border rounded-lg"
    >
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker start={2020} end={2030} />
        </CalendarDatePicker>
        <CalendarDatePagination />
      </CalendarDate>

      <CalendarHeader />

      <CalendarBody
        onDayClick={handleDayClick}
        renderDay={({ dayData, onClick }) => (
          <div
            className={`relative h-full w-full p-2 cursor-pointer hover:bg-blue-50 transition-colors ${
              selectedDate?.toDateString() === dayData.date.toDateString()
                ? "bg-blue-100 border-2 border-blue-300"
                : ""
            } ${!dayData.isCurrentMonth ? "opacity-50 bg-gray-50" : ""}`}
            onClick={() => onClick?.(dayData)}
          >
            <div className="font-medium text-sm">{dayData.day}</div>

            {/* Contenido personalizado para días específicos */}
            {dayData.day === 15 && dayData.isCurrentMonth && (
              <CalendarDayContent className="mt-1 bg-green-100 text-green-800">
                📅 Reunión
              </CalendarDayContent>
            )}

            {dayData.day === 20 && dayData.isCurrentMonth && (
              <CalendarDayBadge color="#ff6b6b" className="mt-1">
                🎉 Evento
              </CalendarDayBadge>
            )}
          </div>
        )}
      />
    </CalendarProvider>
  );
};

// Ejemplo 2: Calendario con botones interactivos
export const InteractiveButtonCalendar = () => {
  const [events, setEvents] = useState<{ [key: string]: string[] }>({});

  const handleAddEvent = (dayData: CalendarDayData) => {
    const dateKey = dayData.date.toDateString();
    const eventName = prompt("Nombre del evento:");
    if (eventName) {
      setEvents((prev) => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), eventName],
      }));
    }
  };

  return (
    <CalendarProvider
      locale="es-ES"
      startDay={1}
      className="w-full h-96 border rounded-lg"
    >
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker start={2020} end={2030} />
        </CalendarDatePicker>
        <CalendarDatePagination />
      </CalendarDate>

      <CalendarHeader />

      <CalendarBody
        renderDay={({ dayData }) => {
          const dateKey = dayData.date.toDateString();
          const dayEvents = events[dateKey] || [];

          return (
            <div
              className={`relative h-full w-full p-1 ${
                !dayData.isCurrentMonth ? "opacity-50 bg-gray-50" : ""
              }`}
            >
              <div className="font-medium text-xs mb-1">{dayData.day}</div>

              {dayData.isCurrentMonth && (
                <>
                  <CalendarDayButton
                    variant="outline"
                    onClick={() => handleAddEvent(dayData)}
                    className="mb-1 text-xs"
                  >
                    + Agregar
                  </CalendarDayButton>

                  {dayEvents.map((event, index) => (
                    <CalendarDayContent
                      key={index}
                      className="mb-1 bg-purple-100 text-purple-800"
                      onClick={() => alert(`Evento: ${event}`)}
                    >
                      {event}
                    </CalendarDayContent>
                  ))}
                </>
              )}
            </div>
          );
        }}
      />
    </CalendarProvider>
  );
};

// Ejemplo 3: Calendario de agenda profesional
export const AgendaCalendar = () => {
  const [appointments] = useState<{
    [key: string]: Array<{ time: string; client: string; type: string }>;
  }>({
    [new Date(2024, new Date().getMonth(), 15).toDateString()]: [
      { time: "09:00", client: "Cliente A", type: "consulta" },
      { time: "14:00", client: "Cliente B", type: "reunion" },
    ],
    [new Date(2024, new Date().getMonth(), 22).toDateString()]: [
      { time: "10:30", client: "Cliente C", type: "presentacion" },
    ],
  });

  const openModal = (dayData: CalendarDayData) => {
    // Aquí podrías abrir un modal para gestionar citas
    console.log("Abrir modal para:", dayData.date);
    alert(
      `Modal para gestionar citas del ${dayData.date.toLocaleDateString()}`
    );
  };

  return (
    <CalendarProvider
      locale="es-ES"
      startDay={1}
      className="w-full h-96 border rounded-lg bg-white"
    >
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker start={2020} end={2030} />
        </CalendarDatePicker>
        <CalendarDatePagination />
      </CalendarDate>

      <CalendarHeader />

      <CalendarBody
        onDayClick={openModal}
        renderDay={({ dayData, onClick }) => {
          const dateKey = dayData.date.toDateString();
          const dayAppointments = appointments[dateKey] || [];
          const isToday =
            dayData.date.toDateString() === new Date().toDateString();

          return (
            <div
              className={`relative h-full w-full p-1 cursor-pointer border-l-2 transition-all hover:bg-gray-50 ${
                isToday
                  ? "border-l-blue-500 bg-blue-50"
                  : "border-l-transparent"
              } ${!dayData.isCurrentMonth ? "opacity-50 bg-gray-50" : ""}`}
              onClick={() => onClick?.(dayData)}
            >
              <div
                className={`font-medium text-xs mb-1 ${
                  isToday ? "text-blue-700" : ""
                }`}
              >
                {dayData.day}
                {isToday && <span className="ml-1 text-blue-500">•</span>}
              </div>

              {dayData.isCurrentMonth &&
                dayAppointments.map((apt, index) => (
                  <CalendarDayContent
                    key={index}
                    className={`mb-1 text-xs ${
                      apt.type === "consulta"
                        ? "bg-green-100 text-green-800"
                        : apt.type === "reunion"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   alert(`Cita: ${apt.time} - ${apt.client}`);
                    // }}
                  >
                    <div className="truncate">{apt.time}</div>
                    <div className="truncate text-xs opacity-75">
                      {apt.client}
                    </div>
                  </CalendarDayContent>
                ))}

              {dayData.isCurrentMonth && dayAppointments.length === 0 && (
                <div className="text-xs text-gray-400 italic">Sin citas</div>
              )}
            </div>
          );
        }}
      />
    </CalendarProvider>
  );
};

// Ejemplo 4: Calendario con features usando children
export const FeaturesCalendar = () => {
  const features: Feature[] = [
    {
      id: "1",
      name: "Proyecto Alpha",
      startAt: new Date(2024, new Date().getMonth(), 10),
      endAt: new Date(2024, new Date().getMonth(), 15),
      status: { id: "1", name: "En progreso", color: "#3b82f6" },
    },
    {
      id: "2",
      name: "Reunión equipo",
      startAt: new Date(2024, new Date().getMonth(), 20),
      endAt: new Date(2024, new Date().getMonth(), 20),
      status: { id: "2", name: "Programado", color: "#10b981" },
    },
  ];

  return (
    <CalendarProvider
      locale="es-ES"
      startDay={1}
      className="w-full h-96 border rounded-lg"
    >
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker start={2020} end={2030} />
        </CalendarDatePicker>
        <CalendarDatePagination />
      </CalendarDate>

      <CalendarHeader />

      <CalendarBody
        features={features}
        onDayClick={(dayData) => console.log("Día:", dayData)}
      >
        {({ feature }) => (
          <CalendarDayBadge
            color={feature.status.color}
            onClick={() => alert(`Feature: ${feature.name}`)}
            className="mb-1"
          >
            {feature.name}
          </CalendarDayBadge>
        )}
      </CalendarBody>
    </CalendarProvider>
  );
};
