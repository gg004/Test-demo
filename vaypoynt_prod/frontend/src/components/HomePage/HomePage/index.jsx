import React from "react";
import Rectangle7 from "../Rectangle7";
import IconFeatherMenu from "../IconFeatherMenu";
import Group21 from "../Group21";
import Group54 from "../Group54";
import Group542 from "../Group542";
import Group543 from "../Group543";
import Group5 from "../Group5";
import "./HomePage.css";

function HomePage(props) {
  const {
    bannonMorrissyRxiav5LcWwUnsplash,
    iconAwesomeCheck,
    path18,
    group5421Props,
    group5422Props,
    group5431Props,
    group5432Props,
  } = props;

  return (
    <div className="container-center-horizontal">
      <div className="homepage screen">
        <div className="overlap-group3">
          <Rectangle7 />
          <div className="ellipse-container">
            <div className="ellipse-4"></div>
            <div className="ellipse-5"></div>
          </div>
          <div className="ellipse-container-1">
            <div className="ellipse-4-1"></div>
            <div className="ellipse-5-1"></div>
          </div>
          <div className="ellipse-container-2">
            <div className="ellipse-4-2"></div>
            <div className="ellipse-5-2"></div>
          </div>
          <img
            className="bannon-morrissy-rxi-av5-lc-ww-unsplash"
            src={bannonMorrissyRxiav5LcWwUnsplash}
            alt="bannon-morrissy-RxiAV5LC-ww-unsplash"
          />
          <IconFeatherMenu />
          <Group21 />
        </div>
        <div className="overlap-group4">
          <Group54 />
          <img className="icon-awesome-check" src={iconAwesomeCheck} alt="Icon awesome-check" />
        </div>
        <Group542>{group5421Props.children}</Group542>
        <Group542 className={group5422Props.className}>{group5422Props.children}</Group542>
        <Group543>{group5431Props.children}</Group543>
        <Group543 className={group5432Props.className}>{group5432Props.children}</Group543>
        <img className="path-18" src={path18} alt="Path 18" />
        <Group5 />
      </div>
    </div>
  );
}

export default HomePage;
