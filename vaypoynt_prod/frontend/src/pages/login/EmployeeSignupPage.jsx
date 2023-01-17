import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import LoginHeader from "Components/LoginHeader";
import {
  btnNext,
  NameFieldImg,
  EmailFieldImg,
  PasswordFieldImg,
  // DepartmentFieldImg,
  // FloorFieldImg,
  TitleFieldImg,
  LocationFieldImg,
  PhoneImg,
} from "Assets/images";
import { InteractiveButton } from "Components/InteractiveButton";
import MkdSDK from "Utils/MkdSDK";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AuthContext, tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";
import { isImage } from "Utils/utils";

const sdk = new MkdSDK()
const EmployeeSignupPage = () => {



  const navigate = useNavigate()

  const { dispatch: authDispatch } = useContext( AuthContext )
  const { dispatch: globalDispatch } = useContext( GlobalContext )

  const [ registerLoading, setRegisterLoading ] = useState( false )
  const [ file, setFile ] = useState( null )
  const [ fileObj, setFileObj ] = React.useState( {} );
  const schema = yup
    .object( {
      first_name: yup.string().required(),
      last_name: yup.string().required(),
      email: yup.string().required(),
      address: yup.string().required(),
      title: yup.string().required(),
      phone: yup.string().required(),
      password: yup.string().required(),
      confirm_password: yup.string().required().oneOf( [ yup.ref( 'password' ), null ], 'Passwords must match' ),
      employee_logo: yup.string().required(),
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

  const previewImage = ( field, target ) => {
    let tempFileObj = fileObj;
    const file = handleUpload( target.files[ 0 ] )
    tempFileObj[ field ] = {
      file: target.files[ 0 ],
      tempURL: URL.createObjectURL( target.files[ 0 ] ),
    };
    setFile( file )
    setFileObj( { ...tempFileObj } );
  };

  const onSubmit = async ( data ) => {
    const formData = new FormData()

    console.log( file )
    formData.append( "first_name", data.first_name )
    formData.append( "last_name", data.last_name )
    formData.append( "email", data.email )
    formData.append( "address", data.address )
    formData.append( "title", data.title )
    formData.append( "phone", data.phone )
    formData.append( "password", data.password )
    formData.append( "file", file )
    // formData.append( "employee_logo", data.employee_logo )


    try {
      setRegisterLoading( true )
      const result = await sdk.registerEmployee( formData )
      if ( !result?.error ) {
        showToast( globalDispatch, "Account Created Successfully" );
        authDispatch( {
          type: "LOGIN",
          payload: result
        } )
        setRegisterLoading( false )
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
      setRegisterLoading( false )
      console.log( "Error", error );
      setError( "employee_logo", {
        type: "manual",
        message: error.response?.data?.message ? error.response?.data?.message : error.message,
      } );
      tokenExpireError( authDispatch, error.message );
    }
  };

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
      <div className="container pb-10">
        <form onSubmit={ handleSubmit( onSubmit ) }>
          <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-x-20 mt-4">

            <fieldset className="cus-input">
              <label
                htmmlFor="input-group-1"
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
                  id="input-group-1"
                  { ...register( "first_name" ) }
                  className={ `bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${ errors.first_name?.message ? "border-red-500" : ""
                    }` }
                  placeholder="James"
                />
              </div>
              <p className="text-red-500 text-xs italic">
                { errors.first_name?.message }
              </p>
            </fieldset>

            <fieldset className="cus-input">
              <label
                htmmlFor="input-group-1"
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
                  type="text"
                  id="input-group-1"
                  { ...register( "last_name" ) }
                  className={ `bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${ errors.last_name?.message ? "border-red-500" : ""
                    }` }
                  placeholder="Gorden
                  "
                />
              </div>

              <p className="text-red-500 text-xs italic">
                { errors.last_name?.message }
              </p>
            </fieldset>

            <fieldset className="cus-input">
              <label
                htmmlFor="input-group-1"
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
                  { ...register( "email" ) }
                  id="input-group-1"
                  className={ `bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${ errors.email?.message ? "border-red-500" : ""
                    }` }
                  placeholder="name@flowbite.com"
                />
              </div>
              <p className="text-red-500 text-xs italic">
                { errors.email?.message }
              </p>
            </fieldset>

            <fieldset className="cus-input">
              <label
                htmmlFor="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Password
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    className="w-5 h-5 object-contain"
                    src={ PasswordFieldImg }
                  />
                </div>
                <input
                  type="password"
                  { ...register( "password" ) }
                  id="input-group-1"
                  className={ `bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${ errors.password?.message ? "border-red-500" : ""
                    }` }
                  placeholder=""
                />
              </div>
              <p className="text-red-500 text-xs italic">
                { errors.password?.message }
              </p>
            </fieldset>

            <fieldset className="cus-input">
              <label
                htmmlFor="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Confirm Password
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    className="w-5 h-5 object-contain"
                    src={ PasswordFieldImg }
                  />
                </div>
                <input
                  type="password"
                  { ...register( "confirm_password" ) }
                  id="input-group-1"
                  className={ `bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${ errors.confirm_password?.message ? "border-red-500" : ""
                    }` }
                  placeholder=""
                />
              </div>
              <p className="text-red-500 text-xs italic">
                { errors.confirm_password?.message }
              </p>
            </fieldset>

            <fieldset className="cus-input">
              <label
                htmmlFor="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Title
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    className="w-5 h-5 object-contain"
                    src={ TitleFieldImg }
                  />
                </div>
                <input
                  type="text"
                  { ...register( "title" ) }
                  id="input-group-1"
                  className={ `bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${ errors.title?.message ? "border-red-500" : ""
                    }` }
                  placeholder=""
                />
              </div>
              <p className="text-red-500 text-xs italic">
                { errors.title?.message }
              </p>
            </fieldset>

            <fieldset className="cus-input">
              <label
                htmmlFor="input-group-1"
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
                  type="text"
                  { ...register( "address" ) }
                  id="input-group-1"
                  className={ `bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${ errors.address?.message ? "border-red-500" : ""
                    }` }
                  placeholder=""
                />
              </div>
              <p className="text-red-500 text-xs italic">
                { errors.address?.message }
              </p>
            </fieldset>

            <fieldset className="cus-input">
              <label
                htmmlFor="phone"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Phone
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img
                    className="w-5 h-5 object-contain"
                    src={ PhoneImg }
                  />
                </div>
                <input
                  type="tel"
                  { ...register( "phone" ) }
                  id="phone"
                  className={ `bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${ errors.phone?.message ? "border-red-500" : ""
                    }` }
                  placeholder=""
                />
              </div>
              <p className="text-red-500 text-xs italic">
                { errors.phone?.message }
              </p>
            </fieldset>


            <fieldset className="cus-input">
              <label className="block mb-2 text-md font-medium text-gray-900">
                Upload Profile Photo
              </label>
              { fileObj[ "employee_logo" ] ? (
                isImage( fileObj[ "employee_logo" ] ) ? ( <img className={ `h-[100px] w-[100px] mb-3 preview-image rounded-full` } src={ fileObj[ "employee_logo" ][ "tempURL" ] } ></img>
                ) : (
                  <></>
                )
              ) : (
                <></>
              ) }
              <label className="block">
                <span className="sr-only">Choose File</span>
                <input
                  type="file"
                  required
                  accept="image/png,image/jpg,image/jpeg"
                  { ...register( "employee_logo", { onChange: ( e ) => previewImage( "employee_logo", e.target ) } ) }
                  className={ `block mb-12 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100${ errors.employee_logo?.message ? "border-red-500" : ""
                    }` }
                // onChange={ capturePhoto }
                />
              </label>
              {/* <img ref={imageRef} src="" alt="" /> */ }
              <p className="text-red-500 text-xs italic">
                { errors.employee_logo?.message }
              </p>
            </fieldset>


          </div>
          <div className={ `w-1/3 m-auto` }>

            <InteractiveButton loading={ registerLoading } className="form-submit mt-4 mb-4 col-span-full" type="submit">
              submit <img src={ btnNext } />
            </InteractiveButton>
          </div>
        </form>

        <div className="other-account">
          <p>Already have an Account?</p>
          <NavLink to="/employee/login">Login</NavLink>
        </div>
      </div>
    </>
  );
};

export default EmployeeSignupPage;
