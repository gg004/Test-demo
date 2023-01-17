import React from "react";

import { AuthContext } from "./authContext";
import SnackBar from "./components/SnackBar";

import { GlobalContext } from "./globalContext";
import { useProfile } from "./hooks/useProfile";
import { EmployeeRoutes } from "./routes/Employee";
import { CompanyRoutes } from "./routes/Company";
import { AdminRoutes } from "./routes/Admin";
import { PublicRoutes } from "./routes/Public";


function renderRoutes ( role ) {
  switch ( role ) {
    case "admin":
      return ( <AdminRoutes /> );

    case "employee":
      return ( <EmployeeRoutes /> );

    case "company":
      return ( <CompanyRoutes /> );

    default:
      return ( <PublicRoutes /> );
  }
}

function Main () {
  const { state } = React.useContext( AuthContext );
  // py-10 px-5
  const { state: { isOpen }, dispatch } = React.useContext( GlobalContext );

  // let { isOpen } = state;
  let toggleOpen = ( open ) =>
    dispatch( {
      type: "OPEN_SIDEBAR",
      payload: { isOpen: open },
    } );

  return (
    <div className={ `h-full` } onClick={ () => { isOpen ? toggleOpen( false ) : null } }>
      <div className="flex w-full">

        <div className="w-full">
          <div className={ `page-wrapper w-full` }>
            { !state.isAuthenticated
              ? renderRoutes( "none" )
              : renderRoutes( state.role ) }
          </div>
        </div>
      </div>
      <SnackBar />
    </div>
  );
}

export default Main;
