import React from "react";
import User7 from "../User7";
import "./Username.css";

function Username ( { user7Props, register, errors } ) {

  return (
    <div className="username">
      <p className="username-admin-name poppins-semi-bold-martinique-16px"> Email </p>
      <div className="overlap-group-1">
        <User7 src={ user7Props.src } />
        <input
          type={ `email` }
          { ...register( "email" ) }
          className="poppins-normal-aluminium-16px h-full grow bg-transparent outline-none border-none" />
      </div>
      <p className="text-red-500 text-xs capitalize italic">
        { errors.email?.message }
      </p>
    </div>
  );
}

export default Username;
