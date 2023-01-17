import React, { useCallback, useState } from "react";
import "./Password.css";

export function Password ( { password, lock1, errors, register } ) {
  const [ inputType, setInputType ] = useState( "password" );

  const changeInputType = useCallback( () => {
    if ( inputType === "password" ) {
      setInputType( "text" )
    } else if ( inputType === "text" ) {
      setInputType( "password" )
    }
  }, [ inputType ] )


  return (
    <div className="group-2">
      <div className="password-1 poppins-semi-bold-martinique-16px">{ password }</div>
      <div className="overlap-group-2">
        <img className="lock-1" src={ lock1 } alt="lock (1)" />
        <input
          { ...register( "password" ) }
          type={ inputType } className="text-1 grow poppins-normal-aluminium-16px h-full w-full outline-none border-none bg-transparent" />
        <button
          className="group-8"
          type="button"
          onClick={ changeInputType }
        >
          <img
            className="path-5"
            src="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/path-5-1@1x.png"
            alt="Path 5"
          />
        </button>
      </div>
      <p className="text-red-500 text-xs capitalize italic">
        { errors.password?.message }
      </p>
    </div>
  );
}
