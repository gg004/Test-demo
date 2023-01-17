import React, { useState } from "react";
import { btnNext } from "Assets/images";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";

const PasswordUpdate = () => {
  const [isUpdated, setIsUpdated] = useState(false);

  const schema = yup
    .object({
      password: yup.string().required(),
      passwordConfirmation: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match"),
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
    // const result = await sdk.updatePassword(data.password);
    try {
      const result = await sdk.updatePassword(data.password);
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
      if (result.error == false) {
        setIsUpdated(true);
      }
    } catch (error) {
      console.log("Error", error);
      setError("password", {
        type: "manual",
        message: error.message,
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="cus-input">
          <label
            for="address"
            className="block mb-2 text-md font-medium text-gray-900"
          >
            New Password
          </label>
          <div className="relative mb-6">
            <input
              type="password"
              className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Password"
              {...register("password")}
            />
            <p className="text-red-500 text-xs italic">
              {errors.password?.message}
            </p>
          </div>
        </fieldset>
        <fieldset className="cus-input">
          <label
            for="address"
            className="block mb-2 text-md font-medium text-gray-900"
          >
            Retype Password
          </label>
          <div className="relative mb-6">
            <input
              type="password"
              className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Password"
              {...register("passwordConfirmation")}
            />
            <p className="text-red-500 text-xs italic">
              {errors.passwordConfirmation?.message}
            </p>
            {isUpdated && <p className="text-md  text-green-500 ">Password Updated</p>}
          </div>
        </fieldset>
       
        <button
          className="form-submit max-w-[300px] w-full ml-0 mb-2"
          type="submit"
        >
          {isUpdated? "Password is Upadted" : "Update Password"}
           <img src={btnNext} />
        </button>
      </form>
    </>
  );
};

export default PasswordUpdate;
