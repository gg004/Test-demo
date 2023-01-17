import React from "react";
import PasswordUpdate from "./PasswordUpdate";
import AddRecoveryEmail from "./AddRecoveryEmail";
const AccountManagementTab = () => {
  

  return (
    <>
     <PasswordUpdate/>
    <AddRecoveryEmail/>
      {/* <fieldset className="cus-input">
        <label
          for="address"
          className="block mb-2 text-md font-medium text-gray-900"
        >
          New Email User Admin
        </label>
        <div className="relative mb-6">
          <input
            type="email"
            className="bg-gray-50  text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-5  dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Admin Email            "
          />
        </div>
      </fieldset> */}
    </>
  );
};

export default AccountManagementTab;
