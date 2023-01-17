import React from "react";
// import { Link } from "react-router-dom";
import { AuthContext } from "../../authContext";
import { GlobalContext } from "../../globalContext";
import "./IconFeatherMenu.css";

function IconFeatherMenu () {
  const { state: { isOpen }, dispatch } = React.useContext( GlobalContext );
  const { state: { role, profile } } = React.useContext( AuthContext );
  // let { isOpen } = state;
  let toggleOpen = ( open ) =>
    dispatch( {
      type: "OPEN_SIDEBAR",
      payload: { isOpen: open },
    } );
  return (
    <button className={ `flex flex-col gap-2 h-[30px] w-[30px] md:hidden ${ role === "company" ? "hidden" : "" } ${ profile?.company_id ? "" : "opacity-0 cursor-default" }` } onClick={ () => toggleOpen( !isOpen ) }>
      {/* <button className="flex flex-col gap-2 h-[30px] w-[30px] absolute inset-y-0 left-5 m-auto z-50" onClick={ () => toggleOpen( !isOpen ) }> */ }
      <div className="flex flex-col gap-2 h-[30px] w-[30px]">
        <img
          className=""
          src="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/path-24-1@1x.png"
          alt="Path 25"
        />
        <img
          className=""
          src="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/path-24-1@1x.png"
          alt="Path 24"
        />
        <img
          className=""
          src="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/path-24-1@1x.png"
          alt="Path 26"
        />
      </div>
    </button>
  );
}

export default IconFeatherMenu;
