import React from "react";
import { AuthContext, tokenExpireError } from "../../authContext";
import MkdSDK from "../../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "../../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { getNonNullValue } from "../../utils/utils";
import PaginationBar from "../../components/PaginationBar";
import AddButton from "../../components/AddButton";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Customer",
    accessor: "userEmail",
  },
  {
    header: "Plan",
    accessor: "planName",
  },
  {
    header: "Starts",
    accessor: "currentPeriodStart",
    type: "timestamp",
  },
  {
    header: "Ends",
    accessor: "currentPeriodEnd",
    type: "timestamp",
  },
  {
    header: "type",
    accessor: "planType",
    mapping: {
      recurring: "Recurring",
      life_time: "Lifetime",
    },
  },
  {
    header: "Usage Type",
    accessor: "isMetered",
    mapping: {
      0: "Upfront",
      1: "Metered",
    },
  },
  {
    header: "Price",
    accessor: "planAmount",
    type: "currency",
  },
  {
    header: "Has Trial",
    accessor: "trialDays",
  },
  {
    header: "Status",
    accessor: "status",
  },
  {
    header: "Action",
    accessor: "",
  },
];
const AdminStripeSubscriptionsListPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [query, setQuery] = React.useState("");
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const navigate = useNavigate();

  const schema = yup.object({
    customer_email: yup.string(),
    plan_name: yup.string(),
    sub_status: yup.string(),
    plan_type: yup.string(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectStatus = [
    { key: "", value: "All" },
    { key: "active", value: "Active" },
    { key: "trialing", value: "Trialing" },
    { key: "canceled", value: "Canceled" },
  ];

  const typeStatus = [
    { key: "", value: "All" },
    { key: "recurring", value: "Recurring" },
    { key: "lifetime", value: "Lifetime" },
  ];

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(1, limit);
    })();
  }
  function previousPage() {
    (async function () {
      await getData(currentPage - 1 > 1 ? currentPage - 1 : 1, pageSize);
    })();
  }

  function nextPage() {
    (async function () {
      await getData(currentPage + 1 <= pageCount ? currentPage + 1 : 1, pageSize);
    })();
  }

  async function getData(pageNum, limitNum, data) {
    try {
      const result = await sdk.getStripeSubscriptions({ page: pageNum, limit: limitNum }, data);
      const { list, total, limit, num_pages, page } = result;

      setCurrentTableData(list);
      setPageSize(+limit);
      setPageCount(+num_pages);
      setPage(+page);
      setDataTotal(+total);
      setCanPreviousPage(+page > 1);
      setCanNextPage(+page + 1 <= +num_pages);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    const customer_email = getNonNullValue(data.customer_email);
    const plan_name = getNonNullValue(data.plan_name);
    const sub_status = getNonNullValue(data.sub_status);
    const plan_type = getNonNullValue(data.plan_type);
    getData(1, pageSize, {
      customer_email,
      plan_name,
      sub_status,
      plan_type,
    });
  };

  const cancelCustomerSubscription = async (id) => {
    console.log(id);
    try {
      const result = await sdk.adminCancelStripeSubscription(id, {});
      showToast(globalDispatch, result.message, 3000);
      getData(1, pageSize);
    } catch (error) {
      console.log("ERROR", error);
      showToast(globalDispatch, error.message);
      tokenExpireError(dispatch, error.message);
    }
  };

  const createCharge = async (subId, quantity) => {
    console.log(subId);
    try {
      const result = await sdk.adminCreateUsageCharge(subId, quantity);
      showToast(globalDispatch, result.message, 3000);
      getData(1, pageSize);
    } catch (error) {
      console.log("ERROR", error);
      showToast(globalDispatch, error.message);
      tokenExpireError(dispatch, error.message);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "subscriptions",
      },
    });

    (async function () {
      await getData(1, pageSize);
    })();
  }, []);

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Customer</label>
            <input
              type="text"
              placeholder="Email"
              {...register("customer_email")}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-red-500 text-xs italic">{errors.customer_email?.message}</p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Plan</label>
            <input
              type="text"
              placeholder="Plan Name"
              {...register("plan_name")}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-red-500 text-xs italic">{errors.plan_name?.message}</p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
            <select
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              {...register("plan_type")}
            >
              {typeStatus.map((option) => (
                <option
                  value={option.key}
                  key={option.key}
                  defaultValue=""
                >
                  {option.value}
                </option>
              ))}
            </select>
            <p className="text-red-500 text-xs italic"></p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              {...register("sub_status")}
            >
              {selectStatus.map((option) => (
                <option
                  value={option.key}
                  key={option.key}
                  defaultValue=""
                >
                  {option.value}
                </option>
              ))}
            </select>
            <p className="text-red-500 text-xs italic"></p>
          </div>
        </div>

        <div className="search-buttons pl-2">
          <button
            type="submit"
            className="mr-2 inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          >
            Search
          </button>

          <button
            type="reset"
            onClick={() => getData(1, pageSize)}
            className="inline-block px-6 py-2.5 bg-gray-800 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-gray-900 hover:shadow-lg focus:bg-gray-900 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-900 active:shadow-lg transition duration-150 ease-in-out"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Subscriptions </h4>
        </div>
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                    <span>{column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : ""}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, i) => {
                return (
                  <tr key={i}>
                    {columns.map((cell, index) => {
                      if (cell.accessor == "") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {row.status !== "canceled" ? (
                              <button
                                onClick={() => cancelCustomerSubscription(row.subId)}
                                type="button"
                                className="mx-1 inline-block px-6 py-2.5 bg-red-600 text-white font-medium text-xs leading-tight uppercase rounded-full shadow-md hover:bg-red-700 hover:shadow-lg focus:bg-red-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 active:shadow-lg transition duration-150 ease-in-out"
                              >
                                Cancel
                              </button>
                            ) : (
                              ""
                            )}
                            {row.isMetered === 1 ? (
                              <button
                                onClick={() => createCharge(row.subId, 1)}
                                type="button"
                                className="mx-1 inline-block px-6 py-2.5 bg-red-600 text-white font-medium text-xs leading-tight uppercase rounded-full shadow-md hover:bg-red-700 hover:shadow-lg focus:bg-red-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 active:shadow-lg transition duration-150 ease-in-out"
                              >
                                Create Charge
                              </button>
                            ) : (
                              ""
                            )}
                          </td>
                        );
                      }
                      if (cell.mapping) {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {cell.mapping[row[cell.accessor]]}
                          </td>
                        );
                      }
                      if (row.planType === "recurring" && cell.type === "timestamp") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {new Date(row[cell.accessor] * 1000).toLocaleDateString("en-US", { dateStyle: "medium" })}
                          </td>
                        );
                      } else if (row.planType === "lifetime" && cell.type === "timestamp") {
                        if (cell.accessor === "currentPeriodStart") {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {new Date(row.createdAt * 1000).toLocaleDateString("en-US", { dateStyle: "medium" })}
                            </td>
                          );
                        } else if (cell.accessor === "currentPeriodEnd") {
                          return (
                            <td
                              key={index}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              Infinity
                            </td>
                          );
                        }
                      } else if (cell.type == "currency") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            ${+(row[cell.accessor] ?? 0)}
                          </td>
                        );
                      }
                      return (
                        <td
                          key={index}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {row[cell.accessor]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationBar
        currentPage={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        updatePageSize={updatePageSize}
        previousPage={previousPage}
        nextPage={nextPage}
      />
    </>
  );
};

export default AdminStripeSubscriptionsListPage;
