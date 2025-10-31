import Home from "./pages/Home";
import { loadCodeGlyphData } from "./utils/api"

function App() {
  const data = loadCodeGlyphData();
  console.log(data);
  return (
    <>
      <Home />
    </>
  )
}

export default App
