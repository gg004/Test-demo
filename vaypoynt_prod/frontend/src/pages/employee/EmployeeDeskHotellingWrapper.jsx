import React from "react";
import { deskHotellingData } from "Utils/utils";
import { DeskHottelling } from "Pages/common";
import MobileDeskHotelling from "Components/MobileDeskHotelling/DeskHotelling";

export const EmployeeDeskHotellingWrapper = () => {

  return (
    <>
      {/* <div className="md:block hidden">
        <DeskHottelling />
      </div> */}
      <div className="">
        {/* <div className="block md:hidden"> */ }
        <MobileDeskHotelling { ...deskHotellingData } />
      </div>
    </>
  )
};



