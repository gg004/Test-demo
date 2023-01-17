import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { NavLink } from "react-router-dom";
import { GlobalContext, showToast } from "../../globalContext";
import LoginHeader from "Components/LoginHeader";
import {
  btnNext,
  EmailFieldImg,
} from "Assets/images";

const CompanyForgotPage = () => {
  const schema = yup
    .object( {
      email: yup.string().email().required(),
    } )
    .required();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm( {
    resolver: yupResolver( schema ),
  } );

  const { dispatch } = React.useContext( GlobalContext );

  const onSubmit = async ( data ) => {
    let sdk = new MkdSDK();
    try {
      const result = await sdk.forgot( data.email );

      if ( !result.error ) {
        showToast( dispatch, "Reset Code Sent" );
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

  return (
    <>
      {/* <div className="w-full max-w-xs mx-auto">
        <form
          onSubmit={ handleSubmit( onSubmit ) }
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 "
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              { ...register( "email" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.email?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.email?.message }
            </p>
          </div>

          <div className="flex items-center justify-between">
            <input
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              value="Forgot Password"
            />
            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              to="/company/login"
            >
              Login?
            </Link>
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs">
          &copy; { new Date().getFullYear() } manaknightdigital inc. All rights
          reserved.
        </p>
      </div> */}




<div className="main-login-holder">
        <div className="login-content">
          <LoginHeader />
          <h2>Forgot Password</h2>


          <form 
          className="mt-4"
          onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label className="block mb-2 text-md font-medium text-gray-900">
                Email
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img className="w-5 h-5 object-contain" src={EmailFieldImg} />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  id="input-group-1"
                  className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@flowbite.com"
                />
              </div>
              <p className="text-red-500 text-xs italic">
                {errors.email?.message}
              </p>
            </fieldset>

            <button className="form-submit mt-10" type="submit">
            Forgot Password? <img src={btnNext} />
            </button>
          </form>

          <div className="other-account mt-4">
            <p>Remember Your Password?</p>
            <NavLink to="/company/login">Login</NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyForgotPage;
