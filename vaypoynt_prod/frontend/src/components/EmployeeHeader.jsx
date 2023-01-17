import React from "react";
import { AuthContext } from "../authContext";
import { NavLink, useNavigate } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import TopHeader from "./TopHeader";
import { Logo, AvatarImg } from "Assets/images";

export const EmployeeHeader = () => {
  const navigate = useNavigate();

  const {
    state: { profile, role },
    dispatch,
  } = React.useContext( AuthContext );
  const { state } = React.useContext( GlobalContext );


  const Logout = () => {
    dispatch( {
      type: "LOGOUT",
    } );
    navigate( "/" );
  };

  return (
    <>
      <header className="md:sticky-top justify-between flex px-5 bg-white max-h-0 md:max-h-fit w-full md:py-3 ">
        <NavLink to="/">
          <img className="max-w-[200px] w-full" src={ Logo } />
        </NavLink>

        {/* <div className="md:grow px-5 mx-5 flex overflow-x-auto"> */ }
        <nav
          className={ `cus-head-nav md:grow md:sticky-top flex md:flex-row flex-col items-center bg-white gap-x-5 md:justify-center h-screen md:h-[70px]  md:mx-2 md:ml-5 ${ !state.isOpen ? "" : "open"
            } ${ profile?.company_id ? "" : "hidden" }` }
        >
          <NavLink className="text-sm	font-semibold 	" to="/employee/dashboard">
            Dashboard
          </NavLink>
          <NavLink
            className="text-sm font-semibold "
            to="/employee/desk-hotteling"
          >
            Desk Hotelling
          </NavLink>
          <NavLink className="text-sm	font-semibold " to="/employee/department">
            Departments
          </NavLink>
          <NavLink className="text-sm	font-semibold 	" to="/employee/status">
            Status
          </NavLink>
          <NavLink className="text-sm	font-semibold 	" to="/employee/apps">
            App Integration
          </NavLink>
          <NavLink
            className="text-sm	font-semibold	md:hidden"
            to="/employee/my_profile"
          >
            Profile
          </NavLink>
          <NavLink className="text-sm	font-semibold block	md:hidden xl:hidden" to="#">
            <button
              className="text-sm	font-semibold	"
              type={ `button` }
              onClick={ Logout }
            >
              Log Out
            </button>
          </NavLink>

        </nav>
        {/* </div> */ }
        <div className="flex gap-2 items-center">
          <div
            className={ `head-profile md:block lg:block ${ role === "employee" ? "hidden" : "block"
              }` }
          >
            <img
              className="w-12 h-12 rounded-full object-cover"
              src={
                profile?.profile_photo ? profile?.profile_photo : AvatarImg
              }
            />
            <ul className="shadow-lg p-4 bg-white rounded-sm border-1">
              <li>
                <NavLink
                  className="text-lg	font-semibold	"
                  to="/employee/my_profile"
                >
                  Profile
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
            </ul>
          </div>
          <div aria-disabled={ profile?.company_id ? false : true } className={ `mob-nav-btn ${ profile?.company_id ? "" : "opacity-0" }` }>
            <TopHeader />
          </div>
        </div>
      </header>
    </>
  );
};

export default EmployeeHeader;
