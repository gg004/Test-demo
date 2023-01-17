import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";

const AddAdminEmployeeProfilePage = () => {
  const schema = yup
    .object( {
      email: yup.string().email().required(),
      password: yup.string().required(),
      // role: yup.string(),
    } )
    .required();

  const { dispatch } = React.useContext( GlobalContext );
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm( {
    resolver: yupResolver( schema ),
  } );

  // const selectRole = [
  //   { name: "role", value: "admin" },
  //   { name: "role", value: "company" },
  //   { name: "role", value: "employee" },
  // ];

  /**
   *
   *
   * Use /user/put to update user remaining info after registration success
   * use /profile/put to update profile info
   */
  const onSubmit = async ( data ) => {
    let sdk = new MkdSDK();

    try {
      const result = await sdk.createUser( data.email, data.password, "employee" );
      if ( !result.error ) {
        showToast( dispatch, "Added" );
        navigate( "/admin/employee" );
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
      setError( "email", {
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
        path: "users",
      },
    } );
  }, [] );
  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add Employee</h4>
      <form
        className=" w-full max-w-lg"
        onSubmit={ handleSubmit( onSubmit ) }
      >
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            { ...register( "email" ) }
            className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.email?.message ? "border-red-500" : "" }` }
          />
          <p className="text-red-500 text-xs italic">{ errors.email?.message }</p>
        </div>
        {/* <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
          <select
            name="role"
            id="role"
            className="shadow border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            { ...register( "role" ) }
          >
            { selectRole.map( ( option ) => (
              <option
                name={ option.name }
                value={ option.value }
                key={ option.value }
                defaultValue={ option.value === "client" }
              >
                { option.value }
              </option>
            ) ) }
          </select>
        </div> */}
        <div className="mb-5">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            placeholder="******************"
            { ...register( "password" ) }
            className={ `shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${ errors.password?.message ? "border-red-500" : ""
              }` }
          />
          <p className="text-red-500 text-xs italic">{ errors.password?.message }</p>
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

export default AddAdminEmployeeProfilePage;
