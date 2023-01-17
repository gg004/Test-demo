import React from "react";
import "./User7.css";

function User7(props) {
  const { src } = props;

  return (
    <div className="user-7">
      <div className="ellipse-1"></div>
      <img className="path-3" src={src} alt="Path 3" />
    </div>
  );
}

export default User7;
