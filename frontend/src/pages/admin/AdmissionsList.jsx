import React, { useEffect, useState } from "react";
import axios from "axios";

const AdmissionsList = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("/api/admissions/all").then((res) => {
      setData(res.data.data);
    });
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admissions Received</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 font-semibold">
            <th className="p-3 border">Student</th>
            <th className="p-3 border">Class</th>
            <th className="p-3 border">Phone</th>
            <th className="p-3 border">Date</th>
          </tr>
        </thead>

        <tbody>
          {data.map((s) => (
            <tr key={s._id}>
              <td className="p-3 border">{s.studentName}</td>
              <td className="p-3 border">{s.classApplied}</td>
              <td className="p-3 border">{s.phone}</td>
              <td className="p-3 border">{new Date(s.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdmissionsList;
