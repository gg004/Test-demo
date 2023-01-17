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

const ViewEmployeeStripeSubscriptionPage = () => {
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );

  const { dispatch } = React.useContext( GlobalContext );
  const [ viewModel, setViewModel ] = React.useState( {} );



  const params = useParams();

  React.useEffect( function () {
    ( async function () {
      try {
        sdk.setTable( "stripe_subscription" );
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
      <h4 className="text-2xl font-medium">View StripeSubscription</h4>


      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Stripe Id</div>
          <div className="flex-1">{ viewModel?.stripe_id }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Price Id</div>
          <div className="flex-1">{ viewModel?.price_id }</div>
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
          <div className="flex-1">Object</div>
          <div className="flex-1">
            <a href={ viewModel?.object }>View</a>
          </div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Status</div>
          <div className="flex-1">{ viewModel?.status }</div>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="flex mb-4">
          <div className="flex-1">Is Lifetime</div>
          <div className="flex-1">{ viewModel?.is_lifetime }</div>
        </div>
      </div>




    </div>
  );
};

export default ViewEmployeeStripeSubscriptionPage;
