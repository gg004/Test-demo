import React from 'react'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useState } from 'react';

const Contact = () => {

const [isSent, setIsSent] = useState(false)

    const schema = yup
    .object({
      name: yup.string().required(),
      phone: yup.string().required(),
      email: yup.string().email().required(),
      message: yup.string().required(),
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
    const END_POINT = "/v3/api/custom/vaypoynt/company/contact_us";
    const PAYLOAD = {
        "email": data.email,
        "name": data.name,
        "phone": data.phone,
        "message": data.message,
    };
    let resp = await sdk.callRawAPI(END_POINT, PAYLOAD, "POST");
    if (resp.error == false) {
        setIsSent(true)
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
    <form className="flex flex-col	gap-4 contact-form"
    onSubmit={handleSubmit(onSubmit)}
    >
    <fieldset>
      {/* <label>Name</label> */}
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white"
        type="text"
        placeholder="Enter your name"
        {...register("name")}
      />
       <p className="text-red-500 text-xs italic m-0">
              {errors.name?.message}
            </p>
    </fieldset>
    <fieldset>
      {/* <label className="text-bold">Email</label> */}
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white"
        type="email"
        placeholder="Enter your email"
        
        {...register("email")}
      />
       <p className="text-red-500 text-xs italic m-0">
              {errors.email?.message}
            </p>
    </fieldset>
    <fieldset>
      {/* <label>Phone number</label> */}
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white "
        type="tel"
        placeholder="Enter your number"
        
        {...register("phone")}
      />
        <p className="text-red-500 text-xs italic m-0">
              {errors.phone?.message}
            </p>
    </fieldset>
    <fieldset>
      {/* <label>Message</label> */}
      <textarea
      {...register("message")}
      placeholder="Type your message"
      className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white "></textarea>
     <p className="text-red-500 text-xs italic m-0">
              {errors.message?.message}
            </p>
            {isSent && <p className='m-0 text-green-400 text-xl'>Submit Succesfullly</p>}
    </fieldset>
    <fieldset>
      <button
        className="py-2 text-center mx-auto font-bold px-10 block rounded-full text-white"
        type="submit"
      >
          {isSent? "Submited" : "Submit"}
      </button>
    
    </fieldset>
  </form>
  )
}

export default Contact