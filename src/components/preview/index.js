import React, { useEffect, useState } from 'react';
import './styles.scss';
import axios from "axios";
import BackError from '../../assets/error-back.png';
import { formatFullYear } from '../utils/format';
import Loading from '../loading';
import { AddOutlined, Close, PlayArrow, ThumbDownAltOutlined, ThumbUpAltOutlined, VolumeUp, VolumeOff, KeyboardArrowLeftOutlined } from '@material-ui/icons';

export default ({item, list}) => {
    console.log(item);
    // console.log(list);
    const [soundReleased, setsoundReleased] = useState(false);
    const [visibleModal, setVisibleModal] = useState(true);
    const [movie, setMovie] = useState([]);
    const [companies, setCompanies] = useState(false);
    const [loadedMain, setLoadedMain] = useState(false);
    const [loadedRest, setLoadedRest] = useState(false);
    useEffect(() => {
        const getMovie = async () => {
          try {
            const res = await axios.get("http://localhost:8800/api/movie/find/" + item);
            setMovie(res.data);
            console.log(movie);
          } catch (err) {
            console.log(err);
          }
        };
        getMovie();
      }, [item]);
    const onClose = () => {
        document.querySelector('body').style.overflow = 'auto';
        setVisibleModal(false);
    }
    console.log(movie);
        return (
        <>
        {/* <h1>lorem gcy y ydufffffffffffrdc</h1> */}
            {visibleModal && 
                <div className="previewMovie">
                    <div className="previewMovieModal">
                        <div className="previewMovieHeader">
                            <div className="previewMovieBackdrop">
                                { 
                                    movie.imgTitle != null ? (
                                        <>
                                            {loadedMain ? null : ( 
                                                <div className="onLoad">
                                                    <Loading 
                                                        style={{
                                                            top: '33%'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <img
                                                style={loadedMain ? {} : { display: 'none' }}
                                                src={movie.img} 
                                                alt={movie.title}
                                                onLoad={() => setLoadedMain(true)}
                                            />
                                        </>
                                    ) : (
                                        <img src={BackError} alt={movie.title}/>
                                    )
                                }
                                <div>
                                    <div className="previewMovieGeneral">
                                        <div className="previewMovieTitle">
                                            { 
                                                movie.title != null ? (
                                                    <>
                                                        {movie.title}
                                                    </>
                                                ) : (
                                                    <>
                                                        {movie.title}
                                                    </>
                                                )
                                            }
                                        </div>
                                        <div className="previewMovieOptions">
                                            <a href='/watch' className="previewMovieWatch">
                                                <div className="previewMovieWhatchButton">
                                                    <PlayArrow />
                                                    <span>Play</span>
                                                </div>
                                            </a>
                                            <button className="previewMovieAddList">
                                                <AddOutlined />
                                                <span>List</span>
                                            </button>
                                            <button className="previewMovieLike">
                                                <ThumbUpAltOutlined />
                                                <span>Like</span>
                                            </button>
                                            <button className="previewMovieDislike">
                                                <ThumbDownAltOutlined />
                                                <span>Dislike</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="previewMovieClose">
                                        <button onClick={onClose}>
                                            <Close />
                                        </button>
                                    </div>
                                    <div className="previewMovieSound">
                                        <button onClick={() => {
                                            setsoundReleased(!soundReleased);
                                        }}>
                                            {soundReleased ? (
                                                <VolumeUp />
                                            ): (
                                                <VolumeOff />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="previewMovieBody">
                            <div className="previewMovieBodyContent">
                                <div className="previewMovieBodyDetails">
                                    <div className="previewMovieBodyDetailsLeft">
                                        <div>
                                            <div className="tagsYear">
                                                { 
                                                    movie.year ? (
                                                        <>
                                                            {formatFullYear(movie.year)}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {formatFullYear(movie.year)}
                                                        </>
                                                    )
                                                }
                                            </div>
                                            <KeyboardArrowLeftOutlined/>
                                            <div className="tagsDuration">
                                                { 
                                                    movie.runtime ? (
                                                        <>
                                                            {movie.runtime}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {movie.seasons} season{movie.seasons !== 1 ? 's' : ''}
                                                        </>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <p>
                                            { 
                                                movie.desc === '' ? (
                                                    <>
                                                        {movie.title ? movie.title : movie.title} no description found 
                                                    </>
                                                ) : (
                                                    <>
                                                        {movie.desc}
                                                    </>
                                                )
                                            }
                                        </p>
                                    </div>
                                    <div className="previewMovieBodyDetailsRight">
                                        <div className="tagsGenres">
                                            <span className='gen'>Genres: </span>
                                            <div className='genre'>
                                                <span>{movie.genre}</span><span>{movie.genre1}</span><span>{movie.genre2}</span>
                                            </div>
                                        </div>
                                        <div className="tagsStatus">
                                            <span>Status: </span>
                                            <span>
                                            {movie.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
        )
}