import GlyphGraph from "../components/GlyphGraph/GlyphGraph";
import { loadCodeGlyphData } from "../utils/api";

const Home = () => {
  const data = loadCodeGlyphData();

  return (
    <div className="w-screen h-screen">
      <GlyphGraph data={data} />
    </div>
  );
};

export default Home;
