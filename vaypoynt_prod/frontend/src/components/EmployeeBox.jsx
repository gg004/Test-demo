import React from "react";
import { LocationFieldImg } from "Assets/images";
import { NavLink } from "react-router-dom";

const EmployeeBox = ( {
  employeeTitle,
  employeeSkills,
  employeeLocation,
  employeeImg,
  employeeProfile,
} ) => {
  return (
    <>
      <NavLink to={ employeeProfile } className="employee-box shadow-lg">
        <img
          className="w-20 bg-white h-20 block m-auto object-fit rounded-full -mt-10 shadow-md "
          src={ employeeImg ? employeeImg : 'https://via.placeholder.com/150' }
        />
        <div>
          <h4>{ employeeTitle }</h4>
          <p>{ employeeSkills }</p>
          <span className="flex items-center justify-center gap-2">
            <img className="w-4 h-4" src={ LocationFieldImg } />
            { employeeLocation }
          </span>
        </div>
      </NavLink>
    </>
  );
};

export default EmployeeBox;
