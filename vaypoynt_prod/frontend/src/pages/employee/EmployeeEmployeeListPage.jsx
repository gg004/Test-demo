import { EmployeePage } from "Pages/common";
import React, { useState, useCallback } from "react";
// import SearchBar from "Components/SearchBar";
// import EmployeeBox from "Components/EmployeeBox";
// import ContentLoader from "Components/ContentLoader";
// import { useEffect } from "react";
// import FilterModal from "Components/FilterModal";
import MkdSDK from "Utils/MkdSDK";
const sdk = new MkdSDK();
// import { AuthContext } from "../../authContext";

export const EmployeeEmployeeListPage = () => {


  return (
    <>
      {/* <div className={ `hidden md:block` }>
        <div className="w-full flex justify-center items-center text-3xl h-screen text-gray-700 ">
          To view This Page, Please Login on your Mobile Device
        </div>
      </div>
      <div className={ `block md:hidden ` }>
      </div> */}
      <EmployeePage />
    </>
  );
};

// axios.interceptors.response.use(function (response) {
//   // Any status code that lie within the range of 2xx cause this function to trigger
//   // Do something with response data
//   return response;
// }, function (error) {
//   // Any status codes that falls outside the range of 2xx cause this function to trigger
//   // Do something with response error
//   return Promise.reject(error);
// });