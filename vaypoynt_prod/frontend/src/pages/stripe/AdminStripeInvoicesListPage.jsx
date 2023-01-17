import React from "react";
import { AuthContext, tokenExpireError } from "../../authContext";
import MkdSDK from "../../utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { getNonNullValue } from "../../utils/utils";
import PaginationBar from "../../components/PaginationBar";
import StripePaginationBar from "../../components/StripePaginationBar";
import AddButton from "../../components/AddButton";

const columns = [
  {
    header: "Status",
    accessor: "status",
  },
  {
    header: "Currency",
    accessor: "currency",
  },
  {
    header: "Amount due",
    accessor: "amount_due",
    type: "currency",
  },
  {
    header: "Amount paid",
    accessor: "amount_paid",
    type: "currency",
  },
  {
    header: "Amount remaining",
    accessor: "amount_remaining",
    type: "currency",
  },
  {
    header: "Created at",
    accessor: "created",
    type: "timestamp",
  },
];

const AdminStripeInvoicesListPage = () => {
  const sdk = new MkdSDK();
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [initialId, setInitialId] = React.useState(null);
  const [data, setData] = React.useState({});
  const [pageSize, setPageSize] = React.useState(10);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);

  const schema = yup.object({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectStatus = [{ key: "", value: "All" }];
  const typeStatus = [{ key: "", value: "All" }];

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData({ limit });
    })();
  }

  function previousPage() {
    (async function () {
      await getData({ limit: pageSize, before: data?.data[0].id });
    })();
  }

  function nextPage() {
    (async function () {
      await getData({ limit: pageSize, after: data?.data[data?.data.length - 1].id });
    })();
  }

  async function getData(paginationParams) {
    try {
      const { list: invoices, limit, error, message } = await sdk.getStripeInvoices(paginationParams);
      console.log(invoices);
      if (error) {
        showToast(globalDispatch, message, 5000);
      }
      if (!invoices) {
        return;
      }

      if (!initialId) {
        setInitialId(invoices?.data[0]?.id ?? "");
      }
      setData(invoices);
      setPageSize(+limit);
      setCanPreviousPage(initialId && initialId !== invoices.data[0]?.id);
      setCanNextPage(invoices.has_more);
    } catch (error) {
      console.error("ERROR", error);
      showToast(globalDispatch, error.message, 5000);
      tokenExpireError(dispatch, error.message);
    }
  }

  const onSubmit = (data) => {
    getData({});
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "invoices",
      },
    });

    (async function () {
      getData({});
    })();
  }, []);

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h4 className="text-2xl font-medium">Search</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap"></div>
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
          <h4 className="text-2xl font-medium">Invoices </h4>
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
              {data?.data?.map((row, i) => {
                return (
                  <tr key={i}>
                    {columns.map((cell, index) => {
                      if (cell.accessor == "") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          ></td>
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
                      if (cell.type === "timestamp") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {new Date(row[cell.accessor] * 1000).toLocaleString("en-US")}
                          </td>
                        );
                      } else if (cell.type === "currency") {
                        return (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            ${Number(row[cell.accessor] / 100).toFixed(2)}
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
      <StripePaginationBar
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

export default AdminStripeInvoicesListPage;
