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

const ViewEmployeeAnalyticLogPage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );

  const { dispatch } = React.useContext( GlobalContext );
  const [ viewModel, setViewModel ] = React.useState( {} );



  const params = useParams();

  React.useEffect( function () {
    ( async function () {
      try {
        sdk.setTable( "analytic_log" );
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
      <h4 className="text-2xl font-medium">View AnalyticLog</h4>


      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">User Id</div>
          <div className="flex-1">{ viewModel?.user_id }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Url</div>
          <div className="flex-1">{ viewModel?.url }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Path</div>
          <div className="flex-1">{ viewModel?.path }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Hostname</div>
          <div className="flex-1">{ viewModel?.hostname }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Ip</div>
          <div className="flex-1">{ viewModel?.ip }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Role</div>
          <div className="flex-1">{ viewModel?.role }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Browser</div>
          <div className="flex-1">{ viewModel?.browser }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Country</div>
          <div className="flex-1">{ viewModel?.country }</div>
        </div>
      </div>




    </div>
  );
};

export default ViewEmployeeAnalyticLogPage;
