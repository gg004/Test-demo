import React, { useEffect, useState } from "react";
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar, utils } from "@hassanmojab/react-modern-calendar-datepicker";

const Calender = ( { selectedDay, setSelectedDay } ) => {

  return (
    <Calendar
      value={ selectedDay }
      onChange={ setSelectedDay }
      shouldHighlightWeekends={ true }
      minimumDate={ utils().getToday() }
    />
  );
};

export default Calender;
