import React from "react";
import { AuthContext, tokenExpireError } from "../../authContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import MkdSDK from "Utils/MkdSDK";
import { GlobalContext, showToast } from "../../globalContext";
import { getNonNullValue } from "Utils/utils";
import PaginationBar from "../../components/PaginationBar";
import AddButton from "../../components/AddButton";
import Skeleton from "react-loading-skeleton";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Photos",
    accessor: "url",
  },
  {
    header: "Create at",
    accessor: "create_at",
  },

  {
    header: "Action",
    accessor: "",
  },
];

const AdminPhotoListPage = () => {
  const { dispatch } = React.useContext( AuthContext );
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );
  const [ query, setQuery ] = React.useState( "" );
  const [ data, setCurrentTableData ] = React.useState( [] );
  const [ pageSize, setPageSize ] = React.useState( 3 );
  const [ pageCount, setPageCount ] = React.useState( 0 );
  const [ dataTotal, setDataTotal ] = React.useState( 0 );
  const [ currentPage, setPage ] = React.useState( 0 );
  const [ canPreviousPage, setCanPreviousPage ] = React.useState( false );
  const [ canNextPage, setCanNextPage ] = React.useState( false );
  const [ loadingData, setLoadingData ] = React.useState( false );
  const navigate = useNavigate();
  const globalContext = React.useContext( GlobalContext );

  const schema = yup.object( {
    date: yup.string(),
    id: yup.string(),
    user_id: yup.string(),
  } );
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm( {
    resolver: yupResolver( schema ),
  } );

  function updatePageSize ( limit ) {
    ( async function () {
      setPageSize( limit );
      await getData( 0, limit );
    } )();
  }
  function previousPage () {
    ( async function () {
      await getData( currentPage - 1 > 0 ? currentPage - 1 : 0, pageSize );
    } )();
  }
  function nextPage () {
    ( async function () {
      await getData( currentPage + 1 <= pageCount ? currentPage + 1 : 0, pageSize );
    } )();
  }

  async function getData ( pageNum, limitNum, data ) {
    try {
      sdk.setTable( "photo" );
      const result = await sdk.callRestAPI(
        {
          payload: { ...data },
          page: pageNum,
          limit: limitNum,
        },
        "PAGINATE"
      );

      const { list, total, limit, num_pages, page } = result;

      setCurrentTableData( list );
      setPageSize( limit );
      setPageCount( num_pages );
      setPage( page );
      setDataTotal( total );
      setCanPreviousPage( page > 1 );
      setCanNextPage( page + 1 <= num_pages );
    } catch ( error ) {
      console.log( "ERROR", error );
      tokenExpireError( dispatch, error.message );
    }
  }

  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "photos",
      },
    } );

    ( async function () {
      setLoadingData( true );
      await getData( 0, 50 );
      setLoadingData( false );
    } )();
  }, [] );

  async function deleteImage ( id ) {
    sdk.setTable( "photo" );
    const result = await sdk.callRestAPI( { id }, "DELETE" );
    showToast( globalDispatch, "Deleted" );
    await getData( 0, 50 );
  }

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
        onSubmit={ handleSubmit( ( data ) => {
          let create_at = getNonNullValue( data.date );
          let id = getNonNullValue( data.id );
          let user_id = getNonNullValue( data.user_id );
          let filter = { create_at, id, user_id };
          getData( 0, 50, filter );
        } ) }
      >
        <h4 className="text-2xl font-medium">Photo Search</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label className=" text-gray-700 text-sm font-bold mb-2">Date</label>
            <input
              type="date"
              placeholder="Description"
              { ...register( "date" ) }
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-red-500 text-xs italic">{ errors.date?.message }</p>
          </div>
          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label className=" text-gray-700 text-sm font-bold mb-2">ID</label>
            <input
              type="text"
              placeholder="id"
              { ...register( "id" ) }
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-red-500 text-xs italic">{ errors.id?.message }</p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label className=" text-gray-700 text-sm font-bold mb-2">User ID</label>
            <input
              type="text"
              placeholder="User id"
              className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              { ...register( "user_id" ) }
            />

            <p className="text-red-500 text-xs italic">{ errors.user_id?.message }</p>
          </div>
        </div>

        <button type="submit" className="block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Search
        </button>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">Photos </h4>
          <AddButton link={ "/admin/add-photos" } />
        </div>
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                { columns.map( ( column, index ) => (
                  <th key={ index } scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    { column.header }
                    <span>{ column.isSorted ? ( column.isSortedDesc ? " ▼" : " ▲" ) : "" }</span>
                  </th>
                ) ) }
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              { data.length == 0 ? (
                <tr>
                  <td colSpan={ 3 }>
                    { loadingData && <Skeleton count={ 4 } /> }
                  </td>
                </tr>
              ) : null }
              { data.map( ( row, i ) => {
                return (
                  <tr key={ i }>
                    { columns.map( ( cell, index ) => {
                      if ( cell.accessor == "" ) {
                        return (
                          <td key={ index } className="px-6 py-4 whitespace-nowrap">
                            <button
                              className="text-xs text-red-400"
                              onClick={ () => {
                                deleteImage( row.id );
                              } }
                            >
                              { " " }
                              Delete
                            </button>
                          </td>
                        );
                      }
                      if ( cell.mapping ) {
                        return (
                          <td key={ index } className="px-6 py-4 whitespace-nowrap">
                            { cell.mapping[ row[ cell.accessor ] ] }
                          </td>
                        );
                      }
                      return (
                        <td key={ index } className="px-6 py-4 whitespace-nowrap">
                          { cell.accessor == "url" ? <img width={ 200 } height={ 200 } src={ `https://mkdlabs.com${ row[ cell.accessor ] }` } /> : row[ cell.accessor ] }
                        </td>
                      );
                    } ) }
                  </tr>
                );
              } ) }
            </tbody>
          </table>
        </div>
      </div>
      <PaginationBar
        currentPage={ currentPage }
        pageCount={ pageCount }
        pageSize={ pageSize }
        canPreviousPage={ canPreviousPage }
        canNextPage={ canNextPage }
        updatePageSize={ updatePageSize }
        previousPage={ previousPage }
        nextPage={ nextPage }
      />
    </>
  );
};

export default AdminPhotoListPage;
