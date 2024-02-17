import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/homePage/HomePage";
import LoginPage from "./pages/loginPage/LoginPage";
import "./styles/global.style.scss";
import "./styles/base.style.scss";
import RecoilContextProvider from "./atoms/RecoilContextProvider";

function App() {
  return (
    <RecoilContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
   
    </RecoilContextProvider>
  );
}

export default App;
