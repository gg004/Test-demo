import React, { useCallback, useEffect, useState, useContext } from "react";
import {
  BackImg,
  LocationFieldImg,
  NameFieldImg,
  EmailFieldImg,
  FloorFieldImg,
  DateFieldImg,
  EmployeeChair,
  PhoneNumber,
  btnNext,
  EmployeeImg,
  LogoutImg
} from "Assets/images";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import MkdSDK from "Utils/MkdSDK";
import ContentLoader from "Components/ContentLoader";
import { InteractiveButton } from "Components/InteractiveButton";
import { tokenExpireError, AuthContext } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";
import IconFeatherMenu from "Components/IconFeatherMenu";

const sdk = new MkdSDK();
function useQuery () {
  const { search } = useLocation();

  return React.useMemo( () => new URLSearchParams( search ), [ search ] );
}
export const EmployeeProfilePage = () => {
  const navigate = useNavigate()

  const { state: { role }, dispatch } = useContext( AuthContext )
  const { dispatch: GlobalDispatch } = useContext( GlobalContext )
  let query = useQuery();
  const [ user, setUser ] = useState( null );
  const [ userProfileLoading, setUserProfileLoading ] = useState( false );
  const [ companyInvites, setCompanyInvites ] = useState( [] );
  const [ getCompanyInvitesLoading, setGetCompanyInvitesLoading ] = useState( false );
  const [ acceptCompanyInviteLoading, setAcceptCompanyInviteLoading ] = useState( false );
  const [ rejectCompanyInviteLoading, setRejectCompanyInviteLoading ] = useState( false );
  // const [ empId, setEmpId ] = useState( '' );

  // {
  //   id: 1,
  //   create_at: "",
  //   update_at: "",
  //   user_id: 3,
  //   first_name: "",
  //   last_name: "",
  //   company_id: -1,
  //   title: "",
  //   department_id: -1,
  //   floor: -1,
  //   address: "",
  //   profile_photo: "",
  //   email: "",
  // }

  const { state } = React.useContext( GlobalContext );


  const Logout = () => {
    dispatch( {
      type: "LOGOUT"
    } )
    navigate( '/' )
  }

  const getUserProfile = useCallback( () => {
    ( async () => {
      try {
        setUserProfileLoading( true );

        const result = await sdk.getUserProfile();

        if ( !result?.error ) {
          console.log( result );
          setUser( () => ( { ...result?.model } ) );
        }
        setUserProfileLoading( false );
      } catch ( error ) {
        setUserProfileLoading( false );

        console.log( error.message );
        tokenExpireError( dispatch, error.message );
      }
    } )();
  }, [ user, userProfileLoading ] );

  const getCompanyInvites = useCallback( () => {
    ( async () => {
      try {
        setGetCompanyInvitesLoading( true );

        const result = await sdk.getCompanyInvites();

        if ( !result?.error ) {
          console.log( result );
          setCompanyInvites( () => [ ...result?.list ] );
        }
        setGetCompanyInvitesLoading( false );
      } catch ( error ) {
        setGetCompanyInvitesLoading( false );

        console.log( error.message );
        tokenExpireError( dispatch, error.message );
      }
    } )();
  }, [ companyInvites, getCompanyInvitesLoading ] );

  const acceptCompanyInvite = useCallback(
    ( id ) => {
      ( async () => {
        try {
          setAcceptCompanyInviteLoading( true );

          const result = await sdk.acceptCompanyInvite( id );

          // if ( !result?.error ) {
          //   console.log( result );
          //   setCompanyInvites( () => [ ...result?.list ] )
          // }
          showToast( GlobalDispatch, "Company Invite Accepted", 4000 );
          getCompanyInvites();
          setAcceptCompanyInviteLoading( false );
        } catch ( error ) {
          setAcceptCompanyInviteLoading( false );

          console.log( error.message );
          tokenExpireError( dispatch, error.message );
        }
      } )();
    },
    [ acceptCompanyInviteLoading ]
  );

  const rejectCompanyInvite = useCallback(
    ( id ) => {
      ( async () => {
        try {
          setRejectCompanyInviteLoading( true );

          const result = await sdk.rejectCompanyInvite( id );

          if ( !result?.error ) {
            showToast( GlobalDispatch, "Company Invite Rejected", 4000 );
            getCompanyInvites();
          }
          setRejectCompanyInviteLoading( false );
        } catch ( error ) {
          setRejectCompanyInviteLoading( false );
          console.log( error.message );
          tokenExpireError( dispatch, error.message );
        }
      } )();
    },
    [ rejectCompanyInviteLoading ]
  );

  useEffect( () => {
    getUserProfile();
    getCompanyInvites();
  }, [] );
  useEffect( () => {
    if ( !user ) {
      getUserProfile()
    }
    getCompanyInvites()
  }, [ user ] );

  return (
    <>
      { userProfileLoading ? (
        <div className={ `flex h-screen justify-center items-center` }>
          <ContentLoader />
        </div>
      ) : (
        <>

          <section className="relative inner-banner mb-[200px] rounded-br-[50px]">
            <div className="container flex items-center py-20">
              <NavLink
                to={ `${ role === "employee" ? "/employee/dashboard" : "/company/dashboard" } ` }
                className="inner-back-btn hidden md:block"
              >
                <img className="w-10 h-10 object-contain" src={ BackImg } />
              </NavLink>
              <div className="md:hidden block">
                <IconFeatherMenu />
              </div>
            </div>
            <section className="absolute inset-x-0 -bottom-[60%] m-auto">
              <div className="container">
                <div className="employee-profile-head ">
                  <img
                    className="block profile-border-white m-auto object-cover rounded-full shadow-md"
                    src={ user?.profile_photo ? user?.profile_photo : EmployeeImg }
                  />
                  <h4 className="text-center text-2xl my-2 font-bold">
                    { user?.first_name } { user?.last_name }

                  </h4>
                  <span className="flex items-center justify-center gap-2">
                    <img className="w-4 h-4" src={ LocationFieldImg } />
                    { user?.address }
                  </span>
                </div>
              </div>
            </section>
          </section>
          { companyInvites.length ? (
            <section className="employee-profile-detail pb-20 ">
              <div className="container">
                <div className="m-auto w-full max-w-[990px] employee-detail-box border-b-2 pb-5 mb-5">
                  <h5 className="mb-4 text-xl font-bold">Invites:</h5>
                  { companyInvites.map( ( invite ) => (
                    <div
                      key={ invite?.id }
                      className={ `w-full flex md:flex-row flex-col  justify-between items-center gap-2 md:gap-5  mt-2 mb-4 md:mb-2` }
                    >
                      <div
                        className={ `grow capitalize flex items-center ` }
                      >
                        { invite?.company_name } Company is has Invited you to
                        join their Company Under { invite?.department_name }{ " " }
                        department
                      </div>

                      <div
                        className={ `w-full md:w-1/3 flex justify-center items-center gap-x-2 border-2 border-blue-700` }
                      >
                        <InteractiveButton
                          onClick={ () =>
                            acceptCompanyInvite( Number( invite?.id ) )
                          }
                          className={ `flex justify-center items-center bg-[#4c6fff] w-1/2  px-0 form-submit ` }
                          loading={ acceptCompanyInviteLoading }
                          disabled={
                            acceptCompanyInviteLoading ||
                            rejectCompanyInviteLoading
                          }
                        >
                          Accept
                          <img src={ btnNext } />
                        </InteractiveButton>

                        <InteractiveButton
                          onClick={ () =>
                            rejectCompanyInvite( Number( invite?.id ) )
                          }
                          className={ `flex justify-center items-center bg-red-600 w-1/2 h-full px-0 form-submit ` }
                          loading={ rejectCompanyInviteLoading }
                          disabled={
                            acceptCompanyInviteLoading ||
                            rejectCompanyInviteLoading
                          }
                        >
                          Reject
                          <img src={ btnNext } />
                        </InteractiveButton>
                      </div>
                    </div>
                  ) ) }
                </div>
              </div>
            </section>
          ) : null }
          <section className="employee-profile-detail pb-20 ">
            <div className="container">
              <div className="m-auto w-full max-w-[990px] employee-detail-box border-b-2 pb-5 mb-5">
                <h5 className="mb-4 text-xl font-bold">Details:</h5>
                <div className="flex gap-10 flex-wrap">
                  <div className="flex gap-3 items-center w-fit min-w-[220px]">
                    <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                      <img
                        className="w-5 h-5 object-contain"
                        src={ NameFieldImg }
                      />
                    </span>
                    <p className="font-semibold text-md">{ user?.title }</p>
                  </div>
                  {user?.floor? 
                  <div className="flex gap-3 items-center w-fit min-w-[200px]">
                  <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                    <img
                      className="w-5 h-5 object-contain"
                      src={ FloorFieldImg }
                    />
                  </span>
                  <p className="font-semibold text-md">{ user?.floor }</p>
                </div>   
                  : ''}

                  <div className="flex gap-3 items-center w-fit min-w-[200px]">
                    <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                      <img
                        className="w-5 h-5 object-contain"
                        src={ DateFieldImg }
                      />
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
                      <img
                        className="w-5 h-5 object-contain"
                        src={ EmailFieldImg }
                      />
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
                      <img
                        className="w-5 h-5 object-contain"
                        src={ LocationFieldImg }
                      />
                    </span>
                    <p className="font-semibold text-md">{ user?.address }</p>
                  </div>
                </div>
              </div>
              <div className="m-auto mt-4 w-full max-w-[990px] employee-detail-box">
                {/* <h5 className="mb-4 text-xl font-bold">Address:</h5> */ }
                <div className="flex gap-10 flex-wrap">
                  <button className="flex gap-3 items-center w-fit min-w-[220px]" onClick={ Logout }>
                    <span className=" flex items-center justify-center w-10 h-10 bg-slate-300 rounded-md">
                      <img className="w-5 h-5 object-contain" src={LogoutImg} />
                    </span>
                    <p className="font-semibold text-md">
                      Log Out
                    </p>
                  </button>
                </div>
              </div>

            </div>
          </section>
        </>
      ) }
    </>
  );
};
