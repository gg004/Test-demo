import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK"
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../authContext";
import Group27 from "./Group27";
// import Battery from "./Battery";
import Username from "./Username";
import { Password } from "./Password";
import "./MobileLogin.css";
import { InteractiveButton } from "Components/InteractiveButton";
import { btnNext } from "Assets/images";

let sdk = new MkdSDK();
function MobileLogin ( {
  pic5,
  pic2,
  pic4,
  pic1,
  appleTouchIcon,
  pic3,
  welcomeToVaypoynt,
  pleaseLoginYourAccount,
  forgotPassword,
  logIn,
  path1,
  path2,
  line2,
  line1,
  donTHaveAnAccount,
  signUp,
  usernameProps,
  group2Props,
} ) {

  const [ loading, setLoading ] = useState( false );
  // const [ password, setPassword ] = useState( "" );

  // const Login = useCallback( () => {

  // }, [] )

  const schema = yup
    .object( {
      email: yup.string().email().required(),
      password: yup.string().required(),
      // company: yup.string().required(),
    } )
    .required();

  const { dispatch } = React.useContext( AuthContext );
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm( {
    resolver: yupResolver( schema ),
  } );

  const onSubmit = async ( data ) => {
    try {
      setLoading( true )
      const result = await sdk.login( data.email, data.password, "employee" );
      if ( !result.error ) {
        dispatch( {
          type: "LOGIN",
          payload: result,
        } );
        setLoading( false )
        navigate( "/employee/dashboard" );
      } else {
        if ( result.validation ) {
          setLoading( false )
          const keys = Object.keys( result.validation );
          for ( let i = 0; i < keys.length; i++ ) {
            const field = keys[ i ];
            setError( field, {
              type: "manual",
              message: result.validation[ field ],
            } );
          }
        }
      }
    } catch ( error ) {
      setLoading( false )
      console.log( "Error", error );
      setError( "email", {
        type: "manual",
        message: error.message,
      } );
    }
  };

  return (
    <div className="md:hidden block container-center-horizontal">
      <div className="x2-0-login screen border-2 border-blue-700 w-full">
        <div className="overlap-group7 w-full flex justify-center items-center ">
          <div className=" h-full md:w-[60%] w-full relative overlap-group5 border-2 border-red-700">
            <div className="ellipse-container m-auto -top-[3rem] -left-[2rem]">
              <div className="ellipse-4"></div>
              <div className="ellipse-5"></div>
            </div>
            <Group27 />
            <img className="pic-5 -right-[1.8rem] top-[11rem]" src={ pic5 } alt="Pic 5" />
            <img className="pic-2 right-[1.8rem] top-[2.5rem]" src={ pic2 } alt="Pic 2" />
            <img className="pic-4  right-[3.2rem] top-[7.5rem]" src={ pic4 } alt="Pic 4" />
            <img className="pic-1 m-auto -left-[1.8rem] top-[2.5rem]" src={ pic1 } alt="Pic 1" />
            <div className="rectangle-106 absolute inset-0 m-auto rounded-[26px] w-[123px] h-[116px] border flex justify-center items-center">
              <img className="apple-touch-icon -left-[10px] absolute m-auto" src={ appleTouchIcon } alt="apple-touch-icon" />
            </div>
            <img className="pic-3 left-[1.8rem] top-[10.5rem]" src={ pic3 } alt="Pic 3" />
          </div>
        </div>
        <div className="overlap-group4 w-full">
          <div className="welcome-title">
            <div className="welcome-to-vaypoynt">{ welcomeToVaypoynt }</div>
            <div className="please-login-your-account">{ pleaseLoginYourAccount }</div>
          </div>
          <form onSubmit={ handleSubmit( onSubmit ) } className={ `` }>

            <div className="overlap-group6">
              <div className="input-username-password">
                <Username
                  usernameAdminname={ usernameProps.usernameAdminname }
                  jamesGmailCom={ usernameProps.jamesGmailCom }
                  user7Props={ usernameProps.user7Props }
                  errors={ errors }
                  register={ register }
                />
                <div className="password">
                  <Password
                    errors={ errors }
                    register={ register }
                    password={ group2Props.password } lock1={ group2Props.lock1 } />
                  <div className="forgot-password">{ forgotPassword }</div>
                </div>
              </div>
              {/* <img className="line-44" src={ line44 } alt="Line 44" /> */ }
            </div>


            {/* <InteractiveButton type="submit" className={`bg-[#4c6fff] w-full p-4 ma form-border`}> */ }
            <InteractiveButton
              type="submit"
              className={ `form-submit` }
              disabled={ loading }
              loading={ loading }
            >
              Log In <img src={ btnNext } />
            </InteractiveButton>

          </form>

          <div className="or-login-with-title flex justify-between">
            <img className="line-2" src={ line2 } alt="Line 2" />
            {/* <div className="or-login-with">{ orLoginWith }</div> */ }
            <img className="line-1" src={ line1 } alt="Line 1" />
          </div>
          {/* <img className="icon-awesome-linkedin-in" src={ iconAwesomeLinkedinIn } alt="Icon awesome-linkedin-in" /> */ }
          {/* <div className="group-12">
            <div className="dont-have-an-account poppins-medium-martinique-12px">{ donTHaveAnAccount }</div>
            <div className="sign-up poppins-semi-bold-blueberry-12px">{ signUp }</div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export { MobileLogin };
