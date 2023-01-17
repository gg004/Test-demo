import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import { tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";
import { isImage } from "Utils/utils";

let sdk = new MkdSDK();

const ViewAdminEmployeeProfilePage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );

  const { dispatch } = React.useContext( GlobalContext );
  const [ viewModel, setViewModel ] = React.useState( {} );



  const params = useParams();

  React.useEffect( function () {
    ( async function () {
      try {
        sdk.setTable( "employee_profile" );
        const result = await sdk.callRestAPI( { id: Number( params?.id ) }, "GET" );
        if ( !result.error ) {

          setViewModel( result.model );

        }
      } catch ( error ) {
        console.log( "error", error );
        tokenExpireError( dispatch, error.message );
      }
    } )();
  }, [] );
  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">View EmployeeProfile</h4>


      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">User Id</div>
          <div className="flex-1">{ viewModel?.user_id }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">First Name</div>
          <div className="flex-1">{ viewModel?.first_name }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Last Name</div>
          <div className="flex-1">{ viewModel?.last_name }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Company Id</div>
          <div className="flex-1">{ viewModel?.company_id }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Title</div>
          <div className="flex-1">{ viewModel?.title }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Department Id</div>
          <div className="flex-1">{ viewModel?.department_id }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Floor</div>
          <div className="flex-1">{ viewModel?.floor }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Address</div>
          <div className="flex-1">{ viewModel?.address }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Profile Photo</div>
          <div className="flex-1">
            <a href={ viewModel?.profile_photo }>View</a>
          </div>
        </div>
      </div>




    </div>
  );
};

export default ViewAdminEmployeeProfilePage;
