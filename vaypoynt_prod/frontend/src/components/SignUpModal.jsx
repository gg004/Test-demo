import React from "react";
import SignInModalBtn from "./SignInModalBtn";
import { AdminSignupImg, UserSignupImg, CloseModalImg } from "Assets/images";

export const SignUpModal = ( { onCloseSignUpModal } ) => {
  return (
    <div className="modal-holder flex items-center justify-center">
      <div className="cus-m-close" onClick={ onCloseSignUpModal }>
        <img className="w-[50px] h-[50px]" src={ CloseModalImg } />
      </div>
      <div className="modal-signupBtn flex flex-col gap-5">
        <SignInModalBtn
          ModalBtnTitle="Company Sign Up"
          ModalBtnParah=" Admin is the system controller of the company and will help register users into the Vaypoynt system"
          ModalBtnLink="/company/signup"
          ModalBtnImg={ AdminSignupImg }
          onCloseSignUpModal={ onCloseSignUpModal }
        />

        <SignInModalBtn
          ModalBtnTitle="Employee Sign Up"
          ModalBtnParah="Please ensure the admin has made your company profile so your sign up profile can sync to your company system"
          ModalBtnLink="/employee/signup"
          ModalBtnImg={ UserSignupImg }
          onCloseSignUpModal={ onCloseSignUpModal }
        />
      </div>
      <div className="signup-option-holder flex  flex-col gap-5"></div>
    </div>
  );
};

