import Component from "./Component";
import {motion} from "framer-motion";
import Aurora from '../Reactbits/Aurora/Aurora.jsx';


function App() {
  

  return (<div>
    <Aurora
  colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
  blend={0.5}
  amplitude={1.0}
  speed={0.5}
/>
    <Component></Component>
    </div>
  )
}

export default App
