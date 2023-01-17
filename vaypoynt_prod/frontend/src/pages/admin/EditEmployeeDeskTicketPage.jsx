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

const EditEmployeeDeskTicketPage = () => {
  const { dispatch } = React.useContext( AuthContext );
  const schema = yup
    .object( {

      user_id: yup.string(),
      floor: yup.string(),
      section: yup.string().required(),
      start: yup.string(),
      end: yup.string(),
      status: yup.string(),
    } )
    .required();
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const [ fileObj, setFileObj ] = React.useState( {} );
  const navigate = useNavigate();
  const [ user_id, setUserId ] = useState( 0 ); const [ floor, setFloor ] = useState( 0 ); const [ section, setSection ] = useState( '' ); const [ start, setStart ] = useState( 0 ); const [ end, setEnd ] = useState( 0 ); const [ status, setStatus ] = useState( 0 );
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
        sdk.setTable( "desk_ticket" );
        const result = await sdk.callRestAPI( { id: Number( params?.id ) }, "GET" );
        if ( !result.error ) {

          setValue( 'user_id', result.model.user_id );
          setValue( 'floor', result.model.floor );
          setValue( 'section', result.model.section );
          setValue( 'start', result.model.start );
          setValue( 'end', result.model.end );
          setValue( 'status', result.model.status );


          setUserId( result.model.user_id );
          setFloor( result.model.floor );
          setSection( result.model.section );
          setStart( result.model.start );
          setEnd( result.model.end );
          setStatus( result.model.status );
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
          floor: data.floor,
          section: data.section,
          start: data.start,
          end: data.end,
          status: data.status,
        },
        "PUT"
      );

      if ( !result.error ) {
        showToast( globalDispatch, "Updated" );
        navigate( "/employee/desk_ticket" );
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
        path: "desk_ticket",
      },
    } );
  }, [] );

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit DeskTicket</h4>
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
            htmlFor="floor"
          >
            Floor
          </label>
          <input
            placeholder="floor"
            { ...register( "floor" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.floor?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.floor?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="section"
          >
            Section
          </label>
          <input
            placeholder="section"
            { ...register( "section" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.section?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.section?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="start"
          >
            Start
          </label>
          <input
            placeholder="start"
            { ...register( "start" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.start?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.start?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="end"
          >
            End
          </label>
          <input
            placeholder="end"
            { ...register( "end" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.end?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.end?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Status
          </label>
          <input
            placeholder="status"
            { ...register( "status" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.status?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.status?.message }
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

export default EditEmployeeDeskTicketPage;
