import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";
import { isImage } from "Utils/utils";

const AddCompanyEmployeeProfilePage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const schema = yup
    .object( {

      user_id: yup.string(),
      first_name: yup.string().required(),
      last_name: yup.string().required(),
      company_id: yup.string(),
      title: yup.string().required(),
      department_id: yup.string(),
      floor: yup.string(),
      address: yup.string().required(),
      profile_photo: yup.string().required(),
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

      sdk.setTable( "employee_profile" );

      const result = await sdk.callRestAPI(
        {

          user_id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          company_id: data.company_id,
          title: data.title,
          department_id: data.department_id,
          floor: data.floor,
          address: data.address,
          profile_photo: data.profile_photo,
        },
        "POST"
      );
      if ( !result.error ) {
        showToast( globalDispatch, "Added" );
        navigate( "/company/employee_profile" );
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
      tokenExpireError( dispatch, error.message );
    }
  };

  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "employee_profile",
      },
    } );
  }, [] );

  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add EmployeeProfile</h4>
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
            htmlFor="title"
          >
            Title
          </label>
          <input
            placeholder="title"
            { ...register( "title" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.title?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.title?.message }
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
            htmlFor="profile_photo"
          >
            Profile Photo
          </label>
          { fileObj[ "profile_photo" ] ? (
            isImage( fileObj[ "profile_photo" ] ) ? ( <img className={ "preview-image" } src={ fileObj[ "profile_photo" ][ "tempURL" ] } ></img>
            ) : (
              <></>
            )
          ) : (
            <></>
          ) }

          <input
            type="file"
            placeholder="profile_photo"
            { ...register( "profile_photo", { onChange: ( e ) => previewImage( "profile_photo", e.target ) } ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.profile_photo?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">
            { errors.profile_photo?.message }
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

export default AddCompanyEmployeeProfilePage;
