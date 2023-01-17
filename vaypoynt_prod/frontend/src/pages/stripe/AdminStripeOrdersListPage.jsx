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
import AddButton from "../../components/AddButton";

const columns = [
  {
    header: "Product",
    accessor: "product_name",
  },
  {
    header: "Customer",
    accessor: "customer",
  },
  {
    header: "Currency",
    accessor: "currency",
  },
  {
    header: "Amount",
    accessor: "amount",
    type: "currency",
  },
  {
    header: "Created at",
    accessor: "created_at",
    type: "timestamp",
  },
  {
    header: "Status",
    accessor: "status",
  },
];
const AdminStripeOrdersListPage = () => {
  const sdk = new MkdSDK();

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
    product_name: yup.string(),
    customer_email: yup.string(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectStatus = [{ key: "", value: "All" }];

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
      const { list, total, limit, num_pages, page, error, message } = await sdk.getStripeOrders({ page: pageNum, limit: limitNum }, data);

      if (error) {
        showToast(globalDispatch, message, 5000);
        return;
      }

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
    const product_name = getNonNullValue(data.product_name);
    getData(1, pageSize, { customer_email, product_name });
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "orders",
      },
    });

    (async function () {
      await getData(1, pageSize);
    })();
  }, []);

  return (
    <>
      <form className="p-5 bg-white shadow rounded mb-10" onSubmit={handleSubmit(onSubmit)}>
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
            <label className="block text-gray-700 text-sm font-bold mb-2">Product</label>
            <input
              type="text"
              placeholder="Product name"
              {...register("product_name")}
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-red-500 text-xs italic">{errors.product_name?.message}</p>
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
          <h4 className="text-2xl font-medium">Orders </h4>
        </div>
        <div className="shadow overflow-x-auto border rounded-md border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        return <td key={index} className="px-6 py-4 whitespace-nowrap"></td>;
                      }
                      if (cell.mapping) {
                        return (
                          <td key={index} className="px-6 py-4 whitespace-nowrap">
                            {cell.mapping[row[cell.accessor]]}
                          </td>
                        );
                      }
                      if (cell.type === "timestamp") {
                        return (
                          <td key={index} className="px-6 py-4 whitespace-nowrap">
                            {new Date(row[cell.accessor] * 1000).toLocaleString("en-US")}
                          </td>
                        );
                      } else if (cell.type === "currency") {
                        return (
                          <td key={index} className="px-6 py-4 whitespace-nowrap">
                            ${Number(row[cell.accessor] / 100).toFixed(2)}
                          </td>
                        );
                      } else if (cell.type === "metadata") {
                        return (
                          <td key={index} className="px-6 py-4 whitespace-nowrap">
                            {row[cell.pre_accessor][cell.accessor] ?? "n/a"}
                          </td>
                        );
                      }
                      return (
                        <td key={index} className="px-6 py-4 whitespace-nowrap">
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

export default AdminStripeOrdersListPage;
