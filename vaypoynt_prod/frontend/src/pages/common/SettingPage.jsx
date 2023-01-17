import React from "react";
import { NavLink } from "react-router-dom";
import { BackImg } from "Assets/images";
import AccountManagementTab from "Components/AccountManagementTab";
import RemoveAddEmployeeTab from "Components/RemoveAddEmployeeTab";
import RemoveAddDepartmentTab from "Components/RemoveAddDepartmentTab";
import UpdatePaymentTab from "Components/UpdatePaymentTab";
import DeskHotellingTab from "Components/DeskHotellingTab";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { CompanyAppIntegrationTab } from "Pages/company";

const SettingPage = () => {
  const data = [
    {
      label: "Account Management",
      value: "Account Management",
      desc: <AccountManagementTab />,
    },
    {
      label: "App Integration",
      value: "App Integration",
      desc: <CompanyAppIntegrationTab />,
    },

    {
      label: "Remove / Add Employee",
      value: "Remove / Add Employee",
      desc: <RemoveAddEmployeeTab />,
    },

    {
      label: "Remove / Add Department",
      value: "Remove / Add Department      ",
      desc: <RemoveAddDepartmentTab />,
    },

    {
      label: "Payment Updates",
      value: "Payment Updates",
      desc: <UpdatePaymentTab />,
    },
    {
      label: "Desk Hotelling",
      value: "Desk Hotelling",
      desc: <DeskHotellingTab />,
    },
  ];
  return (
    <>
      <section className="inner-banner">
        <div className="container flex items-center py-20 gap-5">
          <NavLink to="/" className="inner-back-btn">
            <img className="w-10 h-10 object-contain " src={ BackImg } />
          </NavLink>
          <p className="text-white text-4xl font-bold">Settings</p>
        </div>
      </section>
      <div className="setting-page-holder py-10">
        <div className="container">
          <Tabs id="custom-animation" value="Account Management">
            <div className="flex gap-x-20 gap-y-5 cus-tab-header">
              <div className="tab-open-btn-holder">
                <div className="relative">
                  <p className="form-submit">More Settings</p>
                  <TabsHeader className="flex-col gap-2 w-[300px]">
                    { data.map( ( { label, value } ) => (
                      <Tab
                        key={ value }
                        value={ value }
                        className="text-black cus-tab text-lg font-bold py-2"
                      >
                        { label }
                      </Tab>
                    ) ) }
                  </TabsHeader>
                </div>
              </div>

              <TabsBody
              animate={{
                mount: { y: 0 },
                unmount: { y: 250 },
              }}
              >
                {data.map(({ value, desc }) => (
                  <TabPanel key={value} value={value} className="cus-tabpanel">
                    {desc}
                  </TabPanel>
                ) ) }
              </TabsBody>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SettingPage;
