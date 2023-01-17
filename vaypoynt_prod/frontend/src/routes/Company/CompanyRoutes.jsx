import React from 'react'
import { Route, Routes } from 'react-router'
import {
  AddCompanyCompanyProfilePage,
  AddCompanyDepartmentPage,
  AddCompanyDeskHotellingPage,
  AddCompanyDeskTicketPage,
  AddCompanyEmployeeProfilePage,
  EditCompanyCompanyProfilePage,
  EditCompanyDepartmentPage,
  EditCompanyDeskHotellingPage,
  EditCompanyDeskTicketPage,
  EditCompanyEmployeeProfilePage,
  UserCheckoutCallback,
  ViewCompanyCompanyProfilePage,
  ViewCompanyDepartmentPage,
  ViewCompanyDeskHotellingPage,
  ViewCompanyDeskTicketPage,
  ViewCompanyEmployeeProfilePage
} from 'Pages/admin'
import {
  DepartmentPage,
  DeskHottelling,
  EmployeePage,
  EmployeeProfilePage,
  SettingPage,
  StatusChartPage,
} from 'Pages/common'
import {
  CompanyCompanyProfileListPage,
  CompanyDashboardPage,
  CompanyDeskHotellingListPage,
  CompanyDeskTicketListPage,
  CompanyEmployeeProfileListPage,
  CompanyProfilePage
} from 'Pages/company'
import MarketingPage from 'Pages/MarketingPage'
import PrivacyPolicyPage from 'Pages/PrivacyPolicyPage'
import TermsConditionPage from 'Pages/TermsConditionPage'
import { NotFoundPage } from 'Pages/404'
import { CompanyPageWrapper, PublicPageWrapper } from 'Components/PageWrappers'

export const CompanyRoutes = () => {
  return (
    <Routes>
      <Route exact path="/company" element={ <CompanyPageWrapper> <CompanyDashboardPage /> </CompanyPageWrapper> }></Route>
      <Route exact path="/company/dashboard" element={ <CompanyPageWrapper> <EmployeePage /> </CompanyPageWrapper> }></Route>
      <Route exact path="/company/employee_profile" element={ <CompanyPageWrapper> <EmployeeProfilePage /> </CompanyPageWrapper> }></Route>
      <Route exact path="/company/setting" element={ <CompanyPageWrapper> <SettingPage /> </CompanyPageWrapper> }></Route>
      <Route exact path="/company/profile" element={ <CompanyPageWrapper> <CompanyProfilePage /> </CompanyPageWrapper> }></Route>

      <Route exact path="/company/employee" element={ <CompanyPageWrapper> <EmployeePage /> </CompanyPageWrapper> }></Route>
      <Route exact path="/company/department" element={ <CompanyPageWrapper> <DepartmentPage /> </CompanyPageWrapper> }></Route>
      <Route exact path="/company/desk-hotteling" element={ <CompanyPageWrapper> <DeskHottelling /> </CompanyPageWrapper> }></Route>
      <Route exact path="/company/status-chart" element={ <CompanyPageWrapper> <StatusChartPage /> </CompanyPageWrapper> }></Route>

      <Route path="/company/company_profile" element={ <CompanyPageWrapper> <CompanyCompanyProfileListPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/add-company_profile" element={ <CompanyPageWrapper> <AddCompanyCompanyProfilePage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/edit-company_profile/:id" element={ <CompanyPageWrapper> <EditCompanyCompanyProfilePage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/view-company_profile/:id" element={ <CompanyPageWrapper> <ViewCompanyCompanyProfilePage /> </CompanyPageWrapper> }></Route>

      <Route path="/company/desk_ticket" element={ <CompanyPageWrapper> <CompanyDeskTicketListPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/add-desk_ticket" element={ <CompanyPageWrapper> <AddCompanyDeskTicketPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/edit-desk_ticket/:id" element={ <CompanyPageWrapper> <EditCompanyDeskTicketPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/view-desk_ticket/:id" element={ <CompanyPageWrapper> <ViewCompanyDeskTicketPage /> </CompanyPageWrapper> }></Route>

      <Route path="/company/add-department" element={ <CompanyPageWrapper> <AddCompanyDepartmentPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/edit-department/:id" element={ <CompanyPageWrapper> <EditCompanyDepartmentPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/view-department/:id" element={ <CompanyPageWrapper> <ViewCompanyDepartmentPage /> </CompanyPageWrapper> }></Route>

      <Route path="/company/employee_profile" element={ <CompanyPageWrapper> <CompanyEmployeeProfileListPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/add-employee_profile" element={ <CompanyPageWrapper> <AddCompanyEmployeeProfilePage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/edit-employee_profile/:id" element={ <CompanyPageWrapper> <EditCompanyEmployeeProfilePage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/view-employee_profile/:id" element={ <CompanyPageWrapper> <ViewCompanyEmployeeProfilePage /> </CompanyPageWrapper> }></Route>

      <Route path="/company/desk_hotelling" element={ <CompanyPageWrapper> <CompanyDeskHotellingListPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/add-desk_hotelling" element={ <CompanyPageWrapper> <AddCompanyDeskHotellingPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/edit-desk_hotelling/:id" element={ <CompanyPageWrapper> <EditCompanyDeskHotellingPage /> </CompanyPageWrapper> }></Route>
      <Route path="/company/view-desk_hotelling/:id" element={ <CompanyPageWrapper> <ViewCompanyDeskHotellingPage /> </CompanyPageWrapper> }></Route>

      <Route path="/user/checkout" element={ <CompanyPageWrapper> <UserCheckoutCallback /> </CompanyPageWrapper> } ></Route>
      <Route exact path="/" element={ <PublicPageWrapper> <MarketingPage /> </PublicPageWrapper> }></Route>
      <Route exact path="privacy_policy" element={ <PublicPageWrapper> <PrivacyPolicyPage /> </PublicPageWrapper> }></Route>
      <Route exact path="terms_and_conditions" element={ <PublicPageWrapper> <TermsConditionPage /> </PublicPageWrapper> }></Route>
      <Route
        path="*"
        element={ <CompanyPageWrapper> <NotFoundPage /> </CompanyPageWrapper> }
      ></Route>
    </Routes>
  )
}
