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

const EditAdminAnalyticLogPage = () => {
  const { dispatch } = React.useContext( AuthContext );
  const schema = yup
    .object( {

      user_id: yup.string(),
      url: yup.string().required(),
      path: yup.string().required(),
      hostname: yup.string().required(),
      ip: yup.string().required(),
      role: yup.string().required(),
      browser: yup.string().required(),
      country: yup.string().required(),
    } )
    .required();
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const [ fileObj, setFileObj ] = React.useState( {} );
  const navigate = useNavigate();
  const [ user_id, setUserId ] = useState( 0 ); const [ url, setUrl ] = useState( '' ); const [ path, setPath ] = useState( '' ); const [ hostname, setHostname ] = useState( '' ); const [ ip, setIp ] = useState( '' ); const [ role, setRole ] = useState( '' ); const [ browser, setBrowser ] = useState( '' ); const [ country, setCountry ] = useState( '' );
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
        sdk.setTable( "analytic_log" );
        const result = await sdk.callRestAPI( { id: Number( params?.id ) }, "GET" );
        if ( !result.error ) {

          setValue( 'user_id', result.model.user_id );
          setValue( 'url', result.model.url );
          setValue( 'path', result.model.path );
          setValue( 'hostname', result.model.hostname );
          setValue( 'ip', result.model.ip );
          setValue( 'role', result.model.role );
          setValue( 'browser', result.model.browser );
          setValue( 'country', result.model.country );


          setUserId( result.model.user_id );
          setUrl( result.model.url );
          setPath( result.model.path );
          setHostname( result.model.hostname );
          setIp( result.model.ip );
          setRole( result.model.role );
          setBrowser( result.model.browser );
          setCountry( result.model.country );
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
          url: data.url,
          path: data.path,
          hostname: data.hostname,
          ip: data.ip,
          role: data.role,
          browser: data.browser,
          country: data.country,
        },
        "PUT"
      );

      if ( !result.error ) {
        showToast( globalDispatch, "Updated" );
        navigate( "/admin/analytic_log" );
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
        path: "analytic_log",
      },
    } );
  }, [] );

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit AnalyticLog</h4>
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
            htmlFor="url"
          >
            Url
          </label>
          <textarea
            placeholder="url"
            { ...register( "url" ) }
            className={ `"shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${ errors.url?.message ? "border-red-500" : ""
              }` }
            rows={ 15 }
          ></textarea>
          <p className="text-red-500 text-xs italic">
            { errors.url?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="path"
          >
            Path
          </label>
          <textarea
            placeholder="path"
            { ...register( "path" ) }
            className={ `"shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${ errors.path?.message ? "border-red-500" : ""
              }` }
            rows={ 15 }
          ></textarea>
          <p className="text-red-500 text-xs italic">
            { errors.path?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="hostname"
          >
            Hostname
          </label>
          <textarea
            placeholder="hostname"
            { ...register( "hostname" ) }
            className={ `"shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${ errors.hostname?.message ? "border-red-500" : ""
              }` }
            rows={ 15 }
          ></textarea>
          <p className="text-red-500 text-xs italic">
            { errors.hostname?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="ip"
          >
            Ip
          </label>
          <input
            placeholder="ip"
            { ...register( "ip" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.ip?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.ip?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="role"
          >
            Role
          </label>
          <input
            placeholder="role"
            { ...register( "role" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.role?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.role?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="browser"
          >
            Browser
          </label>
          <input
            placeholder="browser"
            { ...register( "browser" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.browser?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.browser?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="country"
          >
            Country
          </label>
          <input
            placeholder="country"
            { ...register( "country" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.country?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.country?.message }
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

export default EditAdminAnalyticLogPage;
