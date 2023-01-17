import React from 'react'
import EmployeeHeader from 'Components/EmployeeHeader'

export const EmployeePageWrapper = ( { children } ) => {

  return (
    <>
      <EmployeeHeader />

      { children }
    </>
  )
}
