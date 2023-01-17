import React from "react";
import { NavLink } from "react-router-dom";
import LoginHeader from "../../components/LoginHeader";

import { btnNext, CompanyFieldImg, PasswordFieldImg, NameFieldImg } from "Assets/images";
const LoginPage = () => {
  return (
    <>
      <div className="main-login-holder">
        <div className="login-content">
          <LoginHeader />
          <h2>Welcome to Vaypoynt</h2>
          <p>Please login your Account</p>

          <div className="flex justify-between items-center mt-10 mb-10">
            <h4 className="text-md font-semibold">Select Client</h4>
            <div className="flex gap-4">
              <button
                className="text-md font-semibold border-b-2 border-transparent border-green-500	"
                type="button"
              >
                Employee
              </button>
              <button
                className="text-md font-semibold border-b-2 border-transparent"
                type="button"
              >
                Company
              </button>
            </div>
          </div>
          <form>
            <fieldset>
              <label
                for="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Username
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img className="w-5 h-5 object-contain" src={ NameFieldImg } />
                </div>
                <input
                  type="text"
                  id="input-group-1"
                  className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@flowbite.com"
                />
              </div>
            </fieldset>

            <fieldset>
              <label
                for="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Company Name
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img className="w-5 h-5 object-contain" src={ CompanyFieldImg } />
                </div>
                <input
                  type="text"
                  id="input-group-1"
                  className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Company"
                />
              </div>
            </fieldset>

            <fieldset>
              <label
                for="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Password
              </label>
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img className="w-5 h-5 object-contain" src={ PasswordFieldImg } />
                </div>
                <input
                  type="password"
                  id="input-group-1"
                  className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="**********"
                />
              </div>
            </fieldset>
            <NavLink
              className="align-baseline font-bold text-sm text-right block text-blue-500 hover:text-blue-800"
              to="#"
            >
              Forgot Password?
            </NavLink>
            <button className="form-submit mt-10" type="button">
              Log in <img src={ btnNext } />
            </button>
          </form>
          <div className="other-logins my-10">
            <p>Or login with</p>
          </div>

          <div className="other-account">
            <p>Don't have an Account?</p>
            <NavLink to="/company/signup">Sign up</NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
