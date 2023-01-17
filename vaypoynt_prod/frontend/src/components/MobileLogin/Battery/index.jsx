import React from "react";
import "./Battery.css";

function Battery() {
  return (
    <div className="battery">
      <div className="overlap-group">
        <div className="capacity"></div>
      </div>
      <img
        className="cap"
        src="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/cap-1@1x.png"
        alt="Cap"
      />
    </div>
  );
}

export default Battery;
