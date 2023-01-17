import React from "react";
import Battery from "../Battery";
import "./Group21.css";

function Group21() {
  return (
    <div className="group-21">
      <div className="time sfprotext-semi-bold-white-14px-2">
        <span className="span0 sfprotext-semi-bold-white-14px">9:4</span>
        <span className="sfprotext-semi-bold-white-14px">1</span>
      </div>
      <img
        className="cellular-connection"
        src="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/cellular-connection-1@1x.png"
        alt="Cellular Connection"
      />
      <img
        className="wifi"
        src="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/wifi-1@1x.png"
        alt="Wifi"
      />
      <Battery />
    </div>
  );
}

export default Group21;
