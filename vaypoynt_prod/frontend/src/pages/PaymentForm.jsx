// import { CardElement } from "@stripe/react-stripe-js";
// import React, { useState } from "react";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router";
// import axios from "axios";
// import { GlobalContext } from "../../globalContext";
// const CARD_OPTIONS = {
//   iconStyle: "solid",
//   style: {
//     base: {
//       iconColor: "#c4f0ff",
//       color: "#fff",
//       fontWeight: 500,
//       fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
//       fontSize: "16px",
//       fontSmoothing: "antialiased",
//       ":-webkit-autofill": {
//         color: "#fce883",
//       },
//       "::placeholder": {
//         color: "#87bbfd",
//       },
//     },
//     invalid: {
//       iconColor: "#ffc7ee",
//       color: "#ffc7ee",
//     },
//   },
// };

// const PaymentForm = ({
//   stripe,
//   elements,
//   onSuccessNavigate,
//   apiEndPoint,
//   payload,
// }) => {
//   const [errorMsg, setErrorMsg] = useState("");
//   const { dispatch: globalDispatch } = React.useContext(GlobalContext);
//   const navigate = useNavigate();
//   const schema = yup
//     .object({
//       name: yup.string().required("This Field is required"),
//     })
//     .required();
//   const {
//     register,
//     handleSubmit,
//     setError,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//   });

//   const onSubmit = async (e) => {
//     console.log("submitting");
//     globalDispatch({ type: "START_LOADING" });

//     const cardElem = elements.getElement("card");
//     const result = await stripe.createToken(cardElem);
//     if (result.error) {
//       setErrorMsg(result.error.message);
//       console.log(result.error);
//     }
//     if (result.token) {
//       console.log(payload);
//       try {
//         const res = await axios.post(
//           `https://app.mjpicks.com/v2/api/custom/professormj/${apiEndPoint}`,
//           {
//             plan: payload.plan,
//             sports_selected: payload.sports_selected,
//             cardToken: result.token.id,
//           },
//           {
//             headers: {
//               "X-Project":
//                 "cHJvZmVzc29ybWo6Z3B5OHZjMjhzZWdscHdvcG44MWFmYmFteGVvMHZwaXhs",
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );
//         console.log("res", res);
//         if (res.data?.error) {
//           setError("email", { message: res.data.error });
//         } else {
//           console.log("payment successful");
//           navigate(onSuccessNavigate);
//         }
//       } catch (err) {
//         console.log(err);
//         setError("email", { message: err?.data?.message });
//       }
//     }
//     globalDispatch({ type: "STOP_LOADING" });
//   };
//   return (
//     <form
//       className="bg-white flex flex-col box-container plan-page"
//       onSubmit={handleSubmit(onSubmit)}
//     >
//       <button className="self-start" onClick={() => navigate(-1)}>
//         <img
//           src="/assets/back.png"
//           className="inline"
//           style={{ height: "19px", marginBottom: "3px" }}
//         />
//         Back
//       </button>
//       <div className="flex-grow">
//         <h3 className="font-bold mb-8">Payment</h3>
//         <div className="input-container mb-8">
//           <label className="font-semibold">
//             <span className="text-red-500">*</span> Card Holder Name
//           </label>
//           <input
//             type="text"
//             {...register("name")}
//             className={errors.name?.message ? "error-input" : ""}
//           />
//           <p className="text-red-500 text-xs italic">{errors.name?.message}</p>
//         </div>
//         <CardElement
//         //   options={CARD_OPTIONS}
//         />
//         <p className="text-red-500 text-xs italic mt-8">{errorMsg}</p>
//       </div>
//       <button className="btn-color text-white py-3 rounded-sm">Pay</button>
//     </form>
//   );
// };

// export default PaymentForm;
