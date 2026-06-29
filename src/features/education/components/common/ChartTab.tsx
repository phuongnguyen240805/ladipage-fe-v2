import React, { useState } from "react";

const ChartTab: React.FC = () => {
  const [selected, setSelected] = useState<
    "optionOne" | "optionTwo" | "optionThree"
  >("optionOne");

  const getButtonClass = (option: "optionOne" | "optionTwo" | "optionThree") =>
    selected === option
      ? "shadow-theme-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
      : "text-slate-600 dark:text-slate-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-50 p-0.5 dark:bg-slate-900">
      <button
        onClick={() => setSelected("optionOne")}
        className={`text-theme-sm w-full rounded-md px-3 py-2 font-medium hover:text-slate-900 dark:hover:text-white ${getButtonClass(
          "optionOne",
        )}`}
      >
        Monthly
      </button>

      <button
        onClick={() => setSelected("optionTwo")}
        className={`text-theme-sm w-full rounded-md px-3 py-2 font-medium hover:text-slate-900 dark:hover:text-white ${getButtonClass(
          "optionTwo",
        )}`}
      >
        Quarterly
      </button>

      <button
        onClick={() => setSelected("optionThree")}
        className={`text-theme-sm w-full rounded-md px-3 py-2 font-medium hover:text-slate-900 dark:hover:text-white ${getButtonClass(
          "optionThree",
        )}`}
      >
        Annually
      </button>
    </div>
  );
};

export default ChartTab;
