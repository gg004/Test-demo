import React from "react";
import { CloseModalImg, btnNext } from "Assets/images";



const FilterModal = ({ onCloseFilterModal,skills,locations,onSelectSkill,onSelectLocation }) => {
  return (
    <>
      <div className="modal-holder flex items-center justify-center">
        <div className="filter-box-holder shadow p-4 bg-white">
          <h5 className="font-bold text-center text-lg">Filter</h5>
          <div className="filter-close" onClick={onCloseFilterModal}>
            <img className="w-5 h-5" src={CloseModalImg} />
          </div>

          <div className="filter-field-holder mt-4">
            <fieldset className="cus-input mb-4">
              <label className="block mb-2 text-md font-medium text-gray-900">
                Skills
              </label>
              <div className="relative">
                <select  
                onChange={(e)=>onSelectSkill(e.target.value)}
                className="bg-white  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4  dark:bg-gray-200 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
                   <option
                      name={"All"}
                      value={"All"}
                      key={"All"}
                    >
                      {"All"}
                    </option>
                  {skills.map((option) => (
                    <option
                      name={option}
                      value={option}
                      key={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>
            <fieldset className="cus-input mb-2">
              <label className="block mb-2 text-md font-medium text-gray-900">
                Locations
              </label>
              <div className="relative">
                <select   onChange={(e)=>onSelectLocation(e.target.value)} className="bg-white  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4  dark:bg-gray-200 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option
                      name={"All"}
                      value={"All"}
                      key={"All"}
                    >
                      {"All"}
                    </option>
                  {locations.map((option) => (
                    <option
                      name={option}
                      value={option}
                      key={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <button
              className="form-submit mt-4"
              type="button"
            >
              Apply Now <img src={btnNext} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterModal;
