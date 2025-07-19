// ListItem.jsx
import React, { useState, useRef, useEffect } from "react";
import "./listItem.scss";
import {
  PlayArrow,
  Add,
  ThumbUpAltOutlined,
  ThumbDownAltOutlined,
} from "@material-ui/icons";
import axios from "axios";
import VideoPlayer from "../videoplayer/VideoPlayer";
import zIndex from "@material-ui/core/styles/zIndex";

const ListItem = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [movie, setMovie] = useState(null);
  const hoverTimeout = useRef(null);
  const videoTimeout = useRef(null);

  useEffect(() => {
    const getMovie = async () => {
      try {
        const res = await axios.get(
          "https://whatsappbot-1-e6rt.onrender.com/api/movie/find/" + item._id
        );
        console.log(res.data.data);
        setMovie(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMovie();
  }, [item]);

  const handleHover = () => {
    clearTimeout(hoverTimeout.current);
    clearTimeout(videoTimeout.current);

    setIsHovered(true);
    videoTimeout.current = setTimeout(() => {
      setShowVideo(true);
    }, 1000);
  };

  const handleLeave = () => {
    clearTimeout(hoverTimeout.current);
    clearTimeout(videoTimeout.current);
    setIsHovered(false);
    setShowVideo(false);
  };

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeout.current);
      clearTimeout(videoTimeout.current);
    };
  }, []);

  return (
    <div
      className={`listItem ${isHovered ? "hovered" : ""}`}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <div className="mediaContainer">
        {!showVideo ? (
          <img
            src={movie?.assets?.hoverPreview}
            loading="lazy"
            alt={movie?.title}
            className="itemImage"
          />
        ) : (
          <>
            <VideoPlayer
              videoPreview={movie?.assets?.videoPreview}
              thumbnail={movie?.assets?.thumbnail}
              title={movie?.title}
            />
          </>
        )}
        {isHovered && (
          <>
            <div className="itemHover">
              <div className="itemInfo">
                <div
                  className="icons"
                  style={{ justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex" }}>
                    <button className="icon play">
                      <img src="./assets/svg/Play.svg" alt="" />
                    </button>
                    <button className="icon">
                      <img src="./assets/svg/Plus.svg" alt="" />
                    </button>
                    <button className="icon">
                      <img src="./assets/svg/ThumbsUp.svg" alt="" />
                    </button>
                  </div>
                  <div>
                    <button className="icon">
                      <img src="./assets/svg/Icon.svg" alt="" />
                    </button>
                  </div>
                </div>

                <div className="itemInfoTop">
                  <span className="match">
                    {movie?.uiStates?.matchScore}% Match
                  </span>
                  <span className="limit">{movie?.limit}+</span>
                  <span className="hd">HD</span>
                </div>

                <div className="genres">
                  {movie?.genre && <span>{movie.genre}</span>}
                  {movie?.genre1 && <span>• {movie.genre1}</span>}
                  {movie?.genre2 && <span>• {movie.genre2}</span>}
                </div>

                {/* Additional information that appears on hover */}
                {/* <p className="desc">
                  {movie?.desc || "No description available."}
                </p> */}

                {/* <div className="episodeInfo">
                  <span>Episode 1</span>
                  <span>52m</span>
                </div> */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListItem;
