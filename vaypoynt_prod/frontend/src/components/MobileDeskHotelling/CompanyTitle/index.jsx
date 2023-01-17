import React from "react";
import "./CompanyTitle.css";

function CompanyTitle ( { children } ) {
  return (
    <div className="company-title">
      {/* <div className="company-title  absolute inset-0 m-auto"> */ }
      <h1 className="title prometotrial-medium-white-27px text-center">{ children }</h1>
    </div>
  );
}

export default CompanyTitle;
