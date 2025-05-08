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

export const LogHistoryGraph = ({ refreshSignal}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [data, setData] = useState({});
  const [xlabel, setXLabel] = useState("Week");
  const { user } = useContext(UserContext);
  const [habits, setHabits] = useState([]);

  // Generate data for the last 7 days
  const getFilteredLogData = async (mode) => {

    let startDate
    const endDate = new Date();
    if (mode === 'week'){
        startDate = subDays(endDate, 7);
    } else if (mode === 'month') {
        startDate = subWeeks(endDate, 4);
    } else if (mode === 'year') {
        startDate = subMonths(endDate, 12)
    }

    const results = {};

    habits.forEach(habit => {
        if (!habit.logs || habit.logs.length === 0) return;

        const allDates = [];
        let cursor = new Date(startDate);
        while (cursor <= endDate) {
          allDates.push(new Date(cursor));
          cursor.setDate(cursor.getDate() + 1);
        }

        const dateMap = {};
        habit.logs
          .map(log => ({ ...log, date: new Date(log.date) }))
          .filter(log => log.date >= startDate && log.date <= endDate)
          .forEach(log => {
            const dateStr = format(log.date, 'yyyy-MM-dd');
            dateMap[dateStr] = (dateMap[dateStr] || 0) + (log.duration || 1);
          });

        const dataPoints = allDates.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          return {
            x: new Date(date),
            y: dateMap[dateStr] || 0,
          };
        });

        results[habit.id] = dataPoints;
    }); 

    console.log(results);
    return results
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
    }, [user]);

  useEffect(() => {
    if (habits.length === 0) return;
    const loadData = async () => {
      const result = await datasets[selectedTimeframe]();
      setData(result);
    };
    loadData();
  }, [habits, selectedTimeframe, refreshSignal]);

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
            label="hours"
            style={{ 
                tickLabels: tickLabelStyle,
                axisLabel: axisLabelStyle
            }}/>

            {Object.entries(data).map(([habitId, habitData]) =>(
                <VictoryBar 
                key={habitId}
                data={habitData}
                labels={({ datum }) => `${datum.y}`}
                labelComponent={<VictoryTooltip />}
                barRatio={0.8}
                />
            ))}

        </VictoryChart>
      </div>

      
    </div>
  );
};