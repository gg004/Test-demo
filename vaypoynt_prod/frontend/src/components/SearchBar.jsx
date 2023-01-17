import React, { useCallback, useState } from "react";
import { SearchImg, FilterImg } from "Assets/images";
import FilterModal from "./FilterModal";

const SearchBar = ( { Placeholder, hideFilter, onChange, value, onTapped, className } ) => {


  return (
    <>

      <div className={ `page-search-holder max-w-[800px] w-full mx-auto flex gap-4 items-center mb-10 bg-white rounded-md p-1 pr-1 shadow-md ${ className }` }>
        <div className="search-field flex items-center">
          <button type="button">
            <img src={ SearchImg } />
          </button>
          <input type="text" placeholder={ Placeholder } onChange={ onChange } value={ value } />
        </div>
        { !hideFilter && (
          <button
            className="search-filter"
            onClick={ onTapped }
          >
            <img src={ FilterImg } />
          </button>
        ) }
      </div>
    </>
  );
};

SearchBar.defaultProps = {
  className: "-mt-6"
};
export default SearchBar;
