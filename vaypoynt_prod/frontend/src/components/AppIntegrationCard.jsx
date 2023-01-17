import React from "react";

const AppIntegrationCard = ( { AppImg, AppStatus, AppStatusColor, onConnectClick, AppLink, activeApp, appType } ) => {

  return (
    <>
      <div
        style={ { border: `${ activeApp && activeApp === appType ? "2px solid #8ef58a" : "" }` } }
        className={ ` shadow-lg bg-white p-5 rounded-sm relative` }
        onClick={ onConnectClick }
      >
        { AppLink ? <a href={ AppLink?.link } target={ `_blank` }><button className={ `button-class text-xs absolute right-0 top-0 p-2 mr-2 ` }>{ AppLink?.title }</button></a> : null }
        <img className="h-40 w-40 block mx-auto object-contain cursor-pointer" src={ AppImg } />
        <div className="flex justify-between items-center mt-4">
          <span style={ { background: AppStatusColor } } className={ `block w-5 h-5 rounded-full` }></span>
          <p className="text-lg font-semibold">{ AppStatus }</p>
        </div>
      </div>
    </>
  );
};

AppIntegrationCard.defaultProps = {
  AppStatusColor: "#cbd5e1",
  AppLink: null,
}

export default AppIntegrationCard;
