import React, { useState } from "react";
import { btnNext } from "Assets/images";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";

const AddRecoveryEmail = () => {
  const [isUpdated, setIsUpdated] = useState(false);
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
      const END_POINT = "/v3/api/custom/vaypoynt/company/PUT";
      const PAYLOAD = {
        recovery_email: data.email,
      };
      let resp = await sdk.callRawAPI(END_POINT, PAYLOAD, "POST");
      if (resp.error == false) {
        setIsUpdated(true);
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="cus-input">
          <label
            for="address"
            className="block mb-2 text-md font-medium text-gray-900"
          >
            Recovery Email
          </label>
          <div className="relative mb-6">
            <input
              type="email"
              className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Recovery Email"
              {...register("email")}
            />
            <p className="text-red-500 text-xs italic">
              {errors.email?.message}
            </p>
            {isUpdated && <p className="text-md  text-green-500 ">Email Added</p>}
          </div>
        </fieldset>
        <button
          className="form-submit max-w-[300px] w-full ml-0 mb-2"
          type="submit"
        >
          {isUpdated? "Email is Added" : "Add Email"}
           <img src={btnNext} />
        </button>
      </form>
    </>
  );
};

export default AddRecoveryEmail;
