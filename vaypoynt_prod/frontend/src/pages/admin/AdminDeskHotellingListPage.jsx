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
    header: 'ID',
    accessor: 'id',
    isSorted: true,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Floor',
    accessor: 'floor',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'User Id',
    accessor: 'user_id',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Start Time',
    accessor: 'start_time',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'End Time',
    accessor: 'end_time',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Desk Number',
    accessor: 'desk_number',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Status Type',
    accessor: 'status_type',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: true,
    mappings: { 0: ' Office', 1: ' WFH', 2: ' Vacation', 3: ' Holiday', 4: ' Sick Day', 5: ' Meeting' }
  },
  {
    header: 'Company Id',
    accessor: 'company_id',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Department Id',
    accessor: 'department_id',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },

  {
    header: "Action",
    accessor: "",
  },
];

const AdminDeskHotellingListPage = () => {
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
  // .matches( /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}/, "Date Time Format YYYY-MM-DDTHH:MM" ),
  // .matches( /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}/, "Date Time Format YYYY-MM-DDTHH:MM" ),

  const schema = yup.object( {

    floor: yup.string(),
    user_id: yup.string(),
    start_time: yup.string(),
    end_time: yup.string(),
    desk_number: yup.string(),
    status_type: yup.string(),
    company_id: yup.string(),
    department_id: yup.string(),
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
      sdk.setTable( "desk_hotelling" );
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
      sdk.setTable( "desk_hotelling" );
      const result = await sdk.callRestAPI( { id }, "DELETE" );
      setCurrentTableData( list => list.filter( x => Number( x.id ) !== Number( id ) ) );
    } catch ( err ) {
      throw new Error( err );
    }

  }

  const exportTable = async ( id ) => {
    try {
      sdk.setTable( "desk_hotelling" );
      const result = await sdk.exportCSV();
    } catch ( err ) {
      throw new Error( err );
    }

  }

  const onSubmit = ( data ) => {
    let id = getNonNullValue( data.id );
    let floor = getNonNullValue( data.floor );
    let user_id = getNonNullValue( data.user_id );
    let start_time = getNonNullValue( data.start_time );
    let end_time = getNonNullValue( data.end_time );
    let desk_number = getNonNullValue( data.desk_number );
    let status_type = getNonNullValue( data.status_type );
    let company_id = getNonNullValue( data.company_id );
    let department_id = getNonNullValue( data.department_id );
    let filter = {
      id,

      floor: floor,
      user_id: user_id,
      start_time: start_time,
      end_time: end_time,
      desk_number: desk_number,
      status_type: status_type,
      company_id: company_id,
      department_id: department_id,
    };
    getData( 1, pageSize, filter );
  };

  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "desk_hotelling",
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
        <h4 className="text-2xl font-medium">DeskHotelling Search</h4>
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
              htmlFor="floor"
            >
              Floor
            </label>
            <input
              placeholder="Floor"
              { ...register( "floor" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.floor?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.floor?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="user_id"
            >
              User Id
            </label>
            <input
              placeholder="User Id"
              { ...register( "user_id" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.user_id?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.user_id?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="start_time"
            >
              Start Time
            </label>
            <input
              type="datetime-local"
              placeholder="Start Time"
              { ...register( "start_time" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.start_time?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.start_time?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="end_time"
            >
              End Time
            </label>
            <input
              type="datetime-local"
              placeholder="End Time"
              { ...register( "end_time" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.end_time?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.end_time?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="desk_number"
            >
              Desk Number
            </label>
            <input
              placeholder="Desk Number"
              { ...register( "desk_number" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.desk_number?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.desk_number?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="status_type"
            >
              Status Type
            </label>
            <select
              placeholder="Status Type"
              { ...register( "status_type" ) }
              className={ `"shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.status_type?.message ? "border-red-500" : ""
                }` }
            >
              <option></option>
              <option value={ 0 }>office</option>
              <option value={ 1 }>wfh</option>
              <option value={ 2 }>vacation</option>
              <option value={ 3 }>holiday</option>
              <option value={ 4 }>sick day</option>
              <option value={ 5 }>meeting</option>
            </select>

            <p className="text-red-500 text-xs italic">
              { errors.status_type?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="company_id"
            >
              Company Id
            </label>
            <input
              placeholder="Company Id"
              { ...register( "company_id" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.company_id?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.company_id?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="department_id"
            >
              Department Id
            </label>
            <input
              placeholder="Department Id"
              { ...register( "department_id" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.department_id?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.department_id?.message }
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
          <h4 className="text-2xl font-medium">DeskHotelling</h4>
          <div className="flex">
            <AddButton link={ "/admin/add-desk_hotelling" } />
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
                                navigate( "/admin/edit-desk_hotelling/" + row.id, {
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
                                navigate( "/admin/view-desk_hotelling/" + row.id, {
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

export default AdminDeskHotellingListPage;
