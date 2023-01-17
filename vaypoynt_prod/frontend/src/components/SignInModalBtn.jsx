import React from "react";
import { BtnNextBlueImg } from "Assets/images";
import { NavLink } from "react-router-dom";

const SignInModalBtn = ( { ModalBtnTitle, ModalBtnParah, ModalBtnLink, ModalBtnImg, onCloseSignUpModal } ) => {
  return (
    <NavLink to={ ModalBtnLink } className="signup-btn flex items-center gap-5 shadow-md" onClick={ onCloseSignUpModal }>
      <img className="w-[120px] h-[120px] object-contain mr-4" src={ ModalBtnImg } />
      <span>
        <h2>{ ModalBtnTitle }</h2>
        <p>
          { ModalBtnParah }
        </p>
      </span>
      <img className="signModal-btn w-[50px] h-[50px] object-contain ml-auto" src={ BtnNextBlueImg } />
    </NavLink>
  );
};

export default SignInModalBtn;
