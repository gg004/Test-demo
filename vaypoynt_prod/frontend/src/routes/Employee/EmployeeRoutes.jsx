import React from 'react'
import { Route, Routes } from 'react-router'
import { EmployeeAppIntegrationPage, EmployeeDeskHotellingWrapper, EmployeeEmployeeListPage, MyProfile } from 'Pages/employee'
import { DepartmentPage, EmployeeProfilePage, EmployeeStatusChartPage } from 'Pages/common'
import { EmployeePageWrapper, PublicPageWrapper } from 'Components/PageWrappers'
import MarketingPage from 'Pages/MarketingPage'
import { NotFoundPage } from 'Pages/404'
import PrivacyPolicyPage from 'Pages/PrivacyPolicyPage'
import TermsConditionPage from 'Pages/TermsConditionPage'

export const EmployeeRoutes = () => {
  return (
    <Routes>
      {/* <Route exact path="/employee" element={ <EmployeePageWrapper> <EmployeeDashboardPage /> </EmployeePageWrapper> }></Route> */ }
      <Route exact path="/employee/dashboard" element={ <EmployeePageWrapper> <EmployeeEmployeeListPage /> </EmployeePageWrapper> }></Route>
      <Route exact path="/employee/status" element={ <EmployeePageWrapper> <EmployeeStatusChartPage /> </EmployeePageWrapper> }></Route>
      <Route exact path="/employee/profile" element={ <EmployeePageWrapper> <EmployeeProfilePage /> </EmployeePageWrapper> }></Route>
      <Route path="/employee/department" element={ <EmployeePageWrapper> <DepartmentPage /> </EmployeePageWrapper> }></Route>
      <Route path="/employee/apps" element={ <EmployeePageWrapper> <EmployeeAppIntegrationPage /> </EmployeePageWrapper> }></Route>
      <Route exact path="/employee/my_profile" element={ <EmployeePageWrapper> <MyProfile /> </EmployeePageWrapper> }></Route>
      <Route exact path="/employee/desk-hotteling" element={ <EmployeePageWrapper> <EmployeeDeskHotellingWrapper /> </EmployeePageWrapper> }></Route>

      <Route exact path="/" element={ <PublicPageWrapper> <MarketingPage /> </PublicPageWrapper> }></Route>
      <Route exact path="privacy_policy" element={ <PublicPageWrapper> <PrivacyPolicyPage /> </PublicPageWrapper> }></Route>
      <Route exact path="terms_and_conditions" element={ <PublicPageWrapper> <TermsConditionPage /> </PublicPageWrapper> }></Route>
      <Route
        path="*"
        element={ <EmployeePageWrapper> <NotFoundPage /> </EmployeePageWrapper> }
      ></Route>
      {/* element={<Navigate to="/employee" /> || <NotFoundPage />} */ }
    </Routes>
  )
}
