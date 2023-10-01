import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages/Home";
import { Agreement } from "../pages/Agreement";
import { OffchainAgreement } from "../pages/OffchainAgreement";
import Error404 from "../error/Error404";
import AddFundsPage from "../pages/AddFunds";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/sbt/:contract/:id",
        element: <Agreement />,
    },
    {
        path: "/offchain/:id",
        element: <OffchainAgreement />,
    },
    {
        path: "/add-funds",
        element: <AddFundsPage />,
    },
    {
        path: "*",
        element: <Error404 />,
    }
]);