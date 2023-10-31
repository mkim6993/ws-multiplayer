import { Routes, Route, BrowserRouter } from "react-router-dom";
import PlayerInfo from "./components/PlayerInfo";
import GameEnv from "./components/GameEnv";
import TestGrid from "./components/TestGrid";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={ <PlayerInfo /> } /> */}
          <Route path="/" element={ <TestGrid /> } />
          <Route path="play/:username" element={ <GameEnv /> } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
