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

// end_time: yup.string().matches( /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}/, "Date Time Format YYYY-MM-DDTHH:MM" ),
const EditAdminDeskHotellingPage = () => {
  const { dispatch } = React.useContext( AuthContext );
  const schema = yup
    .object( {

      floor: yup.string(),
      user_id: yup.string(),
      start_time: yup.string().matches( /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}/, "Date Time Format YYYY-MM-DDTHH:MM" ),
      end_time: yup.string().matches( /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}/, "Date Time Format YYYY-MM-DDTHH:MM" ),
      desk_number: yup.string(),
      status_type: yup.string().required(),
      company_id: yup.string(),
      department_id: yup.string(),
    } )
    .required();
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const [ fileObj, setFileObj ] = React.useState( {} );
  const navigate = useNavigate();
  const [ floor, setFloor ] = useState( 0 ); const [ user_id, setUserId ] = useState( 0 ); const [ start_time, setStartTime ] = useState( '' ); const [ end_time, setEndTime ] = useState( '' ); const [ desk_number, setDeskNumber ] = useState( 0 ); const [ status_type, setStatusType ] = useState( '' ); const [ company_id, setCompanyId ] = useState( 0 ); const [ department_id, setDepartmentId ] = useState( 0 );
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
        sdk.setTable( "desk_hotelling" );
        const result = await sdk.callRestAPI( { id: Number( params?.id ) }, "GET" );
        if ( !result.error ) {

          setValue( 'floor', result.model.floor );
          setValue( 'user_id', result.model.user_id );
          setValue( 'start_time', result.model.start_time );
          setValue( 'end_time', result.model.end_time );
          setValue( 'desk_number', result.model.desk_number );
          setValue( 'status_type', result.model.status_type );
          setValue( 'company_id', result.model.company_id );
          setValue( 'department_id', result.model.department_id );


          setFloor( result.model.floor );
          setUserId( result.model.user_id );
          setStartTime( result.model.start_time );
          setEndTime( result.model.end_time );
          setDeskNumber( result.model.desk_number );
          setStatusType( result.model.status_type );
          setCompanyId( result.model.company_id );
          setDepartmentId( result.model.department_id );
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
          floor: data.floor,
          user_id: data.user_id,
          start_time: data.start_time,
          end_time: data.end_time,
          desk_number: data.desk_number,
          status_type: data.status_type,
          company_id: data.company_id,
          department_id: data.department_id,
        },
        "PUT"
      );

      if ( !result.error ) {
        showToast( globalDispatch, "Updated" );
        navigate( "/admin/desk_hotelling" );
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
      setError( "floor", {
        type: "manual",
        message: error.message,
      } );
    }
  };
  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "desk_hotelling",
      },
    } );
  }, [] );

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit DeskHotelling</h4>
      <form className=" w-full max-w-lg" onSubmit={ handleSubmit( onSubmit ) }>


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
            htmlFor="start_time"
          >
            Start Time
          </label>
          <input
            type="datetime-local"
            placeholder="start_time"
            { ...register( "start_time" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.start_time?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.start_time?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="end_time"
          >
            End Time
          </label>
          <input
            type="datetime-local"
            placeholder="end_time"
            { ...register( "end_time" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.end_time?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.end_time?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="desk_number"
          >
            Desk Number
          </label>
          <input
            placeholder="desk_number"
            { ...register( "desk_number" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.desk_number?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.desk_number?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status_type"
          >
            Status Type
          </label>
          <select
            placeholder="status_type"
            { ...register( "status_type" ) }
            className={ `"shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.status_type?.message ? "border-red-500" : ""
              }` }
          >
            <option></option>
            <option value={ 0 }>office</option>
            <option value={ 1 }>wfh</option>
            <option value={ 2 }>vacation</option>
            <option value={ 3 }>holiday</option>
            <option value={ 4 }>sick day</option>
            <option value={ 5 }>meeting</option>
          </select>
          <p className="text-red-500 text-xs italic">
            { errors.status_type?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="company_id"
          >
            Company Id
          </label>
          <input
            placeholder="company_id"
            { ...register( "company_id" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.company_id?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.company_id?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="department_id"
          >
            Department Id
          </label>
          <input
            placeholder="department_id"
            { ...register( "department_id" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.department_id?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.department_id?.message }
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

export default EditAdminDeskHotellingPage;
