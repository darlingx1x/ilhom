import { createBrowserRouter } from "react-router-dom"
import { RootLayout } from "@/components/layout/RootLayout"
import { ProtectedRoute } from "@/components/common/ProtectedRoute"
import { AdminRoute } from "@/components/common/AdminRoute"

import { HomePage } from "@/pages/HomePage"
import { CatalogPage } from "@/pages/CatalogPage"
import { PublicationPage } from "@/pages/PublicationPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { CheckoutPage } from "@/pages/CheckoutPage"

import { AccountLayout } from "@/pages/account/AccountLayout"
import { AccountProfilePage } from "@/pages/account/AccountProfilePage"
import { AccountSubscriptionsPage } from "@/pages/account/AccountSubscriptionsPage"
import { AccountSubscriptionDetailPage } from "@/pages/account/AccountSubscriptionDetailPage"
import { AccountPaymentsPage } from "@/pages/account/AccountPaymentsPage"

import { AdminLayout } from "@/pages/admin/AdminLayout"
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage"
import { AdminPublicationsPage } from "@/pages/admin/AdminPublicationsPage"
import { AdminPublicationFormPage } from "@/pages/admin/AdminPublicationFormPage"
import { AdminIssuesPage } from "@/pages/admin/AdminIssuesPage"
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage"

import { NotFoundPage } from "@/pages/NotFoundPage"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/catalog", element: <CatalogPage /> },
      { path: "/publications/:slug", element: <PublicationPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "/checkout/:publicationId", element: <CheckoutPage /> },
          {
            path: "/account",
            element: <AccountLayout />,
            children: [
              { index: true, element: <AccountProfilePage /> },
              { path: "subscriptions", element: <AccountSubscriptionsPage /> },
              { path: "subscriptions/:id", element: <AccountSubscriptionDetailPage /> },
              { path: "payments", element: <AccountPaymentsPage /> },
            ],
          },
        ],
      },

      {
        element: <AdminRoute />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: "publications", element: <AdminPublicationsPage /> },
              { path: "publications/new", element: <AdminPublicationFormPage /> },
              { path: "publications/:id/edit", element: <AdminPublicationFormPage /> },
              { path: "publications/:id/issues", element: <AdminIssuesPage /> },
              { path: "users", element: <AdminUsersPage /> },
            ],
          },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
