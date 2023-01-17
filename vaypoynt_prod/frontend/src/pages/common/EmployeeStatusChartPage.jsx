import React from 'react'
import EmployeeDesktopStatusChart from './EmployeeDesktopStatusChart'
import EmployeeStatusChart from './EmployeeStatusChart'


const EmployeeStatusChartPage = () => {
  return (
    <>
    <div className='hidden md:block'>
    <EmployeeDesktopStatusChart/>
    </div>
    <div className='block md:hidden'>
    <EmployeeStatusChart/>
    </div>
    </>
  )
}

export default EmployeeStatusChartPage