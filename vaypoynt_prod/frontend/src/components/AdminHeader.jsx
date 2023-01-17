import React from "react";
import { AuthContext } from "../authContext";
import { NavLink } from "react-router-dom";
import { GlobalContext } from "../globalContext";
export const AdminHeader = () => {
  const { dispatch } = React.useContext( AuthContext );
  const { state } = React.useContext( GlobalContext );

  return (
    <>
      <div className={ `sidebar-holder ${ !state.isOpen ? "open-nav" : "" }` }>
        <div className="sticky top-0 h-fit">
          <div className="w-full p-4 bg-sky-500">
            <div className="text-white font-bold text-center text-2xl">
              Admin
            </div>
          </div>
          <div className="w-full sidebar-list">
            <ul className="flex flex-wrap">
              <li className="list-none block w-full">
                <NavLink
                  to="/admin/dashboard"
                  className={ `${ state.path === "admin" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Dashboard
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/user"
                  className={ `${ state.path === "user" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  User
                </NavLink>
              </li>

              {/* 
              <li className="list-none block w-full">
                <NavLink
                  to="/admin/photo"
                  className={ `${ state.path === "photo" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Photo
                </NavLink>
              </li> */}


              <li className="list-none block w-full">
                <NavLink
                  to="/admin/email"
                  className={ `${ state.path === "email" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Email
                </NavLink>
              </li>


              <li className="list-none block w-full">
                <NavLink
                  to="/admin/company_profile"
                  className={ `${ state.path === "company_profile" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Company
                </NavLink>
              </li>


              <li className="list-none block w-full">
                <NavLink
                  to="/admin/desk_ticket"
                  className={ `${ state.path === "desk_ticket" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Company Desk schedule
                </NavLink>
              </li>


              <li className="list-none block w-full">
                <NavLink
                  to="/admin/department"
                  className={ `${ state.path === "department" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Department
                </NavLink>
              </li>


              <li className="list-none block w-full">
                <NavLink
                  to="/admin/cms"
                  className={ `${ state.path === "cms" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  CMS
                </NavLink>
              </li>


              <li className="list-none block w-full">
                <NavLink
                  to="/admin/employee_profile"
                  className={ `${ state.path === "employee_profile" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Employee
                </NavLink>
              </li>


              <li className="list-none block w-full">
                <NavLink
                  to="/admin/desk_hotelling"
                  className={ `${ state.path === "desk_hotelling" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Desk Hotelling
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/prices"
                  className={ `${ state.path === "prices" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Stripe Plan
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/subscriptions"
                  className={ `${ state.path === "subscriptions" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Stripe Subscriptions
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/invoices"
                  className={ `${ state.path === "invoices" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Stripe Invoice
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/admin/pending_cancel_requests"
                  className={ `${ state.path.split( '_' ).join( "" ) === "pendingcancelrequests" ? "text-black bg-gray-200" : "" }` }
                >
                  Pending Cancel Requests
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/products"
                  className={ `${ state.path === "products" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Products
                </NavLink>
              </li>

              <li className="list-none block w-full">
                <NavLink
                  to="/admin/profile"
                  className={ `${ state.path === "profile" ? "text-black bg-gray-200" : ""
                    }` }
                >
                  Profile
                </NavLink>
              </li>
              <li className="list-none block w-full">
                <NavLink
                  to="/admin/login"
                  onClick={ () =>
                    dispatch( {
                      type: "LOGOUT",
                    } )
                  }
                >
                  Logout
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
