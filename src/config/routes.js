import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages/Home";
import { PaymentReceipt } from "../pages/PaymentReceipt";
import Error404 from "../error/Error404";
import Header from "../components/header";
import Wallet from "../pages/Wallet";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <><Header /><Home /></>,
    },
    {
        path: "/:chainid/:contract/:id",
        element: <><Header /><PaymentReceipt /></>,
    },
    {
        path: "/payment/:id",
        element: <><Header /><PaymentReceipt /></>,
    },
    {
        path: "/add-funds",
        element: <><Header /><Wallet /></>,
    },
    {
        path: "*",
        element: <><Header /><Error404 /></>,
    }
]);