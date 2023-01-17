import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK"
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../authContext";
import LoginHeader from "Components/LoginHeader";
import {
  btnNext,
  PasswordFieldImg,
  NameFieldImg,
  EyeImg,
  CloseEyeImg
} from "Assets/images";
import { MobileLogin } from "Components/MobileLogin";
import { MobileLoginData } from "Utils/utils";



// export default function useToggle(initialValue = false) {

//   const toggle = React.useCallback(() => {
//     setValue(v => !v);
//   }, []);
//   return [value, toggle];
// }



export const EmployeeLoginPage = () => {
  const [ showPassword, setShowPassword ] = React.useState( false );
  const screenWidth = window.innerWidth;
  const schema = yup
    .object( {
      email: yup.string().email().required(),
      password: yup.string().required(),
      // company: yup.string().required(),
    } )
    .required();

  const { dispatch } = React.useContext( AuthContext );
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm( {
    resolver: yupResolver( schema ),
  } );

  const onSubmit = async ( data ) => {
    let sdk = new MkdSDK();
    try {
      const result = await sdk.login( data.email, data.password, "employee" );
      if ( !result.error ) {
        dispatch( {
          type: "LOGIN",
          payload: result,
        } );
        navigate( "/employee/dashboard" );
      } else {
        if ( result.validation ) {
          const keys = Object.keys( result.validation );
          for ( let i = 0; i < keys.length; i++ ) {
            const field = keys[ i ];
            setError( field, {
              type: "manual",
              message: result.validation[ field ],
            } );
          }
        }
      }
    } catch ( error ) {
      console.log( "Error", error );
      setError( "email", {
        type: "manual",
        message: error.message,
      } );
    }
  };
  // console.log( screenWidth )
  return (
    <>
      <div className="hidden md:block main-login-holder">
        <div className="login-content">
          <LoginHeader />
          <h2>Welcome to Vaypoynt</h2>
          <p>Please login your Account</p>

          <div className="flex justify-between items-center mt-10 mb-10">
            {/* <h4 className="text-md font-semibold">Select Client</h4> */ }
            <div className="flex gap-4">
              <NavLink
                className="text-md font-semibold border-b-2 border-transparent border-green-500"
                to="/employee/login"
              >
                Employee
              </NavLink>
              <NavLink
                className="text-md font-semibold border-b-2 border-transparent "
                to="/company/login"
              >
                Company
              </NavLink>
            </div>
          </div>
          <form onSubmit={ handleSubmit( onSubmit ) }>
            <fieldset>
              <label className="block mb-2 text-md font-medium text-gray-900">
                Username
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img className="w-5 h-5 object-contain" src={ NameFieldImg } />
                </div>
                <input
                  type="email"
                  { ...register( "email" ) }
                  id="input-group-1"
                  className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@flowbite.com"
                />
              </div>
              <p className="text-red-500 text-xs italic">
                { errors.email?.message }
              </p>
            </fieldset>

            {/* <fieldset>
                <label className="block mb-2 text-md font-medium text-gray-900">
                  Company Name
                </label>
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img className="w-5 h-5 object-contain" src={ CompanyFieldImg } />
                  </div>
                  <input
                    type="text"
                    { ...register( "company" ) }
                    id="input-group-1"
                    className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@flowbite.com"
                  />
                </div>
                <p className="text-red-500 text-xs italic">
                  { errors.company?.message }
                </p>
              </fieldset> */}

            <fieldset>
              <label className="block mb-2 text-md font-medium text-gray-900">
                Password
              </label>
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    className="w-5 h-5 object-contain"
                    src={ PasswordFieldImg }
                  />
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={ () => setShowPassword( !showPassword ) }>
                  { !showPassword ?
                    <img className="w-5 h-5 object-contain" src={ EyeImg } /> :
                    <img className="w-5 h-5 object-contain" src={ CloseEyeImg } /> }
                </div>
                <input
                  { ...register( "password" ) }
                  type={ showPassword ? 'text' : 'password' }
                  className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="**********"
                />
              </div>
              <p className="text-red-500 text-xs italic">
                { errors.password?.message }
              </p>
            </fieldset>
            <NavLink
              className="align-baseline font-bold text-sm text-right block text-blue-500 hover:text-blue-800"
              to="/employee/forgot"
            >
              Forgot Password?
            </NavLink>
            <button className="form-submit mt-10" type="submit">
              Log in <img src={ btnNext } />
            </button>
          </form>
          <div className="other-account mt-10">
            <p>Don't have an Account?</p>
            <NavLink to="/employee/signup">Sign up</NavLink>
          </div>
        </div>
      </div>

      <MobileLogin
        { ...MobileLoginData }
      />
    </>
  );
};
