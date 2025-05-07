import { useState, useEffect } from "react";
import { format, subDays, subWeeks, subMonths } from "date-fns";
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
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [data, setData] = useState([]);
  const [xlabel, setXLabel] = useState("Week");

  // Victory uses JS props for styling
  const axisLabelStyle = { fontSize: 14, fontWeight: 'bold', padding: 50};
  const tickLabelStyle = { angle: -45, fontSize: 10, padding: 20 };

  // Generate data for the last 7 days
  const getWeekData = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return { x: format(date, "EEE"), y: Math.floor(Math.random() * 10) };
    });
  };

  // Generate data for the last 4 weeks
  const getMonthData = () => {
    return Array.from({ length: 4 }, (_, i) => {
      const date = subWeeks(new Date(), 3 - i);
      const monday = new Date(date);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)); // Adjust to Monday
      return { x: `Week of ${format(monday, "MMM d")}`, y: Math.floor(Math.random() * 20) };
    });
  };

  // Generate data for the last 12 months
  const getYearData = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), 11 - i);
      return { x: format(date, "MMM"), y: Math.floor(Math.random() * 60) };
    });
  };

  const datasets = {
    week: () => {
        setXLabel("Week");
        return getWeekData();
    },
    month: () => {
        setXLabel("Month");
        return getMonthData();
    },
    year: () => {
        setXLabel("Year");
        return getYearData()
    },
  };

  useEffect(() => {
    setData(datasets[selectedTimeframe]());
  }, [selectedTimeframe]);

  const handleSelectChange = (e) => {
    setSelectedTimeframe(e.target.value);
  };

  return (
    <div className="log-history-container">
      <div className="log-history-graph">
        <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={20}
            containerComponent={<VictoryVoronoiContainer />}
            height={400}
            width={800}
        >

            {/* X-axis */}
            <VictoryAxis 
            fixLabelOverlap 
            style={{ 
                tickLabels: tickLabelStyle,
                axisLabel: axisLabelStyle
             }}
            label={xlabel} 
            />

            {/* Y-axis */}
            <VictoryAxis 
            dependentAxis 
            label="hours"
            style={{ 
                tickLabels: tickLabelStyle,
                axisLabel: axisLabelStyle
            }}/>

            <VictoryLine 
            data={data}
            labels={({ datum }) => `${datum.y}`}
            labelComponent={<VictoryTooltip />}
            interpolation="natural"
            />

        </VictoryChart>
      </div>

      <div className="dropdown-container">
        <label>Time frame:  </label>
        <select onChange={handleSelectChange} value={selectedTimeframe}>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
      </div>
    </div>
  );
};