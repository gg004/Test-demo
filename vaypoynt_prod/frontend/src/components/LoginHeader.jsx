import React from "react";

import {
  Logo2,
  img1,
  img2,
  img3,
  img4,
  img5
} from "Assets/images";


const LoginHeader = () => {
  return (
    <div className="login-header">
      <div className="login-header-img img1">
        <img src={img1} />
      </div>
      <div className="login-header-img img2">
        <img src={img2} />
      </div>
      <div className="login-header-img img3">
        <img src={img3} />
      </div>
      <div className="login-header-img img4">
        <img src={img4} />
      </div>
      <div className="login-header-img img5">
        <img src={img5} />
      </div>
      <img className="login-logo" src={Logo2} />
    </div>
  );
};

export default LoginHeader;
