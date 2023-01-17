import React from "react";
import { AuthContext } from "../authContext";
import { NavLink, useNavigate } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { Logo, AvatarImg } from "Assets/images";
import TopHeader from "./TopHeader";
import MkdSDK from "Utils/MkdSDK";
import { useProfile } from "../hooks/useProfile";

const sdk = new MkdSDK();
export const CompanyHeader = () => {
  // const navigate = useNavigate();

  const { dispatch } = React.useContext( AuthContext );
  const { state } = React.useContext( GlobalContext );
  const [ profile ] = useProfile();
  const Logout = () => {
    dispatch( {
      type: "LOGOUT",
      payload: "/company/login"
    } );
    // navigate(  );
  };
  // const getProfile = useCallback( () => {
  //   ( async () => {
  //     const result = await sdk.getProfile();
  //     console.log( result );
  //     // setUser()
  //   } )();
  // }, [ user ] );
  // useEffect( () => {
  //   getProfile();
  // }, [] );

  return (
    <>
      <header className="sticky-top bg-white w-full py-3 ">
        <div className="flex container items-center justify-between">
          <NavLink to="/">
            <img className="max-w-[200px] w-full" src={ Logo } />
          </NavLink>

          <nav
            className={ `flex md:flex-row flex-col md:gap-x-5 justify-center items-center bg-white gap-10 cus-head-nav h-screen md:h-[70px] md:grow md:sticky-top fixed  ${ !state.isOpen ? "" : "open"
              }` }
          >
            <NavLink className="text-lg font-semibold		" to="/company/employee">
              Employee
            </NavLink>
            <NavLink className="text-lg	font-semibold	" to="/company/department">
              Departments
            </NavLink>
            <NavLink
              className="text-lg	font-semibold	"
              to="/company/status-chart"
            >
              Status Chart
            </NavLink>

            {/* <NavLink className="text-lg	font-semibold" to="/company/desk-hotteling">
              Desk Hotelling
            </NavLink> */}

          </nav>
          <div className="flex gap-2 items-center">
            <div className="head-profile">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={ profile?.company_logo ? profile?.company_logo : AvatarImg }
              />
              <ul className="shadow-lg p-4 bg-white rounded-sm border-1">
                {/* <li>
                  <NavLink className="text-lg	font-semibold	" to="#">
                    Account Management
                  </NavLink>
                </li>
                <li>
                  <NavLink className="text-lg	font-semibold	" to="#">
                    Admin controls
                  </NavLink>
                </li>
                <li>
                  <NavLink className="text-lg	font-semibold	" to="#">
                    Message Admin
                  </NavLink>
                </li> */}
                <li>
                  <NavLink
                    className="text-lg	font-semibold	"
                    to="/company/setting"
                  >
                    Setting
                  </NavLink>
                </li>
                <li>
                  <button
                    className="text-lg	font-semibold	"
                    type={ `button` }
                    onClick={ Logout }
                  >
                    Log Out
                  </button>
                </li>
                {/* <button className="text-lg	font-semibold	" 
            </button> */}
              </ul>
            </div>
            <div className="mob-nav-btn">
              <TopHeader />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default CompanyHeader;
