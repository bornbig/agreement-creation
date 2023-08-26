import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages/Home";
import { Agreement } from "../pages/Agreement";
import { Verify } from "../pages/Verify";
import { WrongUrl } from "../pages/WorngUrl";
import { OffchainAgreement } from "../pages/OffchainAgreement";

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
        path: "/verify/:id",
        element: <Verify />,
    },
    // Catch-all route for invalid routes
    {
        path: '*',
        element: <WrongUrl />,
    }
]);