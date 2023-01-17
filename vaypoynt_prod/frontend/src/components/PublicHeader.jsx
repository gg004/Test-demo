import React, { useCallback, useState } from "react";
// import { useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import { GlobalContext } from "../globalContext";
import { AuthContext } from "../authContext";
import { Logo } from "Assets/images";
import TopHeader from "./TopHeader";
import { SignUpModal } from "./SignUpModal";

export const PublicHeader = () => {
  const { state } = React.useContext( GlobalContext );
  const { state: AuthState } = React.useContext( AuthContext );
  const [ showModal, setShowModal ] = useState( false );

  const onCloseSignUpModal = useCallback( () => {
    setShowModal( false )
  }, [ showModal ], )


  const handleClickScroll = () => {
    const element = document.getElementById( 'about' );
    if ( element ) {
      // 👇 Will scroll smoothly to the top of the next section
      element.scrollIntoView( { behavior: 'smooth' } );
    }
  };
  const handleClickScroll2 = () => {
    const element = document.getElementById( 'contact' );
    if ( element ) {
      // 👇 Will scroll smoothly to the top of the next section
      element.scrollIntoView( { behavior: 'smooth' } );
    }
  };

  return (
    <>
      { showModal ?
        <SignUpModal
          onCloseSignUpModal={ onCloseSignUpModal }
        /> : null }
      <header className="sticky-top flex justify-between items-center bg-white w-full px-5 py-3">
        {/* <div className="form-border flex w-full container items-center justify-between gap-x-5"> */ }
        <NavLink to="/">
          <img className="max-w-[200px] w-full" src={ Logo } />
        </NavLink>

        <nav
          className={ `cus-head-nav flex md:flex-row flex-col gap-10 bg-white text-left h-screen md:h-[70px] md:justify-end md:items-center md:sticky-top text-black fixed md:grow ${ !state.isOpen ? "" : "open"
            }` }
        >
          <NavLink className="text-lg font-semibold		text-left " to="/">
            Home
          </NavLink>
          <NavLink className="text-lg	font-semibold text-left	" to="#" onClick={ handleClickScroll }>
            About Us
          </NavLink>
          <NavLink className="text-lg	font-semibold	" to="#" onClick={ handleClickScroll2 }>
            Contact Us
          </NavLink>
          { !AuthState.isAuthenticated ?
            <>
              <NavLink className="text-lg	font-semibold text-left	" to="/company/login">
                Login
              </NavLink>
              <NavLink
                onClick={ () => setShowModal( true ) }
                className="text-lg	font-semibold md:block text-white rounded-full cus-head-nav-last-child"
                to="#"
              >
                Signup
              </NavLink>
            </>
            : <>
              <NavLink
                className="text-lg	font-semibold md:block hidden text-white rounded-full cus-head-nav-last-child"
                to={ `/${ AuthState.role }/dashboard` }
              >
                Dashoard
              </NavLink>
            </> }
        </nav>

        <div className="mob-nav-btn">
          <TopHeader />
        </div>
        {/* </div> */ }
      </header>
    </>
  );
};

export default PublicHeader;
