import React, { useCallback, useContext, useState } from "react";
import LoginHeader from "../../components/LoginHeader";
import { NavLink, useNavigate } from "react-router-dom";
import {
  btnNext,
  NameFieldImg,
  EmailFieldImg,
  PasswordFieldImg,
  DepartmentFieldImg,
  CompanyFieldImg,
  CreditFieldImg,
  DateFieldImg,
  LocationFieldImg,
} from "Assets/images";
import { InteractiveButton } from "Components/InteractiveButton";
import { Steps } from "Utils/utils";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import MkdSDK from "Utils/MkdSDK";
import { GlobalContext, showToast } from "../../globalContext";
import { AuthContext } from "../../authContext";

const sdk = new MkdSDK()

const CompanySignupPage = () => {

  const stripe = useStripe();
  const elements = useElements()
  const navigate = useNavigate()

  const { dispatch: authDispatch } = useContext( AuthContext )
  const { dispatch: globalDispatch } = useContext( GlobalContext )

  const [ registerLoading, setRegisterLoading ] = useState( false )
  const [ firstName, setFirstName ] = useState( '' )
  const [ lastName, setLastName ] = useState( '' )
  const [ email, setEmail ] = useState( '' )
  const [ companyName, setCompanyName ] = useState( '' )
  const [ address, setAddress ] = useState( '' )
  const [ password, setPassword ] = useState( '' )
  // const [ registerLoading, setRegisterLoading ] = useState( false )
  const [ companyLogo, setCompanyLogo ] = useState( null )
  const [ step, setStep ] = useState( Steps.CompanyInfo )

  const nextStep = useCallback( () => {
    if ( firstName === "" || lastName === "" || companyLogo === null || companyName === "" || address === "" || password === "" || email === "" ) {
      alert( "Please Fill all information" )
    } else {
      setStep( Steps.CardDetails )
    }
  }, [ step, firstName, lastName, companyLogo, companyName, address, password, email ] )

  const prevStep = useCallback( () => {
    setStep( Steps.CompanyInfo )
  }, [ step ] )

  const handleToken = async () => {

    try {
      setRegisterLoading( true )
      const cardElem = elements.getElement( "card" );
      const tokenResult = await stripe.createToken( cardElem );

      handleRegister( tokenResult?.token.id )
    } catch ( error ) {
      setRegisterLoading( false )
      console.log( error.message )
    }
  }

  const handleRegister = async ( token ) => {

    const payload = new FormData()
    const file = handleUpload( companyLogo )

    payload.append( "planId", 1 )
    payload.append( "first_name", firstName )
    payload.append( "last_name", lastName )
    payload.append( "email", email )
    payload.append( "password", password )
    payload.append( "company_name", companyName )
    payload.append( "address", address )
    payload.append( "file", file )
    payload.append( "cardToken", token )

    try {
      const result = await sdk.registerSubscribe( payload )
      if ( !result.error ) {

        setRegisterLoading( false )

        showToast( globalDispatch, "Company Created Successfully" )
        authDispatch( {
          type: "LOGIN",
          payload: result
        } )

        navigate( "/company/dashboard" )
      }
    } catch ( error ) {

      showToast( globalDispatch, "An Error Occured!" )
      setRegisterLoading( false )
      console.log( error.message )
    }
  }

  const handleUpload = ( file ) => {

    const reader = new FileReader()
    reader.onload = ( () => {
      return ( e ) => {
        // console.log( e.result )
      }
    } )()

    reader.readAsDataURL( file )
    return file
  }

  return (
    <>
      <LoginHeader />
      <div className="pb-10 flex justify-center flex-col items-center px-10">

        <div className="w-full md:w-[60%]">
          <div className={ `w-full ${ step === Steps.CompanyInfo ? "" : "hidden" }` }>
            {/* <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-20 mt-4"> */ }
            <div className="w-full grid  mt-4">
              <div>
                <h5 className="mb-10 text-2xl font-semibold">Company Details</h5>
                <fieldset className="cus-input">
                  <label
                    htmlFor="firstName"
                    className="block mb-2 text-md font-medium text-gray-900"
                  >
                    First Name
                  </label>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        className="w-5 h-5 object-contain"
                        src={ NameFieldImg }
                      />
                    </div>
                    <input
                      type="text"
                      id="firstName"
                      className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="James"
                      onChange={ ( e ) => setFirstName( e.target.value ) }
                    />
                  </div>
                </fieldset>

                <fieldset className="cus-input">
                  <label
                    htmlFor="lastName"
                    className="block mb-2 text-md font-medium text-gray-900"
                  >
                    Last Name
                  </label>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        className="w-5 h-5 object-contain"
                        src={ NameFieldImg }
                      />
                    </div>
                    <input
                      onChange={ ( e ) => setLastName( e.target.value ) }
                      type="text"
                      id="lastName"
                      className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Gorden
                    "
                    />
                  </div>
                </fieldset>

                <fieldset className="cus-input">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-md font-medium text-gray-900"
                  >
                    Email Address
                  </label>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        className="w-5 h-5 object-contain"
                        src={ EmailFieldImg }
                      />
                    </div>
                    <input
                      type="email"
                      id="email"
                      className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="name@flowbite.com"
                      onChange={ ( e ) => setEmail( e.target.value ) }
                    />
                  </div>
                </fieldset>
                <fieldset className="cus-input">
                  <label
                    htmlFor="companyName"
                    className="block mb-2 text-md font-medium text-gray-900"
                  >
                    Company Name
                  </label>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        className="w-5 h-5 object-contain"
                        src={ CompanyFieldImg }
                      />
                    </div>
                    <input
                      onChange={ ( e ) => setCompanyName( e.target.value ) }
                      type="text"
                      id="companyName"
                      className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Company Title"
                    />
                  </div>
                </fieldset>

                <fieldset className="cus-input">
                  <label
                    htmlFor="address"
                    className="block mb-2 text-md font-medium text-gray-900"
                  >
                    Address
                  </label>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        className="w-5 h-5 object-contain"
                        src={ LocationFieldImg }
                      />
                    </div>
                    <input
                      onChange={ ( e ) => setAddress( e.target.value ) }
                      type="text"
                      id="address"
                      className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder=""
                      required
                    />
                  </div>
                </fieldset>

                <fieldset className="cus-input">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-md font-medium text-gray-900"
                  >
                    Create Password
                  </label>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img
                        className="w-5 h-5 object-contain"
                        src={ PasswordFieldImg }
                      />
                    </div>
                    <input
                      onChange={ ( e ) => setPassword( e.target.value ) }
                      type="password"
                      id="password"
                      className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Password"
                      required
                    />
                  </div>
                </fieldset>
                <fieldset className="cus-input">
                  <label className="block mb-2 text-md font-medium text-gray-900">
                    Upload Company Logo
                  </label>
                  <label className="block">
                    <span className="sr-only">Choose File</span>
                    <input
                      type="file"
                      required
                      accept="image/png,image/jpg,image/jpeg"
                      onChangeCapture={ ( e ) => setCompanyLogo( e.target.files[ 0 ] ) }
                      className="block mb-12 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </label>
                </fieldset>
              </div>
            </div>
            <InteractiveButton
              className="form-submit mt-4 mb-4 col-span-full" type="button"
              // loading={ registerLoading }
              onClick={ nextStep }
            >
              Next Step <img src={ btnNext } />
            </InteractiveButton>

          </div>
          <div className={ `w-full ${ step === Steps.CardDetails ? "" : "hidden" }` }>
            <h5 className="mb-10 text-2xl font-semibold">
              Finance Department
            </h5>

            <div className={ `w-full flex flex-col justify-center items-center ` }>
              <div className={ `bg-gradient-45 to-[#4c6fff] from-[#0f2682] text-white h-[100px] w-[100px] rounded-full flex flex-col justify-center items-center text-[24px] font-semibold shadow-xl` }>

                <div className={ ` text-3xl font-semibold` }>
                  $3.49
                </div>
                <div className={ ` text-lg font-semibold` }>
                  Monthly
                </div>
              </div>
            </div>



            <CardElement
              className={ `mt-4 bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500` }
              options={
                { hidePostalCode: true }
              }
            />


            <div className={ `xl:flex lg:flex md:flex sm:flex block gap-2 w-full justify-between` }>

              <InteractiveButton
                className="form-submit mt-4 mb-4  col-span-full mx-auto" type="button"
                onClick={ prevStep }
              >
                <img className={ `rotate-180` } src={ btnNext } /> Previous Step
              </InteractiveButton>

              <InteractiveButton
                className="form-submit mt-4 mb-4  col-span-full" type="button"
                loading={ registerLoading }
                onClick={ handleToken }
              >
                Submit <img className={ `` } src={ btnNext } />
              </InteractiveButton>
            </div>
          </div>

          <div className="other-account mt-4">
            <p>Already Have an Account?</p>
            <NavLink to="/company/login">Login</NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanySignupPage;
