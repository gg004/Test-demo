import React, { useContext } from "react";
import {
  LocationFieldImg,
  EmployeeImg
} from "Assets/images";
import IconFeatherMenu from "Components/IconFeatherMenu";
import { AppIntegrationTab } from "Components/AppIntegrationTab";
import CompanyTitle from "Components/MobileDeskHotelling/CompanyTitle";
import { AuthContext } from "../../authContext";

export const EmployeeAppIntegrationPage = () => {
  const { state: { profile } } = useContext( AuthContext )

  return (

    <>
      <section className="relative inner-banner mb-[200px] rounded-br-[50px]">
        <div className="container flex items-center py-20">
          {/* <NavLink to="/company/dashboard" className="inner-back-btn hidden md:block">
            <img className="w-10 h-10 object-contain" src={ BackImg } />
          </NavLink> */}
          <div className="md:hidden block">
            <IconFeatherMenu />
          </div>
          <div className={ `absolute inset-0 md:hidden w-fit h-fit m-auto` }>
            <CompanyTitle>App Integration</CompanyTitle>
          </div>
        </div>
        <section className="absolute inset-x-0 -bottom-[60%] m-auto">
          <div className="container">
            <div className="employee-profile-head ">

              <img
                className="block profile-border-white m-auto object-cover rounded-full shadow-md"
                src={ profile?.profile_photo ? profile?.profile_photo : EmployeeImg }
              />
              <h4 className="capitalize text-center text-2xl my-2 font-bold">
                { profile?.first_name } { profile?.last_name }

              </h4>
              <span className="flex items-center justify-center gap-2">
                <img className="w-4 h-4" src={ LocationFieldImg } />
                { profile?.address }
              </span>
            </div>
          </div>
        </section>
      </section>
      <div className={ `my-5 container` }>
        <AppIntegrationTab />
      </div>

    </>

  );
};