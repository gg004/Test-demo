import React from 'react'

import LoginHeader from "../../components/LoginHeader";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";

import { btnNext, EmailFieldImg } from "Assets/images";

const RecoveryEmail = () => {

  const schema = yup
  .object({
    email: yup.string().email().required(),
  })
  .required();
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
    const END_POINT = "/v3/api/custom/vaypoynt/company/recovery";
    const PAYLOAD = {
      email: data.email,
      role: "company"
    };
    let resp = await sdk.callRawAPI(END_POINT, PAYLOAD, "POST");
    if (resp.error == false) {
      
    }
 
  } catch (error) {
    console.log("Error", error);
    setError("email", {
      type: "manual",
      message: error.message,
    });
  }
};

  return (
    <>
     <div className="main-login-holder">
        <div className="login-content">
          <LoginHeader />
          <h2 className='mb-4'>Enter Your Email</h2>
       
          <form
          onSubmit={handleSubmit(onSubmit)}
          >
            <fieldset>
              <label
                for="input-group-1"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Email
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <img className="w-5 h-5 object-contain" src={ EmailFieldImg } />
                </div>
                <input
                  type="email"
                  id="input-group-1"
                  {...register("email")}
                  className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@flowbite.com"
                />
                <p className="text-red-500 text-xs italic">
              {errors.email?.message}
            </p>
              </div>
            </fieldset>
            <button className="form-submit mt-10" type="submit">
              Submit <img src={ btnNext } />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default RecoveryEmail