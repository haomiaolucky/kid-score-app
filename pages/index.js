import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const kids = {
  Andy: {
    color: "blue-500",
    tasks: ["reading 30mins", "drum", "school homework", "Math", "整理书包","clean room" ],
  },
  Mila: {
    color: "pink-400",
    tasks: ["reading 20mins", "piano", "school homework", "Math","整理书包","clean room"],
  },
};

const MAX_HISTORY_DAYS = 30; // 历史记录最多显示30天

export default function Home() {
  const [completedTasks, setCompletedTasks] = useState({ Andy: [], Mila: [] });
  const [history, setHistory] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showProgress, setShowProgress] = useState(true);

  // 加载本地存储的任务状态和历史记录
  useEffect(() => {
    const savedCompletedTasks = JSON.parse(localStorage.getItem("completedTasks")) || { Andy: [], Mila: [] };
    const savedHistory = JSON.parse(localStorage.getItem("history")) || [];
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 21) {
      setIsLocked(true);
    }
    setCompletedTasks(savedCompletedTasks);
    setHistory(savedHistory);
  }, []);

  // 每次任务状态或历史记录变化时，更新 localStorage
  useEffect(() => {
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    localStorage.setItem("history", JSON.stringify(history));
  }, [completedTasks, history]);

  const toggleTask = (task, kid) => {
    if (isLocked) return;
    setCompletedTasks((prev) => {
      const updated = prev[kid].includes(task)
        ? prev[kid].filter((t) => t !== task)
        : [...prev[kid], task];

      return {
        ...prev,
        [kid]: updated,
      };
    });
  };

  const getScore = (kid) => completedTasks[kid].length;

  const updateHistory = () => {
    const today = new Date().toLocaleDateString();
    const todayRecord = {
      date: today,
      scores: Object.keys(kids).map((kid) => ({
        kid,
        score: getScore(kid),
      })),
    };

    // 更新历史记录，最多显示30天
    setHistory((prev) => {
      const updatedHistory = [todayRecord, ...prev.filter((record) => record.date !== today)];
      if (updatedHistory.length > MAX_HISTORY_DAYS) {
        updatedHistory.pop();
      }
      return updatedHistory;
    });
  };

  const clean = () => {
    setCompletedTasks({ Andy: [], Mila: [] }); // 今天清零
    localStorage.setItem("completedTasks", JSON.stringify({ Andy: [], Mila: [] })); // 更新本地存储
    setIsLocked(false);
  };

  const getProgress = (kid) => {
    const totalTasks = kids[kid].tasks.length;
    return (getScore(kid) / totalTasks) * 100;
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const deleteRecord = () => {
    setHistory((prev) => prev.filter((record) => record.date !== selectedDate));
    setSelectedDate(""); // Reset selection
  };

  const renderLineChart = () => {
    const data = history.map((record) => ({
      date: record.date,
      Andy: record.scores.find((score) => score.kid === "Andy")?.score || 0,
      Mila: record.scores.find((score) => score.kid === "Mila")?.score || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Andy" stroke="#1E40AF" />
          <Line type="monotone" dataKey="Mila" stroke="#EC4899" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">今日打卡积分</h1>
      <button
        onClick={clean}
        className="w-full p-2 rounded-xl border bg-yellow-300 mb-4"
      >
        清零今天任务
      </button>
      <button
          onClick={updateHistory}
          className="w-full p-2 rounded-xl border bg-blue-300 mb-4"
        >
          更新今日记录
        </button>

      <div className="flex justify-between mb-8">
        {/* Andy's section */}
        <div className="w-1/2 p-4">
          <h2 className="text-xl font-bold text-blue-500">
            Andy</h2>
          <div className="mb-4">
            <div className="h-2 bg-blue-300 rounded" style={{ width: `${getProgress("Andy")}%` }}></div>
            <p className="text-center">{getScore("Andy")} point </p>
          </div>
          {kids["Andy"].tasks.map((task) => (
            <button
              key={task}
              onClick={() => toggleTask(task, "Andy")}
              className={`w-full p-2 rounded-xl border ${completedTasks["Andy"].includes(task) ? "bg-blue-300" : "bg-gray-100"}`}
            >
              {completedTasks["Andy"].includes(task) ? `✅ ${task}` : task}
            </button>
          ))}
        </div>

        {/* Mila's section */}
        <div className="w-1/2 p-4">
          <h2 className="text-xl font-bold text-pink-500">Mila</h2>
          <div className="mb-4">
            <div className="h-2 bg-pink-300 rounded" style={{ width: `${getProgress("Mila")}%` }}></div>
            <p className="text-center">{getScore("Mila")} point</p>
          </div>
          {kids["Mila"].tasks.map((task) => (
            <button
              key={task}
              onClick={() => toggleTask(task, "Mila")}
              className={`w-full p-2 rounded-xl border ${completedTasks["Mila"].includes(task) ? "bg-pink-300" : "bg-gray-100"}`}
            >
              {completedTasks["Mila"].includes(task) ? `✅ ${task}` : task}
            </button>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">历史走势图</h2>
      <div className="mb-mt-8 mb-8">
        <div className="mb-4">
          {renderLineChart()}
        </div>

        <h2 className="text-xl font-bold mb-2">清除历史记录</h2>
        <div className="flex items-center mb-4">
          <label htmlFor="date-select" className="mr-2">选择日期：</label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={handleDateChange}
            className="p-2 border rounded"
          >
            <option value="">请选择日期</option>
            {history.map((record) => (
              <option key={record.date} value={record.date}>
                {record.date}
              </option>
            ))}
          </select>
          <button
            onClick={deleteRecord}
            disabled={!selectedDate}
            className="ml-2 p-2 bg-red-500 text-white rounded"
          >
            删除
          </button>
        </div>
      </div>



      {isLocked && <p className="text-red-500 mb-4">打卡已截止，明天继续哦~</p>}

      <h2 className="text-xl font-bold mb-2">历史记录</h2>
      <div className="space-y-2">
        {history.map((record, index) => (
          <div key={index} className="border p-2 rounded">
            <p className="font-bold">{record.date}</p>
            {record.scores.map(({ kid, score }) => (
              <p key={kid}>{kid}: {score} 分</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
