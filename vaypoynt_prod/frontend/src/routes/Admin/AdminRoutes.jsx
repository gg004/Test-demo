import React from 'react'
import { Route, Routes } from 'react-router'

import { AdminPageWrapper } from 'Components/PageWrappers'
import { PublicPageWrapper } from 'Components/PageWrappers';
import MarketingPage from 'Pages/MarketingPage';
import PrivacyPolicyPage from 'Pages/PrivacyPolicyPage';
import TermsConditionPage from 'Pages/TermsConditionPage';
import {
  AddAdminCmsPage,
  AddAdminCompanyProfilePage,
  AddAdminDepartmentPage,
  AddAdminDeskHotellingPage,
  AddAdminDeskTicketPage,
  AddAdminEmailPage,
  AddAdminEmployeeProfilePage,
  AddAdminPhotoPage,
  AddAdminUserPage,
  AdminCmsListPage,
  AdminCompanyProfileListPage,
  AdminDashboardPage,
  AdminDepartmentListPage,
  AdminDeskHotellingListPage,
  AdminDeskTicketListPage,
  AdminEmailListPage,
  AdminEmployeeProfileListPage,
  AdminPhotoListPage,
  AdminProfilePage,
  AdminUserListPage,
  EditAdminCmsPage,
  EditAdminCompanyProfilePage,
  EditAdminDepartmentPage,
  EditAdminDeskHotellingPage,
  EditAdminDeskTicketPage,
  EditAdminEmailPage,
  EditAdminEmployeeProfilePage,
  EditAdminUserPage,
  ViewAdminCompanyProfilePage,
  ViewAdminDepartmentPage,
  ViewAdminDeskHotellingPage,
  ViewAdminDeskTicketPage,
  ViewAdminEmployeeProfilePage,
} from "Pages/admin";

import EditAdminStripeProductPage from "Pages/stripe/EditAdminStripeProductPage";
import EditAdminStripePricePage from "Pages/stripe/EditAdminStripePricePage";
import AddAdminStripeProductPage from "Pages/stripe/AddAdminStripeProductPage";
import AddAdminStripePricePage from "Pages/stripe/AddAdminStripePricePage";
import AdminStripeProductsListPage from "Pages/stripe/AdminStripeProductsListPage";
import AdminStripePricesListPage from "Pages/stripe/AdminStripePricesListPage";
import AdminStripeSubscriptionsListPage from "Pages/stripe/AdminStripeSubscriptionsListPage";
import AdminStripeInvoicesListPageV2 from "Pages/stripe/AdminStripeInvoicesListPageV2";
import AdminStripeOrdersListPage from "Pages/stripe/AdminStripeOrdersListPage";
import { NotFoundPage } from 'Pages/404';
import AdminStripeUnSubscribeListPage from 'Pages/stripe/AdminStripeUnSubscribeListPage';
export const AdminRoutes = () => {
  return (
    <Routes>
      <Route exact path="/admin" element={ <AdminPageWrapper> <AdminDashboardPage /> </AdminPageWrapper> }></Route>
      <Route exact path="/admin/dashboard" element={ <AdminPageWrapper> <AdminDashboardPage /> </AdminPageWrapper> }></Route>
      <Route exact path="/admin/profile" element={ <AdminPageWrapper> <AdminProfilePage /> </AdminPageWrapper> }></Route>

      <Route path="/admin/user" element={ <AdminPageWrapper> <AdminUserListPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/add-user" element={ <AdminPageWrapper> <AddAdminUserPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/edit-user/:id" element={ <AdminPageWrapper> <EditAdminUserPage /> </AdminPageWrapper> }></Route>

      <Route path="/admin/photo" element={ <AdminPageWrapper> <AdminPhotoListPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/add-photo" element={ <AdminPageWrapper> <AddAdminPhotoPage /> </AdminPageWrapper> }></Route>

      <Route path="/admin/email" element={ <AdminPageWrapper> <AdminEmailListPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/add-email" element={ <AdminPageWrapper> <AddAdminEmailPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/edit-email/:id" element={ <AdminPageWrapper> <EditAdminEmailPage /> </AdminPageWrapper> }></Route>


      <Route path="/admin/company_profile" element={ <AdminPageWrapper> <AdminCompanyProfileListPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/add-company_profile" element={ <AdminPageWrapper> <AddAdminCompanyProfilePage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/edit-company_profile/:id" element={ <AdminPageWrapper> <EditAdminCompanyProfilePage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/view-company_profile/:id" element={ <AdminPageWrapper> <ViewAdminCompanyProfilePage /> </AdminPageWrapper> }></Route>

      <Route path="/admin/desk_ticket" element={ <AdminPageWrapper> <AdminDeskTicketListPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/add-desk_ticket" element={ <AdminPageWrapper> <AddAdminDeskTicketPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/edit-desk_ticket/:id" element={ <AdminPageWrapper> <EditAdminDeskTicketPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/view-desk_ticket/:id" element={ <AdminPageWrapper> <ViewAdminDeskTicketPage /> </AdminPageWrapper> }></Route>

      <Route path="/admin/department" element={ <AdminPageWrapper> <AdminDepartmentListPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/add-department" element={ <AdminPageWrapper> <AddAdminDepartmentPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/edit-department/:id" element={ <AdminPageWrapper> <EditAdminDepartmentPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/view-department/:id" element={ <AdminPageWrapper> <ViewAdminDepartmentPage /> </AdminPageWrapper> }></Route>

      <Route path="/admin/cms" element={ <AdminPageWrapper> <AdminCmsListPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/add-cms" element={ <AdminPageWrapper> <AddAdminCmsPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/edit-cms/:id" element={ <AdminPageWrapper> <EditAdminCmsPage /> </AdminPageWrapper> }></Route>


      <Route path="/admin/employee_profile" element={ <AdminPageWrapper> <AdminEmployeeProfileListPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/add-employee_profile" element={ <AdminPageWrapper> <AddAdminEmployeeProfilePage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/edit-employee_profile/:id" element={ <AdminPageWrapper> <EditAdminEmployeeProfilePage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/view-employee_profile/:id" element={ <AdminPageWrapper> <ViewAdminEmployeeProfilePage /> </AdminPageWrapper> }></Route>


      <Route path="/admin/desk_hotelling" element={ <AdminPageWrapper> <AdminDeskHotellingListPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/add-desk_hotelling" element={ <AdminPageWrapper> <AddAdminDeskHotellingPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/edit-desk_hotelling/:id" element={ <AdminPageWrapper> <EditAdminDeskHotellingPage /> </AdminPageWrapper> }></Route>
      <Route path="/admin/view-desk_hotelling/:id" element={ <AdminPageWrapper> <ViewAdminDeskHotellingPage /> </AdminPageWrapper> }></Route>

      <Route path="/admin/edit-product/:id" element={ <AdminPageWrapper> <EditAdminStripeProductPage /> </AdminPageWrapper> } ></Route>
      <Route path="/admin/edit-price/:id" element={ <AdminPageWrapper> <EditAdminStripePricePage /> </AdminPageWrapper> } ></Route>
      <Route path="/admin/add-product" element={ <AdminPageWrapper> <AddAdminStripeProductPage /> </AdminPageWrapper> } ></Route>
      <Route path="/admin/add-price" element={ <AdminPageWrapper> <AddAdminStripePricePage /> </AdminPageWrapper> } ></Route>
      <Route path="/admin/products" element={ <AdminPageWrapper> <AdminStripeProductsListPage /> </AdminPageWrapper> } ></Route>
      <Route path="/admin/prices" element={ <AdminPageWrapper> <AdminStripePricesListPage /> </AdminPageWrapper> } ></Route>
      <Route path="/admin/subscriptions" element={ <AdminPageWrapper> <AdminStripeSubscriptionsListPage /> </AdminPageWrapper> } ></Route>
      <Route path="/admin/pending_cancel_requests" element={ <AdminPageWrapper> <AdminStripeUnSubscribeListPage /> </AdminPageWrapper> } ></Route>
      <Route path="/admin/invoices" element={ <AdminPageWrapper> <AdminStripeInvoicesListPageV2 /> </AdminPageWrapper> } ></Route>
      <Route path="/admin/orders" element={ <AdminPageWrapper> <AdminStripeOrdersListPage /> </AdminPageWrapper> } ></Route>
      <Route exact path="/" element={ <PublicPageWrapper> <MarketingPage /> </PublicPageWrapper> }></Route>
      <Route exact path="privacy_policy" element={ <PublicPageWrapper> <PrivacyPolicyPage /> </PublicPageWrapper> }></Route>
      <Route exact path="terms_and_conditions" element={ <PublicPageWrapper> <TermsConditionPage /> </PublicPageWrapper> }></Route>
      <Route
        path="*"
        element={ <AdminPageWrapper> <NotFoundPage /> </AdminPageWrapper> }
      ></Route>
    </Routes>
  )
}
