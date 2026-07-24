import { useState, useEffect } from "react";

function DateFilter({ onDateChange }) {
  const [filterType, setFilterType] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    applyFilter(filterType);
  }, []);

  const applyFilter = (type) => {
    const now = new Date();
    let startDate = "";
    let endDate = "";
    let label = "";

    const format = (date) => date.toISOString(); 

    if (type === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate = format(start);
      endDate = format(now);
      label = "Today";
    } else if (type === "yesterday") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate = format(start);
      endDate = format(end);
      label = "Yesterday";
    } else if (type === "thisWeek") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      startDate = format(start);
      endDate = format(now);
      label = "This Week";
    } else if (type === "lastWeek") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      startDate = format(start);
      endDate = format(end);
      label = "Last Week";
    } else if (type === "thisMonth") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = format(start);
      endDate = format(now);
      label = "This Month";
    } else if (type === "lastMonth") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = format(start);
      endDate = format(end);
      label = "Last Month";
    } else if (type === "custom") {
      if (customStart) {
        const start = new Date(customStart);
        startDate = format(start);
        
        let end = now;
        if (customEnd) {
           end = new Date(customEnd);
           end.setHours(23, 59, 59, 999);
        }
        endDate = format(end);
        label = `Custom: ${customStart} to ${customEnd || "Now"}`;
      }
    }

    if (startDate && endDate) {
      onDateChange({ startDate, endDate, label });
    }
  };

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setFilterType(val);
    if (val !== "custom") {
      applyFilter(val);
    }
  };

  const handleCustomApply = () => {
    if (customStart) {
      applyFilter("custom");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-2">
      <select
        value={filterType}
        onChange={handleTypeChange}
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
      >
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="thisWeek">This Week</option>
        <option value="lastWeek">Last Week</option>
        <option value="thisMonth">This Month</option>
        <option value="lastMonth">Last Month</option>
        <option value="custom">Custom Date</option>
      </select>

      {filterType === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
          />
          <span className="text-slate-400 text-sm">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700"
          />
          <button
            onClick={handleCustomApply}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

export default DateFilter;
