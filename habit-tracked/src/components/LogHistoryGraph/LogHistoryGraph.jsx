import { useContext, useState, useEffect } from "react";
import { format, subDays, subWeeks, subMonths } from "date-fns";import "./LogHistoryGraph.css";
import { getUserHabits } from '../../utils/api';
import { UserContext } from '../../context/userContext';
import {
    VictoryChart,
    VictoryBar,
    VictoryTheme,
    VictoryAxis,
    VictoryTooltip,
    VictoryVoronoiContainer,
  } from "victory";

  // Define habitColors and getColorByIndex at the top of the component
const habitColors = [
  "#4f81bd", "#c0504d", "#9bbb59", "#8064a2", "#4bacc6",
  "#f79646", "#7f7f7f", "#fabf8f", "#92d050", "#ff5050"
];
const getColorByIndex = (index) => habitColors[index % habitColors.length];

export const LogHistoryGraph = ({ refreshSignal}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [data, setData] = useState({});
  const [xlabel, setXLabel] = useState("Week");
  const { user } = useContext(UserContext);
  const [habits, setHabits] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState("all");
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);

  // Habit loading
  useEffect(() => {

    const fetchHabits = async () => {
      if (!user || !user.id) return;

      try {
        const data = await getUserHabits(user.id);

        setHabits([...data]);
        console.log(data);
      } catch (err) {
        console.error("Error fetching habits: ", err);
      }
    };

    fetchHabits();
    }, [user, refreshSignal]);

  const getFilteredLogData = async (mode) => {
    let startDate;
    const endDate = new Date();
  
    if (mode === "week") startDate = subDays(endDate, 7);
    else if (mode === "month") startDate = subWeeks(endDate, 4);
    else if (mode === "year") startDate = subMonths(endDate, 12);
  
    const results = {};
    const allDates = [];
    let cursor = new Date(startDate);
    while (cursor <= endDate) {
      allDates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  
    if (selectedHabitId === "all") {
      const cumulativeMap = {};
      habits.forEach((habit) => {
        if (!habit.logs) return;
        habit.logs.forEach((log) => {
          const dateStr = format(new Date(log.date), "yyyy-MM-dd");
          cumulativeMap[dateStr] = (cumulativeMap[dateStr] || 0) + log.duration;
        });
      });
  
      const cumulativePoints = allDates.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return {
          x: date,
          y: cumulativeMap[dateStr] || 0,
        };
      });
  
      results["all"] = cumulativePoints;
    } else {
      const habit = habits.find((h) => h._id === selectedHabitId);
      if (!habit?.logs) return {};
  
      const habitMap = {};
      habit.logs.forEach((log) => {
        const dateStr = format(new Date(log.date), "yyyy-MM-dd");
        habitMap[dateStr] = (habitMap[dateStr] || 0) + log.duration;
      });
  
      const habitPoints = allDates.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return {
          x: date,
          y: habitMap[dateStr] || 0,
        };
      });
  
      results[habit._id] = habitPoints;
    }
  
    return results;
  };
  

  const datasets = {
    week: () => {
        setXLabel("Week");
        return getFilteredLogData("week");
    },
    month: () => {
        setXLabel("Month");
        return getFilteredLogData("month");
    },
    year: () => {
        setXLabel("Year");
        return getFilteredLogData("year");
    },
  };



    // Graph time update
  useEffect(() => {
    if (habits.length === 0) return;
    const loadData = async () => {
      const result = await datasets[selectedTimeframe]();
      setData(result);
    };
    loadData();
  }, [habits, selectedTimeframe, refreshSignal, selectedHabitId]);

  const handleSelectChange = (e) => {
    setSelectedTimeframe(e.target.value);
  };

  // Victory uses JS props for styling
  const axisLabelStyle = { fontSize: 14, fontWeight: 'bold', padding: 43};
  const tickLabelStyle = { angle: -45, fontSize: 10, padding: 13};

  return (
    <div className="log-history-container">
      <div className="dropdown-container">
        <label>Time frame:  </label>
        <select onChange={handleSelectChange} value={selectedTimeframe}>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
      </div>
      <div className="dropdown-container mt-2">
        <label>Habit: </label>
        <select
          onChange={(e) => {
            setSelectedHabitId(e.target.value);
            setHabitDialogOpen(true);
          }}
          value={selectedHabitId}
        >
          <option value="all">All Habits</option>
          {habits.map((habit) => (
            <option key={habit._id} value={habit._id}>
              {habit.name}
            </option>
          ))}
        </select>
      </div>
      <div className="log-history-graph">
        <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={20}
            containerComponent={<VictoryVoronoiContainer />}
            height={500}
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
             tickFormat={(t) => format(new Date(t), selectedTimeframe === 'year' ? 'MMM yyyy' : 'MMM d')}
            />

            {/* Y-axis */}
            <VictoryAxis 
            dependentAxis 
            label="minutes"
            style={{ 
                tickLabels: tickLabelStyle,
                axisLabel: axisLabelStyle
            }}/>

            {Object.entries(data).map(([habitId, habitData], index) =>(
                <VictoryBar 
                key={habitId}
                data={habitData}
                labels={({ datum }) => `${datum.y}`}
                labelComponent={<VictoryTooltip />}
                barRatio={0.8}
                style={{
                  data: { fill: getColorByIndex(index), fillOpacity: 0.6 }
                }}
                />
            ))}

        </VictoryChart>
      </div>

      
    </div>
  );
};