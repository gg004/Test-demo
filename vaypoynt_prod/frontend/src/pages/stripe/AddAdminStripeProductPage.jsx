import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../../globalContext";
import { tokenExpireError } from "../../authContext";

const AddAdminStripeProductPage = () => {
  const schema = yup
    .object({
      name: yup.string().required(),
      description: yup.string().nullable(),
      // shippable: yup.boolean().nullable(),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // const selectShippable = [
  //   { key: "0", value: false },
  //   { key: "1", value: true },
  // ];
  const onSubmit = async (data) => {
    let sdk = new MkdSDK();

    try {
      const result = await sdk.addStripeProduct({ name: data.name, description: data.description });
      if (!result.error) {
        showToast(dispatch, "Added");
        navigate("/admin/products");
      } else {
        if (result.validation) {
          const keys = Object.keys(result.validation);
          for (let i = 0; i < keys.length; i++) {
            const field = keys[i];
            console.log(field);
            setError(field, {
              type: "manual",
              message: result.validation[field],
            });
          }
        }
      }
    } catch (error) {
      console.log("Error", error);

      showToast(dispatch, error.message);
      tokenExpireError(dispatch, error.message);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "products",
      },
    });
  }, []);
  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium">Add a Product</h4>
      <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 ">
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
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <input
            type="text"
            placeholder="Description"
            {...register("description")}
            className={`shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
              errors.description?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.description?.message}</p>
        </div>

        {/* <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interval">
            Shippable
          </label>
          <select
            className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            {...register("shippable")}
          >
            {selectShippable.map((option) => (
              <option value={option.value} key={`shippable_${option.key}`}>
                {option.value}
              </option>
            ))}
          </select>
          <p className="text-red-500 text-xs italic">{errors.shippable?.message}</p>
        </div> */}

        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddAdminStripeProductPage;
