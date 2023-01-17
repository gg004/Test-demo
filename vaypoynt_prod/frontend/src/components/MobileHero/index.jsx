import { NavLink } from "react-router-dom";
import { AuthContext } from "../../authContext";
import CompanyTitle from "Components/MobileDeskHotelling/CompanyTitle";
import IconFeatherMenu from "Components/IconFeatherMenu";
import React from "react";
import "./Rectangle7.css";
import { useProfile } from "../../hooks/useProfile";

function MobileHero ( { companyTitle, arcPosition = "right", className } ) {
  const { state: { role } } = React.useContext( AuthContext )
  const [ profile ] = useProfile()

  return (

    <div
      className={ `MobileHero overflow-hidden flex justify-between items-center px-5 relative ${ arcPosition === "left" ? "rounded-bl-[40px]" : "rounded-br-[40px]" } ${ className }` }
    >
      <div className={ `w-10  h-10 rounded-full md:block ${ role === "company" ? "block" : "hidden" }` }></div>
      <IconFeatherMenu />
      <CompanyTitle>{ companyTitle }</CompanyTitle>
      <NavLink to={ `/employee/my_profile` } className={ `w-12 bg-white h-12 rounded-full profile-border-white z-20 shadow-md md:hidden ${ role === "employee" ? "block" : "hidden" } ` }>
        <img
          className={ `w-full bg-white h-full object-fit rounded-full shadow-md -z-10` }
          src={ profile?.profile_photo ? profile?.profile_photo : 'https://via.placeholder.com/150' }
        />
      </NavLink>
      <div className={ `w-10  h-10 rounded-full  md:block ${ role === "company" ? "block" : "hidden" }` }></div>

      <div className="ellipse-container">
        <div className="ellipse-4"></div>
        <div className="ellipse-5"></div>
      </div>
      <div className="ellipse-container-1">
        <div className="ellipse-4-1"></div>
        <div className="ellipse-5-1"></div>
      </div>
      <div className="ellipse-container-2">
        <div className="ellipse-4-2"></div>
        <div className="ellipse-5-2"></div>
      </div>

    </div>
  )
}

export default MobileHero;
