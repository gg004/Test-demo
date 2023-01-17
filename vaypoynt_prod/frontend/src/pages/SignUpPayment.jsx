// import React from "react";
// import { useNavigate } from "react-router";
// import { ElementsConsumer } from "@stripe/react-stripe-js";
// import PaymentForm from "../../../components/frontend/PaymentForm";
// import { useSignUpContext } from "../../../context/signupContext";

// const SignUpPayment = () => {
//   const navigate = useNavigate();
//   const { signUpData } = useSignUpContext();
//   return (
//     <ElementsConsumer>
//       {({ stripe, elements }) => (
//         <PaymentForm
//           stripe={stripe}
//           elements={elements}
//           onSuccessNavigate={`/home?popup=true&type=${signUpData.plan}`}
//           apiEndPoint={"stripe/subscribe"}
//           payload={{
//             plan: signUpData.plan,
//             sports_selected: JSON.stringify(signUpData.sports),
//           }}
//         />
//       )}
//     </ElementsConsumer>
//   );
// };

// export default SignUpPayment;
