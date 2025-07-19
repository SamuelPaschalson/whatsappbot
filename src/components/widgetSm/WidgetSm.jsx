import React, { useEffect } from "react";
import "./widgetSm.css";
import { Visibility } from "@material-ui/icons";
import { useState } from "react";
import axios from "axios";
export default function WidgetSm() {
  const [newUser, setNewUser] = useState([]);
  useEffect(() => {
    const getNewUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8800/api/users?new=true",
          {
            headers: {
              token: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFmMjFiNDc1LTc5NmMtNDk4Yy1iNDc2LTFhODRmYjBiODRmMyIsImlzQWRtaW4iOnRydWUsImlhdCI6MTc1Mjg1MDM3OCwiZXhwIjoxNzUzMjgyMzc4fQ.rXr2f3VvoAkIhTifOVjY88tXplVdAbNgFq1DZXqNS_A`,
            },
          }
        );
        console.log(res.data.users);
        setNewUser(res.data.users);
      } catch (err) {
        console.log(err);
      }
    };
    getNewUsers();
  }, []);
  return (
    <div className="widgetSm">
      <span className="widgetSmTitle">New Join Members</span>
      <ul className="widgetSmList">
        {newUser.map((user) => (
          <li className="widgetSmListItem">
            <img
              src={
                user.profilePic ||
                "https://images.pexels.com/photos/3992656/pexels-photo-3992656.png?auto=compress&cs=tinysrgb&dpr=2&w=500"
              }
              alt=""
              className="widgetSmImg"
            />
            <div className="widgetSmUser">
              <span className="widgetSmUsername">{user.username}</span>
              <span className="widgetSmUserTitle">Software Engineer</span>
            </div>
            <button className="widgetSmButton">
              <Visibility className="widgetSmIcon" />
              Display
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
