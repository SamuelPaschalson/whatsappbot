import React, { useState, useRef, useEffect } from "react";
import "./list.scss";
import ListItem from "../listItem/ListItem";
import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";
import { motion } from "framer-motion";

export default function List({ list }) {
  console.log(list);

  const [isMoved, setIsMoved] = useState(false);
  const [slideNumber, setSlideNumber] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const listRef = useRef();

  const handleClick = (direction) => {
    setIsMoved(true);
    let distance = listRef.current.getBoundingClientRect().x - 50;

    if (direction === "left" && slideNumber > 0) {
      setSlideNumber(slideNumber - 1);
      listRef.current.style.transform = `translateX(${230 + distance}px)`;
    }

    if (direction === "right" && slideNumber < 10) {
      setSlideNumber(slideNumber + 1);
      listRef.current.style.transform = `translateX(${-230 + distance}px)`;
    }
  };

  // Netflix-style row hover effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowControls(true);
      } else {
        setShowControls(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="listTitle">{list.title}</span>
      <div className="wrapper">
        <ArrowBackIos
          className="sliderArrow left"
          onClick={() => handleClick("left")}
          style={{ display: !isMoved && "none" }}
        />

        <div className="container" ref={listRef}>
          {list.content.map((item, index) => (
            <ListItem key={index} index={index} item={item} />
          ))}
        </div>

        <ArrowForwardIos
          className="sliderArrow right"
          onClick={() => handleClick("right")}
        />
      </div>
    </motion.div>
  );
}
