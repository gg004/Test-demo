import React from "react";
import { HomePage } from "Components/HomePage";
import { homePageData } from "Utils/utils";
// import { AuthContext } from "../../authContext";
// import { GlobalContext } from "../../globalContext";

const EmployeeDashboardPage = () => {
  // const { dispatch } = React.useContext( AuthContext );
  // const { dispatch: globalDispatch } = React.useContext( GlobalContext );

  // React.useEffect( () => {
  //   globalDispatch( {
  //     type: "SETPATH",
  //     payload: {
  //       path: "employee",
  //     },
  //   } );
  // }, [] );
  return (
    <>
      {/* <div className="w-full flex justify-center items-center text-7xl h-screen text-gray-700 ">
        Dashboard
      </div> */}
      <HomePage
        bannonMorrissyRxiav5LcWwUnsplash="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/bannon-morrissy-rxiav5lc-ww-unsplash-2@1x.png"
        iconAwesomeCheck="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/icon-awesome-check-1@1x.png"
        path18="https://anima-uploads.s3.amazonaws.com/projects/6356c5680fd24bf1dbc5987d/releases/6356d02504a861c957281e03/img/path-18-1@1x.png"
        group5421Props={ homePageData.group5421Props }
        group5422Props={ homePageData.group5422Props }
        group5431Props={ homePageData.group5431Props }
        group5432Props={ homePageData.group5432Props }
      />
    </>
  );
};

export default EmployeeDashboardPage;
