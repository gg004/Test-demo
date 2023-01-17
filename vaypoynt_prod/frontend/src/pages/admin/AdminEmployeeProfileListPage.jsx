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
    header: 'Employee Id',
    accessor: 'user_id',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'First Name',
    accessor: 'first_name',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Last Name',
    accessor: 'last_name',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Email',
    accessor: 'email',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
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
    header: 'Title',
    accessor: 'title',
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
    header: 'Floor',
    accessor: 'floor',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Address',
    accessor: 'address',
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {}
  },
  {
    header: 'Profile Photo',
    accessor: 'profile_photo',
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

const AdminEmployeeProfileListPage = () => {
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

    user_id: yup.string(),
    first_name: yup.string(),
    last_name: yup.string(),
    company_id: yup.string(),
    title: yup.string(),
    department_id: yup.string(),
    // floor: yup.string(),
    // address: yup.string(),
    // profile_photo: yup.string(),
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
      sdk.setTable( "user" );
      let sortField = columns.filter( ( col ) => col.isSorted );
      const result = await sdk.getAllEmployees(
        {
          payload: { ...currentTableData },
          page: pageNum,
          limit: limitNum,
          sortId: sortField.length ? sortField[ 0 ].accessor : "",
          direction: sortField.length ? ( sortField[ 0 ].isSortedDesc ? "DESC" : "ASC" ) : "",
        },
      );

      const { list, total, limit, num_pages, page } = result;
      console.log( list )
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
      sdk.setTable( "user" );
      const result = await sdk.callRestAPI( { id }, "DELETE" );
      setCurrentTableData( list => list.filter( x => Number( x.id ) !== Number( id ) ) );
    } catch ( err ) {
      throw new Error( err );
    }

  }

  const exportTable = async ( id ) => {
    try {
      sdk.setTable( "employee_profile" );
      const result = await sdk.exportCSV();
    } catch ( err ) {
      throw new Error( err );
    }

  }

  const onSubmit = ( data ) => {
    let id = getNonNullValue( data.id );
    let user_id = getNonNullValue( data.user_id );
    let first_name = getNonNullValue( data.first_name );
    let last_name = getNonNullValue( data.last_name );
    let company_id = getNonNullValue( data.company_id );
    let title = getNonNullValue( data.title );
    let department_id = getNonNullValue( data.department_id );
    let floor = getNonNullValue( data.floor );
    let address = getNonNullValue( data.address );
    let profile_photo = getNonNullValue( data.profile_photo );
    let filter = {
      id,

      user_id: user_id,
      first_name: first_name,
      last_name: last_name,
      company_id: company_id,
      title: title,
      department_id: department_id,
      // floor: floor,
      // address: address,
      // profile_photo: profile_photo,
    };
    getData( 1, pageSize, filter );
  };

  React.useEffect( () => {
    globalDispatch( {
      type: "SETPATH",
      payload: {
        path: "employee_profile",
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
        <h4 className="text-2xl font-medium">Employee Search</h4>
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
              htmlFor="user_id"
            >
              Employee Id
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
              htmlFor="first_name"
            >
              First Name
            </label>
            <input
              placeholder="First Name"
              { ...register( "first_name" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.first_name?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.first_name?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="last_name"
            >
              Last Name
            </label>
            <input
              placeholder="Last Name"
              { ...register( "last_name" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.last_name?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.last_name?.message }
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
              htmlFor="title"
            >
              Title
            </label>
            <input
              placeholder="Title"
              { ...register( "title" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.title?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.title?.message }
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

          {/* <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
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
              htmlFor="address"
            >
              Address
            </label>
            <input
              placeholder="Address"
              { ...register( "address" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.address?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.address?.message }
            </p>
          </div>

          <div className="mb-4 w-full md:w-1/2 pr-2 pl-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="profile_photo"
            >
              Profile Photo
            </label>
            <input
              placeholder="Profile Photo"
              { ...register( "profile_photo" ) }
              className={ `"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${ errors.profile_photo?.message ? "border-red-500" : ""
                }` }
            />
            <p className="text-red-500 text-xs italic">
              { errors.profile_photo?.message }
            </p>
          </div> */}

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
          <h4 className="text-2xl font-medium">Employee</h4>
          <div className="flex">
            <AddButton link={ "/admin/add-employee_profile" } />
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
                                navigate( "/admin/edit-employee_profile/" + row.id, {
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
                                navigate( "/admin/view-employee_profile/" + row.id, {
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
                        <td
                          key={ index }
                          className="px-6 py-4 whitespace-nowrap">
                          { cell.accessor === "profile_photo" ?
                            ( <img
                              src={ row[ cell.accessor ] }
                              className={ `w-[100px] h-[30px] rounded-md` }
                            />
                            )
                            : cell.accessor === "email" ?
                              ( <a
                                href={ `mailto:${ row[ cell.accessor ] }` }
                              >
                                { row[ cell.accessor ] }
                              </a> )
                              : row[ cell.accessor ]
                          }
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

export default AdminEmployeeProfileListPage;
