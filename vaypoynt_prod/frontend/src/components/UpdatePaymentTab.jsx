import React, { useState } from "react";
import { PaymentIcon1, PaymentIcon2, PaymentIcon3 } from "Assets/images";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import MkdSDK from "Utils/MkdSDK";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext";
const sdk = new MkdSDK();
const UpdatePaymentTab = () => {
  const navigate = useNavigate();
  const {

    dispatch
  } = React.useContext( AuthContext );
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardError, serCardError] = useState("");
  const getCardToken = async () => {
    setIsLoading(true)
    const cardElem = elements.getElement("card");
    const tokenResult = await stripe.createToken(cardElem);
    if (tokenResult.error) {
      serCardError(tokenResult.error.message);
      return null;
    } else {
      return tokenResult.token.id;
    }
  };

  const updateCard = (token) => {
    const END_POINT = "/v3/api/custom/vaypoynt/company/payment/update";
    const PAYLOAD = {
      cardToken: token,
    };
   
    sdk
      .callRawAPI(END_POINT, PAYLOAD, "POST")
      .then((res) => {
        console.log(res);

        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };


  const deletAccount = async () => {
    const END_POINT = "/v3/api/custom/vaypoynt/company/subscription/cancel";
    const PAYLOAD = {};
      let resp = await sdk.callRawAPI(END_POINT, PAYLOAD, "POST");
    if (resp.error == false) {
      dispatch( {
        type: "LOGOUT",
      } );
      navigate( "/" );
    }
  };


  const CancelSubscription = () => {

    deletAccount()
  }

  return (
    <>
      <p className="text-xl font-semibold">Current Info</p>
      <div className="payment-update-holder border-2 p-4 mt-4 rounded-md">
        <div className="lg:flex sm:block md:flex block gap-10">
          <div className="update-payment-field-holder flex flex-col gap-4 w-full">
            <CardElement
              className={`mt-4 bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              options={{ hidePostalCode: true }}
            />
            {cardError && <h4>{cardError}</h4>}
            {/* <fieldset>
              <label className="block mb-2 text-md font-medium text-gray-900">
                Card Holder Name
              </label>
              <div className="relative mb-2">
                <input
                  type="text"
                  className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder=""
                />
              </div>
            </fieldset>
            <fieldset>
              <label className="block mb-2 text-md font-medium text-gray-900">
                Credit/Debit Number
              </label>
              <div className="relative mb-2">
                <input
                  type="text"
                  className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder=""
                />
              </div>
            </fieldset>
            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 gap-4">
              <fieldset>
                <label className="block mb-2 text-md font-medium text-gray-900">
                  Expiration Month & Year
                </label>
                <div className="relative mb-2">
                  <input
                    type="text"
                    className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                  />
                </div>
              </fieldset>
              <fieldset>
                <label className="block mb-2 text-md font-medium text-gray-900">
                  CVC
                </label>
                <div className="relative mb-2">
                  <input
                    type="text"
                    className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                  />
                </div>
              </fieldset>
            </div> */}
            <div className="flex payment-bottom justify-between items-end">
              <button
                onClick={() => {
                  getCardToken().then((token)=>{
                    if(token){
                      updateCard(token)
                    }else{
                      alert(cardError)
                      isLoading(false)
                    }
                   
                  });
                  // updateCard()
                }}
                type="button"
                className="form-submit ml-0"
              >
                Edit Payment
              </button>
              {/* <fieldset>
                <label className="block mb-2 text-md font-medium text-gray-900">
                  Promo Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                  />
                </div>
              </fieldset> */}
            </div>
          </div>
          <div className="payment-icon flex md:flex-col lg:flex-col gap-10 lg:w-fit  w-full">
            <img
              className="w-40 object-contain block mx-auto"
              src={PaymentIcon1}
            />
            <img
              className="w-40 object-contain block mx-auto"
              src={PaymentIcon2}
            />
            <img
              className="w-40 object-contain block mx-auto"
              src={PaymentIcon3}
            />
          </div>
        </div>
      </div>
      <button
      onClick={() => {CancelSubscription()}}
        type="button"
        className="py-3 px-10 text-white bg-red-500 rounded-md font-bold text-lg mt-4"
      >
        Cancel Subscription
      </button>
    </>
  );
};

export default UpdatePaymentTab;
