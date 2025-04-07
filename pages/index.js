
import { useState, useEffect } from "react";

const kids = {
  Andy: {
    tasks: ["整理书包", "阅读10分钟", "练琴"],
  },
  Mila: {
    tasks: ["洗碗", "运动", "整理玩具"],
  },
};

export default function Home() {
  const [currentKid, setCurrentKid] = useState("Andy");
  const [completedTasks, setCompletedTasks] = useState({ Andy: [], Mila: [] });
  const [isLocked, setIsLocked] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 9) {
      setIsLocked(true);
    }
  }, []);

  const toggleTask = (task) => {
    if (isLocked) return;
    setCompletedTasks((prev) => {
      const updated = prev[currentKid].includes(task)
        ? prev[currentKid].filter((t) => t !== task)
        : [...prev[currentKid], task];

      return {
        ...prev,
        [currentKid]: updated,
      };
    });
  };

  const getScore = (kid) => completedTasks[kid].length;

  const addHistory = () => {
    const today = new Date().toLocaleDateString();
    const todayRecord = {
      date: today,
      scores: Object.keys(kids).map((kid) => ({
        kid,
        score: getScore(kid),
      })),
    };
    setHistory((prev) => [...prev, todayRecord]);
    setCompletedTasks({ Andy: [], Mila: [] });
    setIsLocked(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">今日打卡积分</h1>

      <div className="flex justify-around mb-4">
        {Object.keys(kids).map((kid) => (
          <div key={kid} className="text-center">
            <p className="font-bold">{kid}</p>
            <p>{getScore(kid)} 分</p>
          </div>
        ))}
      </div>

      <div className="flex justify-around mb-4">
        {Object.keys(kids).map((kid) => (
          <button
            key={kid}
            onClick={() => setCurrentKid(kid)}
            className={`p-2 rounded-xl border ${currentKid === kid ? "bg-blue-300" : "bg-gray-100"}`}
          >
            {kid}
          </button>
        ))}
      </div>

      <p className="mb-2">
        {currentKid} 已完成 {getScore(currentKid)} / {kids[currentKid].tasks.length} 项
      </p>

      {isLocked && (
        <p className="text-red-500 mb-4">打卡已截止，明天继续哦~</p>
      )}

      <div className="space-y-2 mb-4">
        {kids[currentKid].tasks.map((task) => (
          <button
            key={task}
            onClick={() => toggleTask(task)}
            className={`w-full p-2 rounded-xl border ${completedTasks[currentKid].includes(task) ? "bg-green-300" : "bg-gray-100"}`}
          >
            {completedTasks[currentKid].includes(task) ? `✅ ${task}` : task}
          </button>
        ))}
      </div>

      <button
        onClick={addHistory}
        className="w-full p-2 rounded-xl border bg-yellow-300 mb-4"
      >
        保存今日积分并清零
      </button>

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
