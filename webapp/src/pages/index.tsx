import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Box, Button, Typography, Tooltip , IconButton} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Image from 'next/image';
import Home from '../components/Home';
import Login from '@mui/icons-material/Login';
import ScrollToTopButton from '~/components/ScrollToTopButton';
import SwarthmoreLogo from "~/assets/images/swarthmorelogo.png"

const IndexPage = ({ data, selectedKey, setSelectedKey }) => {

  const [videoPlaying, setVideoPlaying] = useState(false);

  const toggleVideoPlay = async () => {
    const video = document.getElementById('backgroundVideo') as HTMLVideoElement;
    if (!video) return
    if (videoPlaying) {
      video.pause();
    } else {
      await video.play();
    }
    setVideoPlaying(!videoPlaying);
  };

  const { data: session } = useSession();

  if (session) {
    return (
      <Box className="p-2">
        <Home data={data} setSelectedKey={setSelectedKey} />
        <ScrollToTopButton />
      </Box>
    );
  }

  return (
    <div className="relative min-h-[93.3vh] overflow-hidden">
      <video id="backgroundVideo" loop className="absolute z-0 w-auto min-w-full min-h-full max-w-none" muted>
        <source src="/swarthmore.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[93.3vh] bg-black bg-opacity-50">
        <Tooltip title={videoPlaying ? "Pause background video" : "Play background video"} placement="top">
          <IconButton
            color="primary"
            aria-label={videoPlaying ? "Pause background video" : "Play background video"}
            onClick={toggleVideoPlay}
            className="absolute top-5 right-5 z-20 text-white">
            {videoPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
          </IconButton>
        </Tooltip>
        <div className="text-center p-4">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Swarthmore A11yGator</h1>
          <p className="text-white mb-4">Your hub for accessing remediated, accessible course documents at Swarthmore College.</p>
          <p className="text-white mb-6">Find accessible notes and materials, and enjoy reading in light or dark mode, enhancing your learning experience.</p>
          <Button variant="contained" onClick={() => signIn('google')} className="bg-white text-blue-500 hover:bg-gray-100 rounded-md">
            <Login className="mr-2" />
            Log In To Access
          </Button>
        </div>

        <Image src={SwarthmoreLogo} alt="Swarthmore Logo" width={200} height={100} className="my-4" />
        <div className="mt-6">
          {data.length === 0 && (
            <p className="text-xl text-white">
              No course documents available at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
