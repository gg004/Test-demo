import React from "react";
import "./Group543.css";

function Group543(props) {
  const { children, className } = props;

  return (
    <div className={`group-5-1 ${className || ""}`}>
      <div className="sick-day poppins-normal-aluminium-16px">{children}</div>
    </div>
  );
}

export default Group543;
