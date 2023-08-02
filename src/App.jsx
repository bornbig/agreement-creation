import { RouterProvider } from "react-router-dom";
import Header from "./components/header";
import { Notification } from "./components/notification";
import { router } from "./config/routes";

function App() {

  return (
    <div className="container">
      <Header />
      <RouterProvider router={router} />
      <Notification />
    </div>
  );
}

export default App;