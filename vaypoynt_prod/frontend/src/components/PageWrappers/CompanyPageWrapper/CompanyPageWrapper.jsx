import CompanyHeader from 'Components/CompanyHeader'
import React from 'react'


export const CompanyPageWrapper = ( { children } ) => {

  return (
    <>
      <CompanyHeader />

      { children }
    </>
  )
}
