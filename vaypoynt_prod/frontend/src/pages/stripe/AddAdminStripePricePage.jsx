import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "../../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../../globalContext";
import { tokenExpireError, AuthContext } from "../../authContext";

const AddAdminStripePricePage = () => {
  const [priceType, setPriceType] = useState("one_time");
  const [selectProduct, setSelectProduct] = useState([]);

  const schema = yup
    .object({
      product_id: yup.string().required(),
      name: yup.string().required(),
      amount: yup.string().required(),
      type: yup.string().required(),
      interval: yup.string().when("type", {
        is: "recurring",
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
      }),
      interval_count: yup.string(),
      usage_type: yup.string().when("type", {
        is: "recurring",
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
      }),
      usage_limit: yup.string(),
      trial_days: yup.string(),
    })
    .required();

  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    trigger,
    resetField,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectType = [
    { key: 0, value: "", display: "Nothing Selected" },
    { key: 1, value: "one_time", display: "One Time" },
    { key: 2, value: "recurring", display: "Recurring" },
  ];

  const selectUsageType = [
    { key: 0, value: "", display: "Nothing Selected" },
    { key: 1, value: "licenced", display: "Upfront" },
    { key: 2, value: "metered", display: "Metered" },
  ];

  const selectInterval = [
    { key: 0, value: "", display: "Nothing Selected" },
    { key: 1, value: "day", display: "Day" },
    { key: 2, value: "week", display: "Week" },
    { key: 3, value: "month", display: "Month" },
    { key: 4, value: "year", display: "Year" },
    { key: 5, value: "lifetime", display: "Lifetime" },
  ];

  const onSubmit = async (data) => {
    let sdk = new MkdSDK();
    console.log(data);
    try {
      const result = await sdk.addStripePrice(data);
      if (!result.error) {
        showToast(globalDispatch, "Price Added");
        navigate("/admin/prices");
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

      showToast(globalDispatch, error.message);
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
    (async () => {
      let sdk = new MkdSDK();
      const { list, error } = await sdk.getStripeProducts({ limit: "all" });
      if (error) {
        showToast(dispatch, "Something went wrong while fetching products list");
        return;
      }
      setSelectProduct(list);
    })();
  }, []);
  return (
    <div className=" shadow-md rounded  mx-auto p-5">
      <h4 className="text-2xl font-medium mb-4">Add a Price</h4>
      <form
        className=" w-full max-w-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="product_id"
          >
            Product
          </label>
          <select
            className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            {...register("product_id")}
          >
            <option
              value=""
              key={`prod_default`}
            >
              Nothing selected
            </option>
            {selectProduct.map((option, index) => (
              <option
                value={option.id}
                key={`prod_${option.id}`}
              >
                {option.name}
              </option>
            ))}
          </select>
          <p className="text-red-500 text-xs italic">{errors.product_id?.message}</p>
        </div>

        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
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
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="amount"
          >
            Amount
          </label>
          <input
            type="number"
            min={0.1}
            step="any"
            placeholder="Amount"
            {...register("amount")}
            className={`shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
              errors.amount?.message ? "border-red-500" : ""
            }`}
          />
          <p className="text-red-500 text-xs italic">{errors.amount?.message}</p>
        </div>

        <div className="mb-5">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="type"
          >
            Type
          </label>
          <select
            className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            {...register("type")}
            onChange={(e) => {
              const currentTypeSelected = e.target.value;
              setPriceType(currentTypeSelected);
              setValue("type", currentTypeSelected);
              trigger("type");
            }}
          >
            {selectType.map((option) => (
              <option
                value={option.value.toLowerCase()}
                key={`interval_${option.key}`}
              >
                {option.display}
              </option>
            ))}
          </select>
          <p className="text-red-500 text-xs italic">{errors.type?.message}</p>
        </div>
        {priceType === "recurring" ? (
          <div className="ml-6">
            <div className="mb-5">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="interval"
              >
                Interval
              </label>
              <select
                className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                {...register("interval")}
                placeholder="Select"
              >
                {selectInterval.map((option) => (
                  <option
                    value={option.value.toLowerCase()}
                    key={`interval_${option.key}`}
                  >
                    {option.display}
                  </option>
                ))}
              </select>
              <p className="text-red-500 text-xs italic">{errors.interval?.message}</p>
            </div>
            <div className="mb-5">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="interval_count"
              >
                Interval Count
              </label>
              <input
                type="number"
                step="1"
                placeholder="Interval Count"
                {...register("interval_count")}
                {...setValue("interval_count", 1)}
                className={`shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.interval_count?.message ? "border-red-500" : ""
                }`}
              />
              <p className="text-red-500 text-xs italic">{errors.interval_count?.message}</p>
            </div>

            <div className="mb-5">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="usage_type"
              >
                Usage Type
              </label>
              <select
                className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                {...register("usage_type")}
                placeholder="Select"
              >
                {selectUsageType.map((option) => (
                  <option
                    value={option.value.toLowerCase()}
                    key={`interval_${option.key}`}
                  >
                    {option.display}
                  </option>
                ))}
              </select>
              <p className="text-red-500 text-xs italic">{errors.usage_type?.message}</p>
            </div>
            <div className="mb-5">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="trial_days"
              >
                Trial Days
              </label>
              <input
                type="number"
                step="1"
                placeholder="0"
                {...register("trial_days")}
                className={`shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.trial_days?.message ? "border-red-500" : ""
                }`}
              />
              <p className="text-red-500 text-xs italic">{errors.trial_days?.message}</p>
            </div>
            <div className="mb-5">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="trial_days"
              >
                Usage Limit
              </label>
              <input
                type="number"
                step="1"
                placeholder="1000"
                {...register("usage_limit")}
                className={`shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.usage_limit?.message ? "border-red-500" : ""
                }`}
              />
              <p className="text-red-500 text-xs italic">{errors.usage_limit?.message}</p>
            </div>
          </div>
        ) : (
          ""
        )}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddAdminStripePricePage;
