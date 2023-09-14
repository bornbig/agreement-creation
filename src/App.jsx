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
      <div className="footer">
        <div className="links">
          <a href="">Terms Of Use</a>
          <a href="">AML</a>
          <a href="">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}

export default App;