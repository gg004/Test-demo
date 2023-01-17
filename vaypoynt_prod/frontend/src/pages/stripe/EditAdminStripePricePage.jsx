import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../../utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "../../authContext";
import { GlobalContext, showToast } from "../../globalContext";

let sdk = new MkdSDK();

const EditAdminStripePricePage = () => {
  const schema = yup
    .object({
      name: yup.string().required(),
      status: yup.boolean().required(),
    })
    .required();

  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const params = useParams();
  const [id, setId] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectStatus = [
    { key: "0", value: "Inactive" },
    { key: "1", value: "Active" },
  ];

  const onSubmit = async (data) => {
    try {
      console.log(data);
      const result = await sdk.updateStripePrice(params?.id, data);
      if (!result.error) {
        showToast(globalDispatch, "Edited", 4000);
        navigate("/admin/prices");
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
      showToast(globalDispatch, error.message, 4000);
      tokenExpireError(dispatch, error.message);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "prices",
      },
    });

    (async function () {
      try {
        const result = await sdk.getStripePrice(params?.id);

        if (!result.error) {
          const price = result.model.object;
          setValue("name", price.nickname);
          setValue("status", result.model.status);
          setId(result.model.id); //set local id
        }
      } catch (error) {
        console.log("Error", error);
        tokenExpireError(dispatch, error.message);
      }
    })();
  }, []);
  return (
    <div className=" shadow-md rounded   mx-auto p-5">
      <h4 className="text-2xl font-medium">Edit Product</h4>
      <form className="w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            placeholder="Name"
            {...register("name")}
            className={`"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.name?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.name?.message}</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
          <select
            className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            {...register("status")}
          >
            {selectStatus.map((option) => (
              <option value={option.key} key={option.key}>
                {option.value}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditAdminStripePricePage;
