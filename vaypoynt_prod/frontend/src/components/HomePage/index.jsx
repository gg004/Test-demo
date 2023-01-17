import React from "react";
import { Link } from "react-router-dom";
import Group21 from "./Group21";
import Group54 from "./Group54";
import Group542 from "./Group542";
import Group543 from "./Group543";
import Group5 from "./Group5";
import "./HomePage.css";

function HomePage ( props ) {
  const {
    bannonMorrissyRxiav5LcWwUnsplash,
    // path25,
    // path24,
    // path26,
    iconAwesomeCheck,
    path18,
    group5421Props,
    group5422Props,
    group5431Props,
    group5432Props,
  } = props;

  return (
    <div className="container-center-horizontal">
      <div className="homepage screen border-2 border-blue-800">
        <div className="overlap-group3 border-2 border-blue-800">
          <div className="rectangle-7">

          </div>
          <div className="ellipse-container-5">
            <div className="ellipse-4-5"></div>
            <div className="ellipse-5-5"></div>
          </div>
          <div className="ellipse-container-6">
            <div className="ellipse-4-6"></div>
            <div className="ellipse-5-6"></div>
          </div>
          <div className="ellipse-container-7">
            <div className="ellipse-4-7"></div>
            <div className="ellipse-5-7"></div>
          </div>
          <img
            className="bannon-morrissy-rxi-av5-lc-ww-unsplash"
            src={ bannonMorrissyRxiav5LcWwUnsplash }
            alt="bannon-morrissy-RxiAV5LC-ww-unsplash"
          />
          {/* <Link to="/side-menu">
              <div className="icon-feather-menu">
                <img className="path-2-1" src={ path25 } alt="Path 25" />
                <img className="path-2-1" src={ path24 } alt="Path 24" />
                <img className="path-2-1" src={ path26 } alt="Path 26" />
              </div>
            </Link> */}
          {/* <Group21 /> */ }
        </div>
        <div className="mid-section">

          <div className="overlap-group4-1 border-2 border-blue-800">
            <Group54 />
            <img className="icon-awesome-check" src={ iconAwesomeCheck } alt="Icon awesome-check" />
          </div>
          <Group542>{ group5421Props.children }</Group542>
          <Group542 className={ group5422Props.className }>{ group5422Props.children }</Group542>
          <Group543>{ group5431Props.children }</Group543>
          <Group543 className={ group5432Props.className }>{ group5432Props.children }</Group543>
          <img className="path-18" src={ path18 } alt="Path 18" />
        </div>
        <div>

          <Group5 />
        </div>
      </div>
    </div>
  );
}

export { HomePage };
