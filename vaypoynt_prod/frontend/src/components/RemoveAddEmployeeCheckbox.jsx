import React from "react";

const RemoveAddEmployeeCheckbox = ({ ChecboxLabel,isChecked,onChecked }) => {
  return (
    <>
      <div className="flex gap-2 w-full">
        <input className="w-5" type="checkbox"  onChange={() => onChecked(!isChecked)} checked={isChecked} />
        <label className="text-xl font-semibold">{ChecboxLabel}</label>
      </div>
    
    </>
  );
};

export default RemoveAddEmployeeCheckbox;
