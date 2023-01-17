import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";
import { isImage } from "Utils/utils";

const AddAdminStripeSettingPage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const schema = yup
    .object( {

      key: yup.string().required(),
      value: yup.string().required(),
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

      sdk.setTable( "stripe_setting" );

      const result = await sdk.callRestAPI(
        {

          key: data.key,
          value: data.value,
        },
        "POST"
      );
      if ( !result.error ) {
        showToast( globalDispatch, "Added" );
        navigate( "/admin/stripe_setting" );
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
      setError( "key", {
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
        path: "stripe_setting",
      },
    } );
  }, [] );

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add StripeSetting</h4>
      <form className=" w-full max-w-lg" onSubmit={ handleSubmit( onSubmit ) }>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="key"
          >
            Key
          </label>
          <input
            placeholder="key"
            { ...register( "key" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.key?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.key?.message }
          </p>
        </div>


        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="value"
          >
            Value
          </label>
          <textarea
            placeholder="value"
            { ...register( "value" ) }
            className={ `"shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${ errors.value?.message ? "border-red-500" : ""
              }` }
            rows={ 15 }
          ></textarea>
          <p className="text-red-500 text-xs italic">
            { errors.value?.message }
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

export default AddAdminStripeSettingPage;
