import React, { ReactElement } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";

export default function Calendar(): ReactElement {
  return <FullCalendar plugins={[dayGridPlugin]} />;
}
