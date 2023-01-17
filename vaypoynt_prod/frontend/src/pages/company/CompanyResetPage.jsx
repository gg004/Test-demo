import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../authContext";
import { showToast } from "../../globalContext";
import LoginHeader from "../../components/LoginHeader";
import { useLocation } from "react-router-dom";
import {
  btnNext,
  PasswordFieldImg,
} from "Assets/images";

const CompanyResetPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const token = params.get("token");
  console.log({ token });

  const schema = yup
    .object({
      code: yup.string().required(),
      password: yup.string().required(),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match"),
    })
    .required();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    let sdk = new MkdSDK();
    try {
      const result = await sdk.reset(token, data.code, data.password);
      if (!result.error) {
        showToast(dispatch, "Password Reset");
        setTimeout(() => {
          navigate("/company/login");
        }, 2000);
      } else {
        if (result.validation) {
          const keys = Object.keys(result.validation);
          for (let i = 0; i < keys.length; i++) {
            const field = keys[i];
            setError(field, {
              type: "manual",
              message: result.validation[field],
            });
          }
        }
      }
    } catch (error) {
      console.log("Error", error);
      setError("code", {
        type: "manual",
        message: error.message,
      });
    }
  };

  return (
    <>
      {/* <div className="w-full max-w-xs mx-auto">
        <form
          onSubmit={ handleSubmit( onSubmit ) }
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-8 "
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="code"
            >
              Code
            </label>
            <input
              type="text"
              placeholder="Enter code sent to your email"
              { ...register( "code" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.code?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.code?.message }
            </p>
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              placeholder="******************"
              { ...register( "password" ) }
              className={ `shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${ errors.password?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.password?.message }
            </p>
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="******************"
              { ...register( "confirmPassword" ) }
              className={ `shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${ errors.confirmPassword?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.confirmPassword?.message }
            </p>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              value="Reset Password"
            />
            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              to="/company/login"
            >
              Login?
            </Link>
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs">
          &copy; { new Date().getFullYear() } manaknightdigital inc. All rights
          reserved.
        </p>
      </div> */}

      <div className="main-login-holder">
        <div className="login-content">
          <LoginHeader />
          <h2 className="mb-4">Reset Password</h2>
          <form
           onSubmit={ handleSubmit( onSubmit ) }
          >
            <fieldset>
              <label
                for="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Code
              </label>
              <div className="relative mb-6">
                {/* <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img className="w-5 h-5 object-contain" src={NameFieldImg} />
                </div> */}
                <input
                  type="text"
                  placeholder="Enter code sent to your email"
                  {...register("code")}
                  className={`bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                    errors.code?.message ? "border-red-500" : ""
                  }`}
                />
                <p className="text-red-500 text-xs italic">
                  {errors.code?.message}
                </p>
              </div>
            </fieldset>
            <fieldset>
              <label
                for="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Password
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img className="w-5 h-5 object-contain" src={PasswordFieldImg} />
                </div>
                <input
                  type="text"
                  placeholder="Enter code sent to your email"
                  {...register("password")}
                  className={`bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                    errors.code?.message ? "border-red-500" : ""
                  }`}
                />
                <p className="text-red-500 text-xs italic">
                  {errors.password?.message}
                </p>
              </div>
            </fieldset>
            <fieldset>
              <label
                for="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Confirm Password
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img className="w-5 h-5 object-contain" src={PasswordFieldImg} />
                </div>
                <input
                  type="text"
                  placeholder="Enter code sent to your email"
                  {...register("confirmPassword")}
                  className={`bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                    errors.code?.message ? "border-red-500" : ""
                  }`}
                />
                <p className="text-red-500 text-xs italic">
                  {errors.confirmPassword?.message}
                </p>
              </div>
            </fieldset>
            <button className="form-submit mt-10" type="submit">
              Reset Password <img src={btnNext} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CompanyResetPage;
