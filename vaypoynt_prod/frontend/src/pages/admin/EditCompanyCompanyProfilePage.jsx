import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { GlobalContext, showToast } from "../../globalContext";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../../authContext";
import { isImage } from "Utils/utils";

let sdk = new MkdSDK();

const EditCompanyCompanyProfilePage = () => {
  const { dispatch } = React.useContext( AuthContext );
  const schema = yup
    .object( {

      user_id: yup.string().required(),
      first_name: yup.string().required(),
      last_name: yup.string().required(),
      email: yup.string().required(),
      company_logo: yup.string().required(),
      address: yup.string().required(),
      comapny_name: yup.string().required(),
    } )
    .required();
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const [ fileObj, setFileObj ] = React.useState( {} );
  const navigate = useNavigate();
  const [ user_id, setUserId ] = useState( '' ); const [ first_name, setFirstName ] = useState( '' ); const [ last_name, setLastName ] = useState( '' ); const [ email, setEmail ] = useState( '' ); const [ company_logo, setCompanyLogo ] = useState( '' ); const [ address, setAddress ] = useState( '' ); const [ comapny_name, setComapnyName ] = useState( '' );
  const [ id, setId ] = useState( 0 );
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm( {
    resolver: yupResolver( schema ),
  } );

  const params = useParams();

  useEffect( function () {
    ( async function () {
      try {
        sdk.setTable( "company_profile" );
        const result = await sdk.callRestAPI( { id: Number( params?.id ) }, "GET" );
        if ( !result.error ) {

          setValue( 'user_id', result.model.user_id );
          setValue( 'first_name', result.model.first_name );
          setValue( 'last_name', result.model.last_name );
          setValue( 'email', result.model.email );
          setValue( 'company_logo', result.model.company_logo );
          setValue( 'address', result.model.address );
          setValue( 'comapny_name', result.model.comapny_name );


          setUserId( result.model.user_id );
          setFirstName( result.model.first_name );
          setLastName( result.model.last_name );
          setEmail( result.model.email );
          setCompanyLogo( result.model.company_logo );
          setAddress( result.model.address );
          setComapnyName( result.model.comapny_name );
          setId( result.model.id );
        }
      } catch ( error ) {
        console.log( "error", error );
        tokenExpireError( dispatch, error.message );
      }
    } )();
  }, [] );

  const previewImage = ( field, target ) => {
    let tempFileObj = fileObj;
    tempFileObj[ field ] = {
      file: target.files[ 0 ],
      tempURL: URL.createObjectURL( target.files[ 0 ] ),
    };
    setFileObj( { ...tempFileObj } );
  };


  const onSubmit = async ( data ) => {
    try {
      for ( let item in fileObj ) {
        let uploadResult = await sdk.upload( fileObj[ item ].file );
        data[ item ] = uploadResult.url;
      }
      const result = await sdk.callRestAPI(
        {
          id: id,
          user_id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          company_logo: data.company_logo,
          address: data.address,
          comapny_name: data.comapny_name,
        },
        "PUT"
      );

      if ( !result.error ) {
        showToast( globalDispatch, "Updated" );
        navigate( "/company/company_profile" );
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
      setError( "user_id", {
        type: "manual",
        message: error.message,
      } );
    }
  };
  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "company_profile",
      },
    } );
  }, [] );

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit CompanyProfile</h4>
      <form className=" w-full max-w-lg" onSubmit={ handleSubmit( onSubmit ) }>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="user_id"
          >
            User Id
          </label>
          <input
            placeholder="user_id"
            { ...register( "user_id" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.user_id?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.user_id?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="first_name"
          >
            First Name
          </label>
          <input
            placeholder="first_name"
            { ...register( "first_name" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.first_name?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.first_name?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="last_name"
          >
            Last Name
          </label>
          <input
            placeholder="last_name"
            { ...register( "last_name" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.last_name?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.last_name?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            placeholder="email"
            { ...register( "email" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.email?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.email?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="company_logo"
          >
            Company Logo
          </label>
          { fileObj[ "company_logo" ] ? (
            isImage( fileObj[ "company_logo" ] ) ? ( <img className={ "preview-image" } src={ fileObj[ "company_logo" ][ "tempURL" ] } ></img>
            ) : (
              <></>
            )
          ) : (
            <></>
          ) }

          <input
            type="file"
            placeholder="company_logo"
            { ...register( "company_logo", { onChange: ( e ) => previewImage( "company_logo", e.target ) } ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.company_logo?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.company_logo?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="address"
          >
            Address
          </label>
          <input
            placeholder="address"
            { ...register( "address" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.address?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.address?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="comapny_name"
          >
            Comapny Name
          </label>
          <input
            placeholder="comapny_name"
            { ...register( "comapny_name" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.comapny_name?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.comapny_name?.message }
          </p>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditCompanyCompanyProfilePage;
