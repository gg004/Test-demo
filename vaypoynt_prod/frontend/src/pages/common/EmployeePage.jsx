import React, { useState, useCallback } from "react";
import SearchBar from "Components/SearchBar";
import EmployeeBox from "Components/EmployeeBox";
import ContentLoader from "Components/ContentLoader";
import { useEffect } from "react";
import FilterModal from "Components/FilterModal";
import MkdSDK from "Utils/MkdSDK";
const sdk = new MkdSDK();
import { AuthContext, tokenExpireError } from "../../authContext";
import MobileHero from "Components/MobileHero";
const EmployeePage = () => {
  const { state, dispatch } = React.useContext(AuthContext);
  const { state: {role}} = React.useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [skills, setSkills] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [dataCopy, setDataCopy] = useState([]);

  const getEmployees = () => {
    const END_POINT = "/v2/api/custom/vaypoynt/employee";
    const PAYLOAD = {};
    setIsLoading(true);
    sdk
      .callRawAPI(END_POINT, PAYLOAD, "GET")
      .then((res) => {
        console.log(res);
        setEmployees(res.list);
        let loc = res.list.map((item) => item.address);
        let skil = res.list.map((item) => item.title);
        console.log({ loc, skil });
        setLocations(loc);
        setSkills(skil);
        console.log(res.list);
        setIsLoading(false);
        setDataCopy(res.list);
      })
      .catch((error) => {
        console.log(error.message);
        tokenExpireError(dispatch, error.message);
      });
  };
  useEffect(() => {
    getEmployees();
  }, []);

  const [searchInput, setSearchInput] = useState("");
  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  if (searchInput.length > 0) {
    countries.filter((country) => {
      return country.name.match(searchInput);
    });
  }

  const [ShowfilterModal, setFilterModal] = useState(false);
  const onCloseFilterModal = useCallback(() => {
    setFilterModal(false);
  }, [ShowfilterModal]);

  return (
    <div className={`relative`}>
      {ShowfilterModal ? (
        <FilterModal
          onSelectSkill={(skill) => {
            if (skill == "All") setEmployees(dataCopy);
            else {
              let temp = employees.filter((it) => it.title == skill);
              setEmployees(temp);
            }
          }}
          onSelectLocation={(location) => {
            if (location == "All") setEmployees(dataCopy);
            else {
              let temp = employees.filter((it) => it.address == location);
              setEmployees(temp);
            }
          }}
          skills={skills}
          locations={locations}
          onCloseFilterModal={onCloseFilterModal}
        />
      ) : null}
      <MobileHero
        companyTitle={`Employees`}
        arcPosition={`left`}
        className={`absolute inset-x-0 top-0`}
      />
      {isLoading ? (
        <div className={`mt-40`}>
          <ContentLoader />
        </div>
      ) : (
        <div className="relative w-full">
          <div className={`w-full px-5`}>
            <div className="container">
              <SearchBar
                Placeholder="Find Your Employee"
                onTapped={() => setFilterModal(true)}
                onChange={(event) => {
                  let text = event.target.value;
                  if (text.length > 0) {
                    let tempData = employees.filter((it) =>
                      it.first_name.toLowerCase().includes(text.toLowerCase())
                    );

                    setEmployees(tempData);
                  } else {
                    setEmployees(dataCopy);
                  }
                }}
              />
            </div>
          </div>

          <div className="container">
            <div className="employee-box-holder grid lg:grid-cols-3 md:grid-cols-2 items-center lg:gap-y-20 md:gap-y-20 sm:gap-y-20 gap-5 gap-x-10 mt-20 mx-2 pb-10">
              {/* <EmployeeBox
          employeeProfile="/company/employee_profile"
          employeeImg={EmployeeImg}
          employeeTitle="Project Manager"
          employeeSkills="Eleanor Pena"
          employeeLocation="Newyork.NY"
          /> */}

              {employees.length > 0 &&
                employees.map((item) => {
                  return (
                    <EmployeeBox
                      key={item.id}
                      employeeProfile={role === "employee" ? "#" : `/company/employee_profile?empId=${item.id}`}
                      employeeImg={item.profile_photo}
                      employeeTitle={item.first_name + " " + item.last_name}
                      employeeSkills={item.title}
                      employeeLocation={item.address}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePage;
