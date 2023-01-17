import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";

const AddCompanyDepartmentPage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const schema = yup
    .object( {

      name: yup.string().required(),
      company_id: yup.string(),
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

      sdk.setTable( "department" );

      const result = await sdk.callRestAPI(
        {

          name: data.name,
          company_id: data.company_id,
        },
        "POST"
      );
      if ( !result.error ) {
        showToast( globalDispatch, "Added" );
        navigate( "/company/department" );
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
      tokenExpireError( dispatch, error.message );
    }
  };

  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "department",
      },
    } );
  }, [] );

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add Department</h4>
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

export default AddCompanyDepartmentPage;
