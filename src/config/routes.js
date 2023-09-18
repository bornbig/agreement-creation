import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages/Home";
import { Agreement } from "../pages/Agreement";
import { OffchainAgreement } from "../pages/OffchainAgreement";
import { Transak } from "../pages/Transak";
import Error404 from "../error/Error404";

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
        element: <Transak />,
    },
    {
        path: "*",
        element: <Error404 />,
    }
]);