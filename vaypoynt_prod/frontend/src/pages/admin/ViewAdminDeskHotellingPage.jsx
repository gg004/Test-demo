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

const ViewAdminDeskHotellingPage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );

  const { dispatch } = React.useContext( GlobalContext );
  const [ viewModel, setViewModel ] = React.useState( {} );

  const status_typeMapping = { 0: ' Office', 1: ' WFH', 2: ' Vacation', 3: ' Holiday', 4: ' Sick Day', 5: ' Meeting', }


  const params = useParams();

  React.useEffect( function () {
    ( async function () {
      try {
        sdk.setTable( "desk_hotelling" );
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
      <h4 className="text-2xl font-medium">View DeskHotelling</h4>


      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Floor</div>
          <div className="flex-1">{ viewModel?.floor }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">User Id</div>
          <div className="flex-1">{ viewModel?.user_id }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Start Time</div>
          <div className="flex-1">{ viewModel?.start_time }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">End Time</div>
          <div className="flex-1">{ viewModel?.end_time }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Desk Number</div>
          <div className="flex-1">{ viewModel?.desk_number }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Status Type</div>
          <div className="flex-1">{ viewModel?.status_type }</div>
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
          <div className="flex-1">Department Id</div>
          <div className="flex-1">{ viewModel?.department_id }</div>
        </div>
      </div>




    </div>
  );
};

export default ViewAdminDeskHotellingPage;
