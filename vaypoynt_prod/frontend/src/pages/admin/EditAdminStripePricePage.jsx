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

const EditAdminStripePricePage = () => {
  const { dispatch } = React.useContext( AuthContext );
  const schema = yup
    .object( {

      name: yup.string().required(),
      product_id: yup.string(),
      stripe_id: yup.string().required(),
      is_usage_metered: yup.string(),
      usage_limit: yup.string(),
      object: yup.string().required(),
      amount: yup.number().required(),
      trial_days: yup.string(),
      type: yup.string().required(),
      status: yup.string(),
    } )
    .required();
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const [ fileObj, setFileObj ] = React.useState( {} );
  const navigate = useNavigate();
  const [ name, setName ] = useState( '' ); const [ product_id, setProductId ] = useState( 0 ); const [ stripe_id, setStripeId ] = useState( '' ); const [ is_usage_metered, setIsUsageMetered ] = useState( 0 ); const [ usage_limit, setUsageLimit ] = useState( 0 ); const [ object, setObject ] = useState( '' ); const [ amount, setAmount ] = useState( 0 ); const [ trial_days, setTrialDays ] = useState( 0 ); const [ type, setType ] = useState( '' ); const [ status, setStatus ] = useState( 0 );
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
        sdk.setTable( "stripe_price" );
        const result = await sdk.callRestAPI( { id: Number( params?.id ) }, "GET" );
        if ( !result.error ) {

          setValue( 'name', result.model.name );
          setValue( 'product_id', result.model.product_id );
          setValue( 'stripe_id', result.model.stripe_id );
          setValue( 'is_usage_metered', result.model.is_usage_metered );
          setValue( 'usage_limit', result.model.usage_limit );
          setValue( 'object', result.model.object );
          setValue( 'amount', result.model.amount );
          setValue( 'trial_days', result.model.trial_days );
          setValue( 'type', result.model.type );
          setValue( 'status', result.model.status );


          setName( result.model.name );
          setProductId( result.model.product_id );
          setStripeId( result.model.stripe_id );
          setIsUsageMetered( result.model.is_usage_metered );
          setUsageLimit( result.model.usage_limit );
          setObject( result.model.object );
          setAmount( result.model.amount );
          setTrialDays( result.model.trial_days );
          setType( result.model.type );
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
          name: data.name,
          product_id: data.product_id,
          stripe_id: data.stripe_id,
          is_usage_metered: data.is_usage_metered,
          usage_limit: data.usage_limit,
          object: data.object,
          amount: data.amount,
          trial_days: data.trial_days,
          type: data.type,
          status: data.status,
        },
        "PUT"
      );

      if ( !result.error ) {
        showToast( globalDispatch, "Updated" );
        navigate( "/admin/stripe_price" );
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
      setError( "name", {
        type: "manual",
        message: error.message,
      } );
    }
  };
  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "stripe_price",
      },
    } );
  }, [] );

  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit StripePrice</h4>
      <form className=" w-full max-w-lg" onSubmit={ handleSubmit( onSubmit ) }>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            placeholder="name"
            { ...register( "name" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.name?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.name?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="product_id"
          >
            Product Id
          </label>
          <input
            placeholder="product_id"
            { ...register( "product_id" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.product_id?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.product_id?.message }
          </p>
        </div>


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
            htmlFor="is_usage_metered"
          >
            Is Usage Metered
          </label>
          <input
            placeholder="is_usage_metered"
            { ...register( "is_usage_metered" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.is_usage_metered?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.is_usage_metered?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="usage_limit"
          >
            Usage Limit
          </label>
          <input
            placeholder="usage_limit"
            { ...register( "usage_limit" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.usage_limit?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.usage_limit?.message }
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
            htmlFor="amount"
          >
            Amount
          </label>
          <input
            placeholder="amount"
            { ...register( "amount" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.amount?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.amount?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="trial_days"
          >
            Trial Days
          </label>
          <input
            placeholder="trial_days"
            { ...register( "trial_days" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.trial_days?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.trial_days?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="type"
          >
            Type
          </label>
          <input
            placeholder="type"
            { ...register( "type" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.type?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.type?.message }
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

export default EditAdminStripePricePage;
