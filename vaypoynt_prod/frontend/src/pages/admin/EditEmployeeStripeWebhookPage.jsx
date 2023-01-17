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

const EditEmployeeStripeWebhookPage = () => {
  const { dispatch } = React.useContext( AuthContext );
  const schema = yup
    .object( {

      stripe_id: yup.string().required(),
      idempotency_key: yup.string().required(),
      description: yup.string().required(),
      event_type: yup.string().required(),
      resource_type: yup.string().required(),
      object: yup.string().required(),
      is_handled: yup.string(),
    } )
    .required();
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const [ fileObj, setFileObj ] = React.useState( {} );
  const navigate = useNavigate();
  const [ stripe_id, setStripeId ] = useState( '' ); const [ idempotency_key, setIdempotencyKey ] = useState( '' ); const [ description, setDescription ] = useState( '' ); const [ event_type, setEventType ] = useState( '' ); const [ resource_type, setResourceType ] = useState( '' ); const [ object, setObject ] = useState( '' ); const [ is_handled, setIsHandled ] = useState( 0 );
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
        sdk.setTable( "stripe_webhook" );
        const result = await sdk.callRestAPI( { id: Number( params?.id ) }, "GET" );
        if ( !result.error ) {

          setValue( 'stripe_id', result.model.stripe_id );
          setValue( 'idempotency_key', result.model.idempotency_key );
          setValue( 'description', result.model.description );
          setValue( 'event_type', result.model.event_type );
          setValue( 'resource_type', result.model.resource_type );
          setValue( 'object', result.model.object );
          setValue( 'is_handled', result.model.is_handled );


          setStripeId( result.model.stripe_id );
          setIdempotencyKey( result.model.idempotency_key );
          setDescription( result.model.description );
          setEventType( result.model.event_type );
          setResourceType( result.model.resource_type );
          setObject( result.model.object );
          setIsHandled( result.model.is_handled );
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
          stripe_id: data.stripe_id,
          idempotency_key: data.idempotency_key,
          description: data.description,
          event_type: data.event_type,
          resource_type: data.resource_type,
          object: data.object,
          is_handled: data.is_handled,
        },
        "PUT"
      );

      if ( !result.error ) {
        showToast( globalDispatch, "Updated" );
        navigate( "/employee/stripe_webhook" );
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
      setError( "stripe_id", {
        type: "manual",
        message: error.message,
      } );
    }
  };
  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "stripe_webhook",
      },
    } );
  }, [] );

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit StripeWebhook</h4>
      <form className=" w-full max-w-lg" onSubmit={ handleSubmit( onSubmit ) }>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="stripe_id"
          >
            Stripe Id
          </label>
          <input
            placeholder="stripe_id"
            { ...register( "stripe_id" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.stripe_id?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.stripe_id?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="idempotency_key"
          >
            Idempotency Key
          </label>
          <input
            placeholder="idempotency_key"
            { ...register( "idempotency_key" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.idempotency_key?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.idempotency_key?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <input
            placeholder="description"
            { ...register( "description" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.description?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.description?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="event_type"
          >
            Event Type
          </label>
          <input
            placeholder="event_type"
            { ...register( "event_type" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.event_type?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.event_type?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="resource_type"
          >
            Resource Type
          </label>
          <input
            placeholder="resource_type"
            { ...register( "resource_type" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.resource_type?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.resource_type?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="object"
          >
            Object
          </label>
          { fileObj[ "object" ] ? (
            isImage( fileObj[ "object" ] ) ? ( <img className={ "preview-image" } src={ fileObj[ "object" ][ "tempURL" ] } ></img>
            ) : (
              <></>
            )
          ) : (
            <></>
          ) }

          <input
            type="file"
            placeholder="object"
            { ...register( "object", { onChange: ( e ) => previewImage( "object", e.target ) } ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.object?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.object?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="is_handled"
          >
            Is Handled
          </label>
          <input
            placeholder="is_handled"
            { ...register( "is_handled" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.is_handled?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.is_handled?.message }
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

export default EditEmployeeStripeWebhookPage;
