import React from "react";
import { AuthContext } from "../../authContext";
import MkdSDK from "Utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../globalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue } from "Utils/utils";
import PaginationBar from "../../components/PaginationBar";
import AddButton from "../../components/AddButton";
import ExportButton from "../../components/ExportButton";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Action",
    accessor: "",
  },

  {
    header: 'ID',
    accessor: 'id',
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Key',
    accessor: 'key',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Value',
    accessor: 'value',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },

];

const EmployeeStripeSettingListPage = () => {
  const { dispatch } = React.useContext( AuthContext );
  const { dispatch: globalDispatch } = React.useContext( GlobalContext );

  const [ query, setQuery ] = React.useState( "" );
  const [ currentTableData, setCurrentTableData ] = React.useState( [] );
  const [ pageSize, setPageSize ] = React.useState( 10 );
  const [ pageCount, setPageCount ] = React.useState( 0 );
  const [ dataTotal, setDataTotal ] = React.useState( 0 );
  const [ currentPage, setPage ] = React.useState( 0 );
  const [ canPreviousPage, setCanPreviousPage ] = React.useState( false );
  const [ canNextPage, setCanNextPage ] = React.useState( false );
  const navigate = useNavigate();

  const schema = yup.object( {

    key: yup.string(),
    value: yup.string(),
  } );
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm( {
    resolver: yupResolver( schema ),
  } );

  function onSort ( columnIndex ) {
    console.log( columns[ columnIndex ] );
    if ( columns[ columnIndex ].isSorted ) {
      columns[ columnIndex ].isSortedDesc = !columns[ columnIndex ].isSortedDesc;
    } else {
      columns.map( ( i ) => ( i.isSorted = false ) );
      columns.map( ( i ) => ( i.isSortedDesc = false ) );
      columns[ columnIndex ].isSorted = true;
    }

    ( async function () {
      await getData( 0, pageSize );
    } )();
  }


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
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 0,
        pageSize
      );
    } )();
  }

  async function getData ( pageNum, limitNum, currentTableData ) {
    try {
      sdk.setTable( "stripe_setting" );
      let sortField = columns.filter( ( col ) => col.isSorted );
      const result = await sdk.callRestAPI(
        {
          payload: { ...currentTableData },
          page: pageNum,
          limit: limitNum,
          sortId: sortField.length ? sortField[ 0 ].accessor : "",
          direction: sortField.length ? ( sortField[ 0 ].isSortedDesc ? "DESC" : "ASC" ) : "",
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

  const deleteItem = async ( id ) => {
    try {
      sdk.setTable( "stripe_setting" );
      const result = await sdk.callRestAPI( { id }, "DELETE" );
      setCurrentTableData( list => list.filter( x => Number( x.id ) !== Number( id ) ) );
    } catch ( err ) {
      throw new Error( err );
    }

  }

  const exportTable = async ( id ) => {
    try {
      sdk.setTable( "stripe_setting" );
      const result = await sdk.exportCSV();
    } catch ( err ) {
      throw new Error( err );
    }

  }

  const onSubmit = ( data ) => {
    let id = getNonNullValue( data.id );
    let key = getNonNullValue( data.key );
    let value = getNonNullValue( data.value );
    let filter = {
      id,

      key: key,
      value: value,
    };
    getData( 1, pageSize, filter );
  };

  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "stripe_setting",
      },
    } );

    ( async function () {
      await getData( 1, pageSize );
    } )();
  }, [] );

  return (
    <>
      <form
        className="p-5 bg-white shadow rounded mb-10"
        onSubmit={ handleSubmit( onSubmit ) }
      >
        <h4 className="text-2xl font-medium">StripeSetting Search</h4>
        <div className="filter-form-holder mt-10 flex flex-wrap">

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="id"
            >
              Id
            </label>
            <input
              placeholder="Id"
              { ...register( "id" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.id?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.id?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="key"
            >
              Key
            </label>
            <input
              placeholder="Key"
              { ...register( "key" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.key?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.key?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="value"
            >
              Value
            </label>
            <input
              placeholder="Value"
              { ...register( "value" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.value?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.value?.message }
            </p>
          </div>

        </div>
        <button
          type="submit"
          className=" block ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto  p-5 bg-white shadow rounded">
        <div className="mb-3 text-center justify-between w-full flex  ">
          <h4 className="text-2xl font-medium">StripeSetting</h4>
          <div className="flex">
            <AddButton link={ "/employee/add-stripe_setting" } />
            <ExportButton onClick={ exportTable } className="mx-1" />
          </div>
        </div>
        <div className="shadow overflow-x-auto border-b border-gray-200 ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                { columns.map( ( column, i ) => (
                  <th
                    key={ i }
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={ () => onSort( i ) }
                  >
                    { column.header }
                    <span>
                      { column.isSorted
                        ? column.isSortedDesc
                          ? " ▼"
                          : " ▲"
                        : "" }
                    </span>
                  </th>
                ) ) }
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              { currentTableData.map( ( row, i ) => {
                return (
                  <tr key={ i }>
                    { columns.map( ( cell, index ) => {
                      if ( cell.accessor == "" ) {
                        return (
                          <td
                            key={ index }
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <button
                              className="text-xs"
                              onClick={ () => {
                                navigate( "/employee/edit-stripe_setting/" + row.id, {
                                  state: row,
                                } );
                              } }
                            >
                              { " " }
                              Edit
                            </button>
                            <button
                              className="text-xs px-1 text-blue-500"
                              onClick={ () => {
                                navigate( "/employee/view-stripe_setting/" + row.id, {
                                  state: row,
                                } );
                              } }
                            >
                              { " " }
                              View
                            </button>
                            <button
                              className="text-xs px-1 text-red-500"
                              onClick={ () => deleteItem( row.id ) }
                            >
                              { " " }
                              Delete
                            </button>
                          </td>
                        );
                      }
                      if ( cell.mappingExist ) {
                        return (
                          <td
                            key={ index }
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            { cell.mappings[ row[ cell.accessor ] ] }
                          </td>
                        );
                      }
                      return (
                        <td key={ index } className="px-6 py-4 whitespace-nowrap">
                          { row[ cell.accessor ] }
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

export default EmployeeStripeSettingListPage;
