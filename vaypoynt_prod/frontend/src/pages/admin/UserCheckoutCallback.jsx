import React, { useState, useReducer } from "react";
import { useLocation, useHref } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { AuthContext } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";

const UserCheckoutCallback = () => {
  const sdk = new MkdSDK();
  const { dispatch, state } = React.useContext( AuthContext );
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const [ callback, setCallback ] = useState();
  const [ checkoutSession, setCheckoutSession ] = useState();
  const search = useLocation().search;

  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "billing",
      },
    } );

    const checkoutCallbackStatus = new URLSearchParams( search ).get( "success" );
    const checkoutCallbackSessionId = new URLSearchParams( search ).get( "session_id" );

    console.log( checkoutCallbackStatus );
    console.log( checkoutCallbackSessionId );
    setCallback( checkoutCallbackStatus === "true" ? true : false );
    setCheckoutSession( checkoutCallbackSessionId );
    /**
     * do a fetch to verify with the backend
     */
  }, [] );
  return <div className="shadow-md rounded mx-auto p-5 text-3xl">{ callback ? "Success" : "Canceled" }</div>;
};

export default UserCheckoutCallback;
