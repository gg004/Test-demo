import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { AuthContext } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";

// import StripeCardComponent from "../../components/StripeCardComponent";
// import StripePlansComponent from "../../components/StripePlansComponent";
// import StripeSubscriptionComponent from "../../components/StripeSubscriptionComponent";
// import StripeOnetimeProductsComponent from "../../components/StripeOnetimeProductsComponent";
// import StripeInvoicesComponent from "../../components/StripeInvoicesComponent";
// import StripeChargesComponent from "../../components/StripeChargesComponent";
// import StripeOrdersComponent from "../../components/StripeOrdersComponent";

const UserBillingPage = () => {
  const sdk = new MkdSDK();
  const { dispatch, state } = React.useContext( AuthContext );
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );

  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "billing",
      },
    } );
  }, [] );

  return (
    <div className="shadow-md bg-slate-200 rounded mx-auto p-5">
      {/* <StripeCardComponent></StripeCardComponent>
      <StripePlansComponent></StripePlansComponent>
      <StripeSubscriptionComponent></StripeSubscriptionComponent>
      <StripeOnetimeProductsComponent></StripeOnetimeProductsComponent>
      <StripeInvoicesComponent></StripeInvoicesComponent>
      <StripeOrdersComponent></StripeOrdersComponent> */}
    </div>
  );
};

export default UserBillingPage;
