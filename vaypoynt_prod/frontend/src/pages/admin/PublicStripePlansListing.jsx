import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { AuthContext } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";

// import StripeRegisterSubscribeComponent from "../../components/StripeRegisterSubscribeComponent";

const UserBillingPage = () => {
  const sdk = new MkdSDK();
  const { dispatch, state } = React.useContext( AuthContext );
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );

  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {},
    } );
  }, [] );

  return (
    <div className="shadow-md bg-slate-200 rounded mx-auto p-5">
      {/* <StripeRegisterSubscribeComponent></StripeRegisterSubscribeComponent> */ }
    </div>
  );
};

export default UserBillingPage;
