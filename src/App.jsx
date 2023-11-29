import { RouterProvider } from "react-router-dom";
import Header from "./components/header";
import { Notification } from "./components/notification";
import { router } from "./config/routes";

function App() {

  return (
    <>
      <RouterProvider router={router} />
      <Notification />
      <div className="footer">
        <div className="links">
          <a href="https://lopsided-border-0d6.notion.site/Terms-of-Use-0e6bb81ed70f4b09bbae2638be302723?pvs=4" target="_blank" rel="noreferrer noopener">Terms Of Use</a>
          <a href="https://lopsided-border-0d6.notion.site/KNOW-YOUR-CUSTOMER-ANTI-MONEY-LAUNDERING-AND-TRANSACTION-MONITORING-POLICY-e1ab2344807046bb93e03c671c8b3445?pvs=4">AML</a>
          <a href="https://lopsided-border-0d6.notion.site/Privacy-Policy-37155fe5a7fe4c70b2d6758cce02b4b6?pvs=4"target="_blank" rel="noreferrer noopener">Privacy Policy</a>
        </div>
      </div>
    </>
  ); 
}

export default App;