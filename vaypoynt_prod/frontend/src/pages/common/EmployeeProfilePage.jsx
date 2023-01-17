import React, { useCallback, useEffect, useState } from "react";
import {
  BackImg,
  LocationFieldImg,
  NameFieldImg,
  EmailFieldImg,
  FloorFieldImg,
  DateFieldImg,
  EmployeeChair,
  PhoneNumber
} from "Assets/images";
import { NavLink, useLocation } from "react-router-dom";
import MkdSDK from "Utils/MkdSDK";
import ContentLoader from "Components/ContentLoader";

const sdk = new MkdSDK();
function useQuery () {
  const { search } = useLocation();

  return React.useMemo( () => new URLSearchParams( search ), [ search ] );
}

const EmployeeProfilePage = () => {
  let query = useQuery();
  const [ user, setUser ] = useState( {
    id: 1,
    create_at: "",
    update_at: "",
    user_id: 3,
    first_name: "",
    last_name: "",
    company_id: -1,
    title: "",
    department_id: -1,
    floor: -1,
    address: "",
    profile_photo: "",
    email: "",
  } );
  const [ userProfileLoading, setUserProfileLoading ] = useState( false );
  const [ isLoading, setIsLoading ] = useState( true );
  const [ empId, setEmpId ] = useState( '' );
  useEffect( () => {
    setEmpId( query.get( "empId" ) );
    getEmpProfile( query.get( "empId" ) );
  }, [ query ] );
  const getUserProfile = useCallback( () => {
    ( async () => {
      try {
        setUserProfileLoading( true );

        const result = await sdk.getProfile();

        if ( !result?.error ) {
          console.log( result );
          // setUser(result?.model)
        }
        setUserProfileLoading( false );
      } catch ( error ) {
        setUserProfileLoading( false );

        console.log( error.message );
      }
    } )();
  }, [ user, userProfileLoading ] );

  // useEffect(() => {
  //   if (!user) {
  //     getUserProfile();
  //   }
  // }, [user]);

  const END_POINT = "/v1/api/rest/employee_profile/GET";
  const getEmpProfile = ( id ) => {
    const PAYLOAD = {
      id: id,
    };
    setIsLoading( true )
    setUserProfileLoading( true );
    sdk.callRawAPI( END_POINT, PAYLOAD, "POST" ).then( ( res ) => {
      setUser( res.model );
      console.log( res.model );
      setUserProfileLoading( false );
      setIsLoading( false )
    } );
  };
  useEffect( () => {

  }, [] );

  return (
    <>
      <section className="inner-banner">
        <div className="container flex items-center py-20">
          <NavLink to="/company/dashboard" className="inner-back-btn">
            <img className="w-10 h-10 object-contain" src={ BackImg } />
          </NavLink>
        </div>
      </section>
      <section className="-mt-20 mb-20">
        <div className="container">
          <div className="employee-profile-head">

            <img
              className="block m-auto object-cover rounded-full shadow-md"
              src={ user?.profile_photo }
            />
            <h4 className="text-center text-2xl my-2 font-bold">
              { user.first_name }

            </h4>
            <span className="flex items-center justify-center gap-2">
              <img className="w-4 h-4" src={ LocationFieldImg } />
              { user.address }
            </span>
          </div>
        </div>
      </section>

      <section className="employee-profile-detail pb-20">
        <div className="container">
          { isLoading && <ContentLoader /> }
          <div className="m-auto w-full max-w-[990px] employee-detail-box border-b-2 pb-5 mb-5">
            <h5 className="mb-4 text-xl font-bold">Details:</h5>
            <div className="flex gap-10 flex-wrap">
              <div className="flex gap-3 items-center w-fit min-w-[220px]">
                <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                  <img className="w-5 h-5 object-contain" src={ NameFieldImg } />
                </span>
                <p className="font-semibold text-md">{ user?.title }</p>
              </div>
              <div className="flex gap-3 items-center w-fit min-w-[200px]">
                <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                  <img className="w-5 h-5 object-contain" src={ FloorFieldImg } />
                </span>
                <p className="font-semibold text-md">{ user?.floor }</p>
              </div>
              <div className="flex gap-3 items-center w-fit min-w-[200px]">
                <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                  <img className="w-5 h-5 object-contain" src={ DateFieldImg } />
                </span>
                <p className="font-semibold text-md">{ user?.create_at }</p>
              </div>
              {/* <div className="flex gap-3 items-center w-fit min-w-[200px]">
                <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                  <img className="w-5 h-5 object-contain" src={EmployeeChair} />
                </span>
                <p className="font-semibold text-md">Seat 332</p>
              </div> */}
            </div>
          </div>

          <div className="m-auto w-full max-w-[990px] employee-detail-box border-b-2 pb-5 mb-5">
            <h5 className="mb-4 text-xl font-bold">Contact info:</h5>
            <div className="flex gap-10 flex-wrap">
              {/* <div className="flex gap-3 items-center w-fit min-w-[220px]">
                <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                  <img className="w-5 h-5 object-contain" src={PhoneNumber} />
                </span>
                <p className="font-semibold text-md">+1 935 178 4921</p>
              </div> */}
              <div className="flex gap-3 items-center w-fit min-w-[200px]">
                <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                  <img className="w-5 h-5 object-contain" src={ EmailFieldImg } />
                </span>
                <p className="font-semibold text-md">{ user?.email }</p>
              </div>
            </div>
          </div>

          <div className="m-auto w-full max-w-[990px] employee-detail-box">
            <h5 className="mb-4 text-xl font-bold">Address:</h5>
            <div className="flex gap-10 flex-wrap">
              <div className="flex gap-3 items-center w-fit min-w-[220px]">
                <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                  <img className="w-5 h-5 object-contain" src={ LocationFieldImg } />
                </span>
                <p className="font-semibold text-md">
                  { user?.address }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EmployeeProfilePage;
