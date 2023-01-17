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

const ViewEmployeeStripeSettingPage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );

  const { dispatch } = React.useContext( GlobalContext );
  const [ viewModel, setViewModel ] = React.useState( {} );



  const params = useParams();

  React.useEffect( function () {
    ( async function () {
      try {
        sdk.setTable( "stripe_setting" );
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
      <h4 className="text-2xl font-medium">View StripeSetting</h4>


      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Key</div>
          <div className="flex-1">{ viewModel?.key }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Value</div>
          <div className="flex-1">{ viewModel?.value }</div>
        </div>
      </div>




    </div>
  );
};

export default ViewEmployeeStripeSettingPage;
