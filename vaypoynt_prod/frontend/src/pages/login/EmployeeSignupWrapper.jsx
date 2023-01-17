import React from 'react'
import EmployeeSignupPage from './EmployeeSignupPage'
import EmployeeSignupMobilePage from './EmployeeSignupMobilePage'

const EmployeeSignupWrapper = () => {
  return (
    <>
    <div className=" md:block hidden">
        <EmployeeSignupPage/>
    </div>
    <div className="block md:hidden">
        <EmployeeSignupMobilePage/>
    </div>
    </>
  )
}

export default EmployeeSignupWrapper