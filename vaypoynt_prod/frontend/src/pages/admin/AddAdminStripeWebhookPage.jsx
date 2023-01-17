import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";
import { isImage } from "Utils/utils";

const AddAdminStripeWebhookPage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
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

  const { dispatch } = React.useContext( GlobalContext );
  const [ fileObj, setFileObj ] = React.useState( {} );

  const navigate = useNavigate();
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
    tempFileObj[ field ] = {
      file: target.files[ 0 ],
      tempURL: URL.createObjectURL( target.files[ 0 ] ),
    };
    setFileObj( { ...tempFileObj } );
  };

  const onSubmit = async ( data ) => {
    let sdk = new MkdSDK();

    try {
      for ( let item in fileObj ) {
        let uploadResult = await sdk.upload( fileObj[ item ].file );
        data[ item ] = uploadResult.url;
      }

      sdk.setTable( "stripe_webhook" );

      const result = await sdk.callRestAPI(
        {

          stripe_id: data.stripe_id,
          idempotency_key: data.idempotency_key,
          description: data.description,
          event_type: data.event_type,
          resource_type: data.resource_type,
          object: data.object,
          is_handled: data.is_handled,
        },
        "POST"
      );
      if ( !result.error ) {
        showToast( globalDispatch, "Added" );
        navigate( "/admin/stripe_webhook" );
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
      tokenExpireError( dispatch, error.message );
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
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add StripeWebhook</h4>
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

export default AddAdminStripeWebhookPage;
