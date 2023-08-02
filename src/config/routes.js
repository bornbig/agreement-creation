import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages/Home";
import { Agreement } from "../pages/Agreement";
import { Verify } from "../pages/Verify";

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
        path: "/verify/:id",
        element: <Verify />,
    }
]);