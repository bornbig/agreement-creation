import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages/Home";
import { Agreement } from "../pages/Agreement";
import { Verify } from "../pages/Verify";
import { OffchainAgreement } from "../pages/OffchainAgreement";
import { Transak } from "../pages/Transak";

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
    {
        path: "/add-funds",
        element: <Transak />,
    }
]);