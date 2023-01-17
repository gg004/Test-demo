import React from 'react'

const DepartmentCard = ( { departTitle, departMembers, color } ) => {
  return (
    <div style={ { background: color } } className={ `department-box h-[120px] shadow-lg rounded-xl p-4 relative flex justify-center items-center` }>
      <div className={ `text-black text-[20px] font-medium` }  >{ departTitle }</div>
      <p className={ `absolute inset-x-0 bottom-2 m-auto text-xs text-[#58a4e0]` }><span>{ departMembers }</span> { departMembers !== undefined ? "Members" : null }</p>
    </div>
  )
}

DepartmentCard.defaultProps = {
  departTitle: undefined,
  departMembers: undefined,
  color: "#ffffff",
}

export default DepartmentCard
