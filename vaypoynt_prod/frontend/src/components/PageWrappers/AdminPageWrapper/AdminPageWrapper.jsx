import AdminHeader from 'Components/AdminHeader'
import TopHeader from 'Components/TopHeader'
import React from 'react'

export const AdminPageWrapper = ( { children } ) => {

  return (
    <div className={ `flex w-full` }>
      <AdminHeader />
      <div className={ `w-full` }>

        <TopHeader />
        { children }
      </div>
    </div>
  )
}
