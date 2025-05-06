import { useState, useEffect } from "react";
import "./LogHistoryGraph.css";
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";

export const LogHistoryGraph = () => {
  const [selectedOption, setSelectedOption] = useState("habitA");
  const [data, setData] = useState([]);

  const datasets = {
    habitA: [
      { x: "2025-05-01", y: 3 },
      { x: "2025-05-02", y: 5 },
      { x: "2025-05-03", y: 2 },
    ],
    habitB: [
      { x: "2025-05-01", y: 1 },
      { x: "2025-05-02", y: 4 },
      { x: "2025-05-03", y: 6 },
    ],
  };

  useEffect(() => {
    setData(datasets[selectedOption]);
  }, [selectedOption]);

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div className="log-history-graph">
      <select onChange={handleSelectChange} value={selectedOption}>
        <option value="habitA">Habit A</option>
        <option value="habitB">Habit B</option>
      </select>

      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={20}
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryAxis 
          fixLabelOverlap 
          style={{ tickLabels: { angle: -45, fontSize: 10 } }} 
        />
        <VictoryAxis dependentAxis />
        <VictoryLine 
          data={data}
          labels={({ datum }) => `${datum.y}`}
          labelComponent={<VictoryTooltip />}
          interpolation="natural"
        />
      </VictoryChart>
    </div>
  );
};